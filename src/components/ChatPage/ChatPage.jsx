import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  orderBy,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  increment,
  arrayUnion,
  limit,
} from "firebase/firestore";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Sidebar from "../Sidebar";

import { motion } from "framer-motion";


const ChatPage = () => {
  const { chatId: initialChatId } = useParams();
  const auth = getAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(initialChatId);

  const defaultProfile = "/assets/default1.png"; // Accessing from the public folder
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchChatsWithLastMessage = async () => {
      const q = query(collection(db, "chats"), where("users", "array-contains", auth.currentUser.uid));
      const chatSnapshot = await getDocs(q);

      const chatList = await Promise.all(
        chatSnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const otherUserId = chatData.users.find((id) => id !== auth.currentUser.uid);

          // Fetch other user's info
          const userDoc = await getDoc(doc(db, "users", otherUserId));
          const userName = userDoc.exists() ? userDoc.data().profileName : "Unknown";
          const userProfilePicture = userDoc.exists() && userDoc.data().profilePictureUrl
            ? userDoc.data().profilePictureUrl
            : defaultProfile;
          const isFullyBooked = userDoc.exists() && (userDoc.data().matchedUsers || 0) >= 2;

          // Fetch last message in the chat
          const messagesRef = collection(chatDoc.ref, "messages");
          const lastMessageQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
          const lastMessageSnapshot = await getDocs(lastMessageQuery);

          const lastMessage = lastMessageSnapshot.docs.length > 0
            ? lastMessageSnapshot.docs[0].data().text
            : "No messages yet";

          return {
            id: chatDoc.id,
            name: userName,
            profilePictureUrl: userProfilePicture,
            lastMessage,
            isFullyBooked,
          };
        })
      );

      setChats(chatList);

      // Automatically set the first chat as active if none is selected
      if (!activeChat && chatList.length > 0) {
        setActiveChat(chatList[0].id);
      }
    };

    fetchChatsWithLastMessage();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!activeChat) return;

    const chatRef = doc(db, "chats", activeChat);
    const messagesRef = collection(chatRef, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!activeChat) return;

      const chatRef = doc(db, "chats", activeChat);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const userIds = chatSnap.data().users;
        const userDetailsData = {};

        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userDetailsData[userId] = {
              name: userDoc.data().profileName,
              profilePictureUrl: userDoc.data().profilePictureUrl || defaultProfile,
            };
          }
        }
        setUserDetails(userDetailsData);
      }
    };
    fetchUserDetails();
  }, [activeChat]);

  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const chatRef = doc(db, "chats", activeChat);
    const messagesRef = collection(chatRef, "messages");
    await addDoc(messagesRef, {
      senderId: auth.currentUser.uid,
      text: message,
      timestamp: new Date(),
    });
    setMessage("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };
  // Add this function to handle sending match requests
  const sendMatchRequest = async () => {
    if (!activeChat) return;
  
    const chatRef = doc(db, "chats", activeChat);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) return;

    const chatData = chatSnap.data();
    const messagesRef = collection(chatRef, "messages");

    if (chatData.matchRequestSent) {
      // Prevent spam - show popup
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000); // Hide after 4 sec
      return;
    }
  
    await addDoc(messagesRef, {
      senderId: auth.currentUser.uid,
      text: "🔔 Match request sent! Approve or reject below.",
      timestamp: new Date(),
      systemMessage: true, // Ensure this is included
    });
    await updateDoc(chatRef, {
      matchRequestSent: true,
    });
  };
  
  const handleMatchResponse = async (response) => {
    if (!activeChat) return;
  
    const chatRef = doc(db, "chats", activeChat);
    const messagesRef = collection(chatRef, "messages");
    const chatSnap = await getDoc(chatRef);
  
    if (!chatSnap.exists()) return;
  
    const { users } = chatSnap.data();
    const otherUserId = users.find((id) => id !== auth.currentUser.uid);
  
    // Send match status message
    await addDoc(messagesRef, {
      senderId: auth.currentUser.uid,
      text: response === "approve" ? "✅ Match request approved!" : "❌ Match request rejected.",
      timestamp: new Date(),
      systemMessage: true,
    });
  
    if (response === "approve") {
      // If approved, update both users' matchedUsers field
      const currentUserRef = doc(db, "users", auth.currentUser.uid);
      const otherUserRef = doc(db, "users", otherUserId);
  
      // Helper function to update matchedUsers and matchedUserIds
      const updateMatchedUsers = async (userRef, targetUserId) => {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
  
          // Check if the other user's ID is already in matchedUserIds
          const matchedUserIds = userData.matchedUserIds || [];
  
          if (!matchedUserIds.includes(targetUserId)) {
            await updateDoc(userRef, {
              matchedUsers: (userData.matchedUsers || 0) + 1,
              matchedUserIds: arrayUnion(targetUserId), // Add other user's ID
            });
          }
        } else {
          // Create if it doesn't exist and initialize matchedUsers and matchedUserIds
          await setDoc(userRef, {
            matchedUsers: 1,
            matchedUserIds: [targetUserId],
          }, { merge: true });
        }
      };
  
      // Update both users
      await Promise.all([
        updateMatchedUsers(currentUserRef, otherUserId),
        updateMatchedUsers(otherUserRef, auth.currentUser.uid),
      ]);
    }
  };
  




  return (
    <div className="bg-gray-900 text-white min-h-screen flex">
      <Sidebar/>
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #ffff;
            border-radius: 4px;
          }
        `}
      </style>

      {/* Sidebar for chat list */}
      <div className="ml-20 w-1/4 bg-gray-800 p-4 flex flex-col h-screen">
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed top-10 right-0 transform -translate-x-1/2 bg-red-500 text-white p-4 z-10 rounded-lg shadow-lg"
        >
          🚫 Match Request Already Sent!
        </motion.div>
      )}
  <h2 className="text-xl font-bold text-teal-400 mb-4">Your Chats</h2>

  <div className="flex-grow overflow-y-auto space-y-3">
    {chats.map((chat) => (
      <div
        key={chat.id}
        className={`p-3 cursor-pointer rounded-lg flex items-center gap-3 ${
          activeChat === chat.id ? "bg-teal-500" : "bg-gray-700"
        }`}
        onClick={() => setActiveChat(chat.id)}
      >
        <img
          src={chat.profilePictureUrl}
          alt={chat.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
        <p className="flex items-center">
          {chat.name} 
          {chat.isFullyBooked && (
            <span className="ml-2 text-[8px] bg-red-500 text-white px-2 py-[1px] rounded-full">
              Fully Booked
            </span>
          )}
        </p>
        <p className="text-xs text-gray-200">{chat.lastMessage}</p>
        </div>
      </div>
    ))}
  </div>

  <Button onClick={handleLogout} className="bg-red-500 text-white w-full mt-4">
    Logout
  </Button>
</div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col items-center p-6">
        <Card className="bg-gray-800 shadow-lg w-full max-w-6xl p-4 flex flex-col h-[92vh]">
        <div className="flex flex-col items-center mb-4 relative">
  {/* Informational Box */}
  <div className="bg-gray-700 text-white rounded-lg p-3 w-3/4 text-center shadow-md">
    <p className="text-sm">
      <strong>What is a Match Request?</strong><br />
      Sending a match request notifies the other user that you'd like to officially connect and collaborate. If they accept, you'll become official skill-swap partners!
    </p>
  </div>

  {/* Send Match Request Link */}
  <p
    onClick={sendMatchRequest}
    className="text-teal-400 mt-2 text-xs cursor-pointer hover:underline"
  >
    Send match request
  </p>
</div>


<CardContent className="overflow-y-auto h-[75vh] flex flex-col gap-2 pr-2">
  {messages.map((msg) => {
    const isCurrentUser = msg.senderId === auth.currentUser.uid;
    const isMatchRequest =
      msg.systemMessage && msg.text.includes("Match request sent");

    return (
      <div key={msg.id} className="flex flex-col">
        {/* Message Bubble */}
        <div
          className={`p-3 rounded-lg max-w-xs flex items-center gap-3 ${
            isCurrentUser
              ? "bg-teal-500 text-white self-end"
              : "bg-gray-700 text-white self-start"
          }`}
        >
          {!isCurrentUser && (
            <img
              src={userDetails[msg.senderId]?.profilePictureUrl}
              alt={userDetails[msg.senderId]?.name || "Unknown"}
              className="w-8 h-8 rounded-full"
            />
          )}

          <div>
            <p className="text-sm text-gray-300">
              {userDetails[msg.senderId]?.name || "Unknown"}
            </p>
            <p className="text-sm">{msg.text}</p>
          </div>
        </div>

        {/* ✅ Approve/Reject Boxes - Below the Request Message */}
        {!isCurrentUser && isMatchRequest && (
          <div className="flex gap-4 mt-2 w-full max-w-xs self-start mb-4">
            <button
              onClick={() => handleMatchResponse("approve")}
              className="flex-1 px-4 py-2 rounded-lg bg-opacity-10 bg-white text-green-400 hover:bg-opacity-30 transition duration-300 backdrop-blur-md"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleMatchResponse("reject")}
              className="flex-1 px-4 py-2 rounded-lg bg-opacity-10 bg-white text-red-400 hover:bg-opacity-30 transition duration-300 backdrop-blur-md"
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    );
  })}
</CardContent>


          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-gray-700 text-white"
              placeholder="Type a message..."
            />
            <Button
              onClick={sendMessage}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
