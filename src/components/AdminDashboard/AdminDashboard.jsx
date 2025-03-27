import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApproval = async (userId, approved, userCertificates, possessedSkills) => {
    try {
      const userDoc = doc(db, 'users', userId);
  
      // If approving, update verifiedSkills based on possessed skills and certificates
      let updatedFields = { approved };
      if (approved) {
        const verifiedSkills = {};
  
        // Set true for skills with certificates, false for others
        possessedSkills.forEach(skill => {
          verifiedSkills[skill] = userCertificates?.[skill] ? true : false;
        });
  
        updatedFields.verifiedSkills = verifiedSkills;
      }
  
      await updateDoc(userDoc, updatedFields);
      alert(`User ${approved ? 'approved' : 'approval undone'} successfully!`);
  
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, approved, verifiedSkills: approved ? updatedFields.verifiedSkills : user.verifiedSkills }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating approval status:', error.message);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const userDoc = doc(db, 'users', userId);
      await deleteDoc(userDoc);
      alert('User deleted successfully!');
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };
  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      const usersCollection = await getDocs(collection(db, 'users'));
      const pendingRequests = [];

      usersCollection.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.certificates) {
          Object.entries(userData.certificates).forEach(([skill, certData]) => {
            if (certData.status === 'pending') {
              pendingRequests.push({
                userId: userDoc.id,
                username: userData.name || "Unknown",
                email: userData.email || "No Email",
                skill,
                certificateUrl: certData.url,
              });
            }
          });
        }
      });

      setVerificationRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
    }
  };

  const handleVerify = async (userId, skill) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`verifiedSkills.${skill}`]: true,
        [`certificates.${skill}.status`]: "approved",
      });

      setVerificationRequests((prev) =>
        prev.filter((req) => req.userId !== userId || req.skill !== skill)
      );
    } catch (error) {
      console.error("Error approving skill verification:", error);
    }
  };

  const handleRejection = async (userId, skill) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`certificates.${skill}`]: null, // Remove rejected certificate
      });

      setVerificationRequests((prev) =>
        prev.filter((req) => req.userId !== userId || req.skill !== skill)
      );
    } catch (error) {
      console.error("Error rejecting skill verification:", error);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className='flex gap-4'>
        {/* Bell Icon */}
        <button onClick={() => setShowModal(true)} className="relative">
            <FaBell className="text-2xl text-white hover:text-teal-400" />
            {verificationRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {verificationRequests.length}
              </span>
            )}
          </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
        </div>
      </div>
      
          

        
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold text-white mb-4">Skill Verification Requests</h2>
              
              {verificationRequests.length > 0 ? (
                verificationRequests.map((request, index) => (
                  <div key={index} className="bg-gray-700 p-3 mb-2 rounded-lg">
                    <p className="text-white font-semibold">{request.username}</p>
                    <p className="text-gray-400 text-sm">{request.email}</p>
                    <p className="text-teal-400 font-semibold">{request.skill}</p>
                    <a href={request.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm">
                      View Certificate
                    </a>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleVerify(request.userId, request.skill)}
                        className="bg-green-500 px-3 py-1 rounded-lg text-white text-sm hover:bg-green-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejection(request.userId, request.skill)}
                        className="bg-red-500 px-3 py-1 rounded-lg text-white text-sm hover:bg-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No pending requests.</p>
              )}

              <button onClick={() => setShowModal(false)} className="mt-4 text-red-400">
                Close
              </button>
            </div>
          </div>
        )}
        

      <div className="p-4">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            {/* Pending Users */}
            <h2 className="text-xl font-semibold mb-2">Pending Users</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 p-2">Name</th>
                  <th className="border-b border-gray-700 p-2">Email</th>
                  <th className="border-b border-gray-700 p-2">Skill & Certificate</th> {/* Updated Column */}
                  <th className="border-b border-gray-700 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(user => !user.approved).map(user => (
                  <tr key={user.id} className="hover:bg-gray-800">
                    <td className="p-2 border-b border-gray-700">{user.name || 'N/A'}</td>
                    <td className="p-2 border-b border-gray-700">{user.email}</td>
                    <td className="p-2 border-b border-gray-700">
                      {user.certificates && Object.keys(user.certificates).length > 0 ? (
                        Object.entries(user.certificates).map(([skill, certUrl]) => (
                          <div key={skill} className="mb-1">
                            <span className="text-teal-300">{skill}:</span>{' '}
                            <a href={certUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                              View Certificate
                            </a>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">No Certificate</span>
                      )}
                    </td>
                    <td className="p-2 border-b border-gray-700 flex gap-2">
                      <button
                        onClick={() => handleApproval(user.id, true, user.certificates, user.possessedSkills)}
                        className={`px-2 py-1 rounded ${user.certificates ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'}`}
                        disabled={!user.certificates}
                      >
                        Approve
                      </button>


                      <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">Reject</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 px-2 py-1 rounded hover:bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Approved Users */}
            <h2 className="text-xl font-semibold mt-6 mb-2">Approved Users</h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-gray-700 p-2">Name</th>
                    <th className="border-b border-gray-700 p-2">Email</th>
                    <th className="border-b border-gray-700 p-2">Verified Certificates</th>
                    <th className="border-b border-gray-700 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(user => user.approved).map(user => (
                    <tr key={user.id} className="hover:bg-gray-800">
                      <td className="p-2 border-b border-gray-700">{user.name || 'N/A'}</td>
                      <td className="p-2 border-b border-gray-700">{user.email}</td>
                      <td className="p-2 border-b border-gray-700">
                        {user.verifiedSkills && Object.keys(user.verifiedSkills).length > 0 ? (
                          Object.entries(user.verifiedSkills).map(([skill, isVerified]) =>
                            isVerified && user.certificates?.[skill] ? (
                              <div key={skill}>
                                <a 
                                  href={user.certificates[skill]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-teal-400 hover:underline"
                                >
                                  {skill} Certificate
                                </a>
                              </div>
                            ) : null
                          )
                        ) : (
                          <span className="text-gray-400">No Verified Certificates</span>
                        )}
                      </td>
                      <td className="p-2 border-b border-gray-700 flex gap-2">
                        <button 
                          onClick={() => handleApproval(user.id, false)} 
                          className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                        >
                          Undo Approval
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
