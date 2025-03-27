import React, { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Reference the user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If user does not exist, create a new document with their name
        await setDoc(userDocRef, {
          name: user.displayName,  // Set name from Google profile
          email: user.email,
          profilePictureUrl: user.photoURL || "", // Save profile picture if available
          isProfileComplete: false, // Default to false for new users
          createdAt: new Date(),
        });
      }

      // Fetch user data after ensuring document exists
      const userData = (await getDoc(userDocRef)).data();
      const userRole = userData.role || 'user';

      if (userRole === 'admin') {
        navigate('/AdminDashboard');
        return;
      }

      if (userData.isProfileComplete) {
        navigate('/HomePage');
      } else {
        navigate('/ProfileCompletion');
      }
    } catch (error) {
      console.error('Error logging in with Google:', error.message);
      if (error.code !== 'auth/cancelled-popup-request') {
        alert('Failed to log in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const checkProfileCompletion = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isProfileComplete) {
          navigate('/Homepage');
        } else {
          navigate('/ProfileCompletion');
        }
      }
    };

    checkProfileCompletion();
  }, [navigate]);

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`w-full px-4 py-2 flex gap-2 justify-center items-center font-bold text-base text-black bg-gray-100 rounded-lg ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      {loading ? 'Loading...' : <><FcGoogle /> Continue with Google</>}
    </button>
  );
};

export default GoogleLogin;
