import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "../../components/ui/button";
import "leaflet/dist/leaflet.css";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import L from "leaflet";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import '../custom.css'

const Explore = () => {
  const [userLocations, setUserLocations] = useState([]);
  const [userPosition, setUserPosition] = useState([20, 0]);
  const auth = getAuth();
  const navigate = useNavigate();
  

  
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
  

  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        const locations = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.latitude && user.longitude);

        setUserLocations(locations);
      } catch (error) {
        console.error("Error fetching user locations:", error);
      }
    };

    const updateUserLocation = () => {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log("User location:", latitude, longitude);
              setUserPosition([latitude, longitude]);

              const user = auth.currentUser;
              if (user) {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { latitude, longitude });
                console.log("User location updated in Firestore");
              }
            } catch (error) {
              console.error("Error updating user location:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    fetchUserLocations();
    const stopWatching = updateUserLocation();

    return () => stopWatching && stopWatching();
  }, [auth]);

  const createCustomIcon = (profilePictureUrl) => {
    return new L.Icon({
      iconUrl: profilePictureUrl || "/default1.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      className: "rounded-full",
    });
  };

  const PanToUser = () => {
    const map = useMap();

    useEffect(() => {
      map.setView(userPosition, 12);
    }, [userPosition, map]);

    return null;
  };

  return (
    <div className="h-screen w-full">
      <Sidebar/>
      <MapContainer center={userPosition} zoom={12} className="h-full w-full ">
      
        <PanToUser />
        <TileLayer
          attribution='&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>'
          url="https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=8af723af73f244c299e61dcd38d5d477"
          lang="en"
        />

        {userLocations.map((user) => (
          <Marker
            key={user.id}
            position={[user.latitude, user.longitude]}
            icon={createCustomIcon(user.profilePictureUrl)}
          >
            <Popup>
              <div>
                <img
                  src={user.profilePictureUrl || "/default1.png"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
                <h3 className="font-semibold">{user.profileName}</h3>
                <p>{user.country}</p>
                <p>Skills: {user.possessedSkills?.join(", ") || "N/A"}</p>
                <Button onClick={() => handleConnect(user.id)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600">
                                    Connect
                                  </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Explore;
