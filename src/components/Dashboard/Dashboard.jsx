import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import RatingModal from '../RatingModal';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [profilePicture, setProfilePicture] = useState("/assets/default1.png");
  const [isActive, setIsActive] = useState(false);
  const [selfDescription, setSelfDescription] = useState('');
  const [matchedUsers, setMatchedUsers] = useState(0);
  const [matchedUserProfiles, setMatchedUserProfiles] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadModalSkill, setUploadModalSkill] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  // Cloudinary Config
  const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dnjlyqvrx/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'skill-certificate';
  const CLOUDINARY_CLOUD_NAME = 'dnjlyqvrx';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.active === undefined) {
              await updateDoc(userDocRef, { active: true });
            }
            
            setUserDetails(data);
            setProfilePicture(data.profilePictureUrl || "/assets/default1.png");
            setIsActive(data.active ?? true);
            setSelfDescription(data.selfDescription || '');
            setMatchedUsers(data.matchedUsers || 0);
            setVerifiedSkills(data.verifiedSkills || {});

            // Fetch matched users' profile pictures
            if (data.matchedUserIds) {
              const matchedProfiles = await Promise.all(
                data.matchedUserIds.map(async (id) => {
                  const matchedUserRef = doc(db, 'users', id);
                  const matchedUserSnap = await getDoc(matchedUserRef);
                  return matchedUserSnap.exists() ? { uid: id, ...matchedUserSnap.data() } : null;
                })
              );
              setMatchedUserProfiles(matchedProfiles.filter(Boolean));
            }
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleActiveStatus = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { active: newStatus });
    }
  };

  const handleDescriptionChange = async (e) => {
    const newDescription = e.target.value;
    setSelfDescription(newDescription);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { selfDescription: newDescription });
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await setDoc(
        doc(db, 'users', user.uid),
        { profilePictureUrl: data.secure_url },
        { merge: true }
      );

      setProfilePicture(data.secure_url);
      setUserDetails((prev) => ({ ...prev, profilePictureUrl: data.secure_url }));
    } catch (error) {
      console.error('Error uploading profile picture:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openRatingModal = (user) => {
    setSelectedUser(user);
    setShowRatingModal(true);
  };

  if (!user || !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }
  const handleCertificateUpload = async () => {
    if (!certificateFile || !uploadModalSkill || !user) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', certificateFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload failed");

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        [`certificates.${uploadModalSkill}`]: { url: data.secure_url, status: 'pending' },
        [`verifiedSkills.${uploadModalSkill}`]: false // Mark as unverified until admin approval
      });

      setVerifiedSkills((prev) => ({ ...prev, [uploadModalSkill]: false }));
      setUploadModalSkill(null);
      setCertificateFile(null);
    } catch (error) {
      console.error('Error uploading certificate:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white px-6">
      <Sidebar />
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-teal-400">Dashboard</h1>
          <button onClick={handleLogout} className="text-sm font-semibold text-gray-300 hover:text-red-400">
            Logout
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          <label className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg cursor-pointer hover:bg-teal-400" htmlFor="profilePictureUpload">
            {isUploading ? 'Uploading...' : 'Change Profile Picture'}
          </label>
          <input id="profilePictureUpload" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-teal-400 mb-4">Verified Skills</h2>
          <div className="space-y-2">
            {Object.keys(verifiedSkills).length > 0 ? (
              Object.entries(verifiedSkills).map(([skill, isVerified]) => (
                <div key={skill} className="flex justify-between items-center bg-gray-700 p-2 rounded-lg">
                  <span className="text-white">{skill}</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-lg ${isVerified ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  {!isVerified && (
                    <button
                      onClick={() => setUploadModalSkill(skill)}
                      className="bg-teal-500 px-3 py-1 rounded-lg text-white text-sm hover:bg-teal-400"
                    >
                      Upload Certificate
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Certificate Upload Modal */}
        {uploadModalSkill && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold text-white mb-4">
                Upload Certificate for {uploadModalSkill}
              </h2>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setCertificateFile(e.target.files[0])}
                className="mb-4 text-white"
              />
              <button
                onClick={handleCertificateUpload}
                disabled={isUploading}
                className="bg-teal-500 px-4 py-2 rounded-lg text-white hover:bg-teal-400"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setUploadModalSkill(null)}
                className="ml-4 text-red-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="flex items-center gap-3" title="Should be kept ON to get match requests">
            <input
              type="checkbox"
              checked={isActive}
              onChange={toggleActiveStatus}
              className="w-5 h-5"
            />
            <span className="text-lg font-semibold">Active Status</span>
          </label>
        </div>

        <div className="mt-6">
          <label className="text-lg font-semibold text-teal-400">About Me</label>
          <textarea
            value={selfDescription}
            onChange={handleDescriptionChange}
            rows="4"
            placeholder="Write something about yourself..."
            className="w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
        </div>
        <div className="mt-6 mb-4 space-y-4">
  <h2 className="text-xl font-semibold text-teal-400 mb-8">Users Matched</h2>
  <p className="text-3xl font-bold text-green-400 ml-2">{matchedUsers}</p>

  <div className="relative mt-4 mb-4 flex items-center">
    {matchedUserProfiles.map((user, index) => (
      <img
        key={user.uid}
        src={user.profilePictureUrl || "/assets/default1.png"}
        alt={user.displayName || 'User'}
        className="ml-2 mt-8 mb-4 w-12 h-12 rounded-full cursor-pointer hover:scale-125 transition-transform duration-300"
        style={{
          position: 'absolute',
          left: `${index * 30}px`, // Adjust the overlap by changing this value
          zIndex: matchedUserProfiles.length - index, // Ensure correct stacking order
        }}
        onClick={() => openRatingModal(user)}
      />
    ))}
  </div>
</div>


        <button onClick={() => navigate('/HomePage')} className="mt-12 w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400">
          Find a Match
        </button>

      </div>

      {showRatingModal && (
        <RatingModal
          user={selectedUser}
          onClose={() => setShowRatingModal(false)}
          currentUserId={user.uid}
        />
      )}
    </div>
  );
};

export default Dashboard;
