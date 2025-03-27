import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const CertificateUploadModal = ({ skill, onClose, userId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        [`verifiedSkills.${skill}`]: false, // Mark as pending
      });
      alert(`${skill} certificate uploaded! Waiting for admin approval.`);
      onClose();
    } catch (error) {
      console.error('Error uploading certificate:', error);
    }
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-teal-400 mb-4">Upload Certificate for {skill}</h2>
        <button
          onClick={handleUpload}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-400"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={onClose} className="ml-4 text-gray-300 hover:text-white">Cancel</button>
      </div>
    </div>
  );
};

export default CertificateUploadModal;
