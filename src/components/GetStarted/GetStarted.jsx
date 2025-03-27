import React, { useState } from 'react';
import GoogleLogin from '../GoogleLogin/GoogleLogin'; // Correct import
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase'; // Your Firebase configuration file
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    if (isSignUp) {
      // Handle Sign Up logic
      if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
    

        // Store additional user information in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          isProfileComplete: false, // Set this to false for new users
          createdAt: new Date(),
        });
        navigate('/ProfileCompletion');
        console.log('User signed up and data stored in Firestore:', user);
      } catch (error) {
        console.error('Error signing up:', error.message);
        alert('Error signing up. Please try again.');
      }
    } else {
      // Handle Sign In logic
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check profile completion status in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === 'admin'){
            navigate('/AdminDashboard');
          }
          else if (userData.isProfileComplete) {
            navigate('/HomePage'); // Redirect to Dashboard if profile is complete
          } else {
            navigate('/ProfileCompletion'); // Redirect to Profile Completion if not complete
          }
        } else {
          console.error('User document does not exist!');
          alert('Error fetching user data. Please try again.');
        }
      } catch (error) {
        console.error('Error signing in:', error.message);
        alert('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg p-6 md:p-8 lg:p-10 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        {/* Sign Up / Sign In Toggle */}
        <div className="flex items-center justify-center mb-6">
          <button
            className={`mx-2 px-6 py-3 font-bold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSignUp ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
            }`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
          <button
            className={`mx-2 px-6 py-3 font-bold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !isSignUp ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
            }`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name Field for Sign Up */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1" htmlFor="name">
                Name
              </label>
              <input
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Confirm Password Field for Sign Up */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          {/* Submit Button */}
          <button
            className="w-full px-4 py-3 font-bold text-gray-100 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
            type="submit"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 text-gray-400">{isSignUp ? 'Or Register with' : 'Or Login with'}</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Google Login */}
        <div className="text-center">
          <GoogleLogin />
        </div>

        {/* Terms & Privacy Policy */}
        {isSignUp && (
          <div className="text-center text-sm text-gray-400">
            By signing up, you agree to our <strong className="text-indigo-400">Terms</strong>. See how we use your data in our{' '}
            <strong className="text-indigo-400">Privacy Policy</strong>. We never post to any social media.
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStarted;
