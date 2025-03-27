import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GetStarted from './components/GetStarted/GetStarted';
import LandingPage from './components/LandingPage/LandingPage';
import ProfileCompletion from './components/ProfileCompletion/ProfileCompletion';  // Import ProfileCompletion
import Dashboard from './components/Dashboard/Dashboard';  // Import Dashboard
import AdminDashboard from './components/AdminDashboard/AdminDashboard';  // Import AdminDashboard
import Certificate from './components/Certificate/Certificate';  // Import Certificate
import WaitingPage from './components/WaitingPage/WaitingPage';  // Import WaitingPage
import HomePage from './components/HomePage/HomePage';  // Import HomePage
import ChatPage from './components/ChatPage/ChatPage';  // Import ChatPage


import Explore from './components/Explore/Explore';  // Import Explore


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route exact path="/GetStarted" element={<GetStarted />} />
        <Route exact path="/ProfileCompletion" element={<ProfileCompletion />} />
        <Route exact path="/Dashboard" element={<Dashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} /> 
        <Route path="/Certificate" element={<Certificate />} /> 
        <Route path="/WaitingPage" element={<WaitingPage />} /> 
        <Route path="/HomePage" element={<HomePage />} /> 
        <Route path="//chat/:chatId" element={<ChatPage />} /> 
        <Route path="/Explore" element={<Explore />} /> 
      </Routes>
    </Router>
  );
}

export default App;
