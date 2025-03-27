import React, { useState } from 'react';
import { db } from './firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { FaStar } from 'react-icons/fa';

const RatingModal = ({ user, onClose, currentUserId }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRating = async () => {
    if (!rating) return alert('Please select a rating!');

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const ratingsRef = collection(userRef, 'ratings');

      await addDoc(ratingsRef, {
        ratedBy: currentUserId,
        rating,
        timestamp: new Date(),
      });

      alert('Rating submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white">
        <h2 className="text-2xl font-semibold mb-4 text-teal-400">Rate {user.displayName}</h2>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.profilePictureUrl || "/assets/default1.png"}
            alt={user.displayName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <p>{user.profileName || 'User'}</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer transition-transform ${star <= rating ? 'text-yellow-400' : 'text-gray-500'} hover:scale-125`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500">Cancel</button>
          <button
            onClick={handleRating}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
