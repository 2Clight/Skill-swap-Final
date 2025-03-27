import React, { useEffect, useState } from "react";
import { Home, Map, Book, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion} from "framer-motion";


const Sidebar = () => {
    const logo = "/assets/logo.png";
    const navigate = useNavigate();
   const [chatPath, setChatPath] = useState("/chat");
    const auth = getAuth();
  
    useEffect(() => {
      const fetchFirstChat = async () => {
        if (!auth.currentUser) return;
  
        const userId = auth.currentUser.uid;
        const q = query(collection(db, "chats"), where("users", "array-contains", userId));
        const snapshot = await getDocs(q);
  
        if (!snapshot.empty) {
          const firstChat = snapshot.docs[0].id;
          setChatPath(`/chat/${firstChat}`);
        }
      };
  
      fetchFirstChat();
    }, [auth.currentUser]);
  
    const links = [
      { icon: Home, label: "Home", path: "/HomePage" },
      { icon: Map, label: "Explore", path: "/Explore" },
      { icon: Book, label: "Dashboard", path: "/Dashboard" },
      { icon: MessageCircle, label: "Chat", path: chatPath },
    ];
    const [isHovered, setIsHovered] = useState(false);
  
    return (
      <motion.aside
        className="fixed left-0 top-0 h-full bg-gray-800 text-white flex flex-col items-start p-4 pt-4 space-y-6 z-[1000]"
        initial={{ width: "4rem" }}
        whileHover={{ width: "12rem" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4 cursor-pointer p-2 rounded-lg" onClick={() => navigate("/HomePage")}>
          <img src={logo} alt="Skill Swap" className="w-11 h-11 -translate-x-2" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            Skill Swap
          </motion.span>
        </div>
  
        {links.map((link, index) => (
          <div
            key={index}
            className="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-teal-500/40" onClick={() => navigate(link.path)}
          >
            <link.icon size={28} />
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {link.label}
            </motion.span>
          </div>
        ))}
      </motion.aside>
    );
  };
export default Sidebar;
