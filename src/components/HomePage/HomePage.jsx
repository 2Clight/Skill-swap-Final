import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import UserDetailModal from "../UserDetailModal";

const HomePage = () => {
  const [userData, setUserData] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); 
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);
        fetchRecommendedUsers(userData, user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper function to normalize case
  const toLowerCaseArray = (arr) => (arr || []).map((item) => item.toLowerCase());

  const fetchRecommendedUsers = async (currentUser, userId) => {
    if (!currentUser.possessedSkills || !currentUser.skillsToLearn) return;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("approved", "==", true));
      const querySnapshot = await getDocs(q);

      const currentUserPossessedSkills = toLowerCaseArray(currentUser.possessedSkills);
      const currentUserSkillsToLearn = toLowerCaseArray(currentUser.skillsToLearn);

      const matchedUsers = [];

      querySnapshot.forEach((doc) => {
        const otherUser = doc.data();
        if (doc.id !== userId) {
          const otherUserPossessedSkills = toLowerCaseArray(otherUser.possessedSkills);
          const otherUserSkillsToLearn = toLowerCaseArray(otherUser.skillsToLearn);

          // Log for debugging
          console.log("🔍 Matching Process:");
          console.log("Current User:", currentUser.profileName);
          console.log("Skills to Learn (Current User):", currentUserSkillsToLearn);
          console.log("Possessed Skills (Current User):", currentUserPossessedSkills);
          console.log("Other User:", otherUser.profileName);
          console.log("Skills to Learn (Other User):", otherUserSkillsToLearn);
          console.log("Possessed Skills (Other User):", otherUserPossessedSkills);

          // Check for bidirectional match
          const mutualMatch =
            otherUserPossessedSkills.some((skill) => currentUserSkillsToLearn.includes(skill)) &&
            currentUserPossessedSkills.some((skill) => otherUserSkillsToLearn.includes(skill));

          if (mutualMatch) {
            matchedUsers.push({ id: doc.id, ...otherUser });
          }
        }
      });

      console.log("✅ Matched Users:", matchedUsers);
      setRecommendedUsers(matchedUsers);
    } catch (error) {
      console.error("Error fetching recommended users:", error);
    }
  };

  const handleConnect = async (otherUserId) => {
    if (!auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const chatId = [currentUserId, otherUserId].sort().join("_");

    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        users: [currentUserId, otherUserId],
        createdAt: serverTimestamp(),
      });
    }

    navigate(`/chat/${chatId}`);
  };

  const handleEdit = () => navigate("/dashboard");

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center">
      
      <Sidebar />
      
      <Button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 self-end mr-4 mt-4">
        Logout
      </Button>

      <header className="text-center py-12">
      
        <h1 className="text-4xl font-bold text-teal-400">Swap Skills, Grow Together</h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Skill Swap is the ultimate platform to exchange knowledge, connect with talented individuals, and learn something new.
        </p>
      </header>

      {userData && (
        <section className="w-full max-w-4xl p-6">
          <Card className="bg-gray-800 shadow-lg">
            <CardContent className="flex flex-col md:flex-row items-center gap-6 p-4">
              <img
                src={userData.profilePictureUrl || "/assets/default1.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-teal-400"
              />
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-semibold text-teal-400">Welcome back, {userData.profileName}!</h2>
                <p className="text-gray-300 mt-2">{userData.possessedSkills?.join(", ") || "Not specified"}</p>
                <p className="text-gray-300">Wants to learn: {userData.skillsToLearn?.join(", ") || "Not specified"}</p>
                <div className="flex items-center gap-1 mt-4 text-yellow-400">
                <div className="px-5 py-2 rounded-2xl bg-purple-600 text-white font-bold text-lg shadow-md">
                Programming
            </div>
                </div>
              </div>
              <Button onClick={handleEdit} variant="outline" className="border-teal-400 text-teal-400 hover:bg-teal-500 hover:text-white">
                Edit Profile
              </Button>
              
            </CardContent>
          </Card>
        </section>
      )}

      <section className="w-full max-w-4xl p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">Find Skill Swap Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedUsers.length > 0 ? (
            recommendedUsers.map((user) => (
              <Card key={user.id} className="bg-gray-800 shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <img
                    src={user.profilePictureUrl || "/assets/default1.png"}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-teal-300">{user.profileName}</h3>
                    <p className="text-gray-300">Wants to learn: {user.skillsToLearn?.join(", ") || "Not specified"}</p>
                  </div>
                  <div className="flex flex-col gap-3 ">
                  <Button onClick={() => handleConnect(user.id)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600">
                    Connect
                  </Button>
                  <Button variant="secondary"  onClick={() => setSelectedUser(user)}>Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-300">No matches found yet. Keep updating your skills!</p>
          )}
        </div>
      </section>
       {/* User Detail Modal */}
       {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default HomePage;
