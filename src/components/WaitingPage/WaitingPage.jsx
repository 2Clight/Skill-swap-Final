import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const slides = [
  {
    id: 1,
    text: "Step 1: Upload your certificate and wait for admin approval.",
  },
  {
    id: 2,
    text: "Step 2: Once approved, start swapping skills with others!",
  },
  {
    id: 3,
    text: "Step 3: Grow your skills by learning from the community.",
  },
];

const WaitingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [status, setStatus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Set up real-time listener for approval status
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();

        if (userData.approved) {
          setStatus('approved');
          setShowPopup(true);
          setTimeout(() => navigate('/HomePage'), 6000);
        } else if (userData.rejected) {
          setStatus('rejected');
          setShowPopup(true);
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6 text-center">
      <h1 className="text-2xl font-bold text-teal-400 mb-4">Waiting for Approval</h1>
      <p className="mb-6 text-gray-300">Your certificate is under review. This process may take a few minutes.</p>
      
      <motion.div
        key={slides[currentSlide].id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md"
      >
        <p className="text-teal-300">{slides[currentSlide].text}</p>
      </motion.div>

      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-10 right-10 ${
            status === 'approved' ? 'bg-green-500' : 'bg-red-500'
          } text-white p-4 rounded-lg shadow-lg`}
        >
          {status === 'approved'
            ? 'Your certificate has been approved! Redirecting...'
            : 'Your certificate has been rejected. Please contact support.'}
        </motion.div>
      )}
    </div>
  );
};

export default WaitingPage;
