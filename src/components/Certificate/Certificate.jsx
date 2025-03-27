import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Certificate = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Cloudinary Upload Config
  const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dnjlyqvrx/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'skill-certificate';

  if (!user) {
    navigate('/');
  }

  useEffect(() => {
    const fetchSkills = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSkills(userData.possessedSkills || []);
      }
    };

    fetchSkills();
  }, [user]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !selectedSkill) {
      setUploadError('Please select a skill and upload a file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'auto'); // Allows both images & PDFs

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }

      const data = await response.json();
      let certificateUrl = data.secure_url;

      // Convert PDF to PNG for display
      if (file.type === 'application/pdf') {
        const publicId = data.public_id;
        certificateUrl = `https://res.cloudinary.com/dnjlyqvrx/image/upload/w_1000,f_png,pg_1/${publicId}`;
      }

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        let verifiedSkills = userData.verifiedSkills || {};
        let certificates = userData.certificates || {}; // Store multiple certificates

        // If `verifiedSkills` is empty, initialize all skills to false
        if (Object.keys(verifiedSkills).length === 0) {
          verifiedSkills = Object.fromEntries(skills.map(skill => [skill, false]));
        }

        // Mark the uploaded skill as "pending verification"
        verifiedSkills[selectedSkill] = false; // Admin will approve later

        // Store the uploaded certificate under the specific skill
        certificates[selectedSkill] = certificateUrl;

        await updateDoc(userDocRef, {
          certificates, // Store certificates as a map
          verifiedSkills,
        });

        alert(`Certificate for ${selectedSkill} uploaded successfully!`);
        navigate('/WaitingPage');
      }
    } catch (error) {
      setUploadError('Error uploading file. Please try again.');
      console.error('Upload Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-10 rounded-lg text-white relative w-full max-w-xl shadow-xl">
        
        {/* Close Button */}
        <button onClick={() => navigate('/')} className="absolute top-6 right-6 text-gray-400 hover:text-teal-400 transition-colors duration-300">
          <X size={28} />
        </button>

        {/* Upload Section */}
        <div className="flex flex-col items-center">
          <div className="p-8 border-4 border-dashed border-teal-500 rounded-full mb-6 hover:border-teal-400 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-teal-400 mb-6">Upload Certificate</p>

          {/* Skill Selection Dropdown */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none"
          >
            <option value="">Select Skill</option>
            {skills.map((skill, index) => (
              <option key={index} value={skill}>{skill}</option>
            ))}
          </select>

          {/* File Input */}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-gray-300 mb-6 cursor-pointer"
          />

          {/* Error Message */}
          {uploadError && <p className="text-red-500 text-sm mb-4">{uploadError}</p>}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors duration-300"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Certificate'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-gray-300 text-center leading-relaxed">
          <p className="mt-4">
            <span className="text-teal-400 font-semibold">Accepted certificates:</span>  
            Educational degrees, professional licenses, and skill-based certifications in PDF or image format.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
