import React, { useEffect, useState } from "react";
import { doc, collection, getDocs, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { db, auth } from "./firebase";
import { Button } from "../components/ui/button";


import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";


const UserDetailModal = ({ user, onClose }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);

  if (!user) return null;

  const {
    profileName,
    verifiedSkills = [],
    possessedSkills = [],
    skillsToLearn = [],
    selfDescription = "No description available.",
    country = "Unknown",
    languages,
    profilePictureUrl = "/assets/default1.png",
    id: uid,
  } = user;

  useEffect(() => {
    const fetchActivityStatus = async () => {
      if (!uid) return;
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setIsOnline(userDoc.data().active || false);
        }
      } catch (error) {
        console.error("Error fetching activity status:", error);
      }
    };

    fetchActivityStatus();
  }, [uid]);


  useEffect(() => {
    console.log("User object received:", user);
    console.log("User UID:", uid);
  
    const fetchUserRating = async () => {
        try {
          if (!uid) {
            console.warn("No user ID provided");
            return;
          }
      
          const ratingsRef = collection(doc(db, "users", uid), "ratings");
          const snapshot = await getDocs(ratingsRef);
      
          console.log("Ratings snapshot:", snapshot); // Log full snapshot for inspection
      
          if (snapshot.empty) {
            console.log("No ratings found for user:", uid);
            return;
          }
      
          // Log each document to check their structure
          snapshot.docs.forEach((doc) => console.log("Rating Document:", doc.data()));
      
          const ratings = snapshot.docs.map((doc) => doc.data().rating);
      
          if (ratings.length === 0) {
            console.warn("No valid ratings found.");
            return;
          }
      
          // Calculate the average rating
          const total = ratings.reduce((acc, val) => acc + val, 0);
          setAverageRating((total / ratings.length).toFixed(1));
          setRatingCount(ratings.length);
        } catch (error) {
          console.error("Error fetching ratings:", error);
        }
      };
      
  
    fetchUserRating();
  }, [uid]);
  const handleConnect = async (otherUserId) => {
    try {
      if (!auth.currentUser) {
        alert("Please log in to connect.");
        return;
      }
  
      const currentUserId = auth.currentUser.uid;
      const chatId = [currentUserId, otherUserId].sort().join("_");
  
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
  
      // Create a new chat if it doesn't exist
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          users: [currentUserId, otherUserId],
          createdAt: serverTimestamp(),
        });
      }
  
      // Redirect to the chat page
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error connecting with user:", error);
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        
        {/* Close Icon (Top-Right) */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white text-2xl hover:text-red-500"
        >
          &times;
        </button>
         <div className="flex items-center mb-4">
          <img
            src={profilePictureUrl}
            alt={profileName}
            className="w-16 h-16 rounded-full mr-4"
          />
          <h2 className="text-2xl font-semibold">{profileName}</h2>
          <p className={isOnline ? "text-green-400 text-xs" : "text-gray-400 text-xs"}>
              {isOnline ? "Online" : "Offline"}
            </p>
        </div>

        <p className="mb-4 text-sm">{selfDescription}</p>

        <div className="mb-4">
          <h3 className="text-lg text-teal-400 font-semibold mb-2">
            Skills verified:
          </h3>
          <div className="flex flex-wrap gap-2">
  {Object.keys(verifiedSkills).filter(skill => verifiedSkills[skill]).length > 0 ? (
    Object.keys(verifiedSkills)
      .filter(skill => verifiedSkills[skill]) // Get only verified skills
      .map((skill, index) => (
        <span key={index} className="bg-teal-500 px-3 py-1 rounded-lg text-sm">
          {skill}
        </span>
      ))
  ) : (
    <p>No skills listed.</p>
  )}
</div>

        </div>

        <div className="mb-4">
          <h3 className="text-lg text-teal-400 font-semibold mb-2">
            Skills to Learn:
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillsToLearn.length > 0 ? (
              skillsToLearn.map((skill, index) => (
                <span
                  key={index}
                  className="bg-purple-500 px-3 py-1 rounded-lg text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p>No learning goals specified.</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-teal-400 font-semibold">Country:</h3>
          <p>{country}</p>
        </div>

        <div className="mb-4">
  <h3 className="text-lg text-teal-400 font-semibold">Languages:</h3>
  {languages.length > 0 ? (
    <ul className="list-disc list-inside">
      {languages
        .split(/[, ]+/) // Split by comma, space, or both very useful stuff
        .map((lang) => lang.trim()) // Remove any extra whitespace
        .filter((lang) => lang) // Ensure no empty entries
        .map((lang, index) => (
          <li key={index}>
            {lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()}
          </li>
        ))}
    </ul>
  ) : (
    <p>Not specified</p>
  )}
</div>


        <div className="mb-4">
          <h3 className="text-lg text-teal-400 font-semibold">Rating:</h3>
          {ratingCount > 0 ? (
            <p>{averageRating} ⭐ ({ratingCount} Ratings)</p>
          ) : (
            <p>No ratings yet</p>
          )}
        </div>
<div className="flex gap-4">
  
          <Button
            onClick={onClose} variant="red1"
            className="bg-red-500 hover:bg-red-600 text-white mt-4"
          >
            Close
          </Button>
          <Button onClick={() => handleConnect(uid)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 mt-4">
                              Connect
                            </Button>
</div>
      </div>
    </div>
  );
};

export default UserDetailModal;
