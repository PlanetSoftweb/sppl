import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import Hostels from './components/Hostels';
import HostelDashboard from './components/HostelDashboard';
import AddHostel from './components/AddHostel';
import Login from './components/Login';
import PlayerRegistration from './components/PlayerRegistration';
import RegistrationSuccess from './components/RegistrationSuccess';
import { Building2, Home, Trophy, LogOut } from 'lucide-react';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Public routes that don't require authentication
  if (window.location.pathname.startsWith('/register/') || 
      window.location.pathname === '/registration-success') {
    return (
      <Routes>
        <Route path="/register/:linkId" element={<PlayerRegistration />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
      </Routes>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-orange-500" />
                <span className="ml-2 text-xl font-bold text-white">Sports Manager</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  <Home className="h-5 w-5 md:hidden" />
                  <span>Home</span>
                </Link>
                <Link to="/hostels" className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  <Building2 className="h-5 w-5 md:hidden" />
                  <span>Hostels</span>
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-orange-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="p-6">
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/hostel/:hostelId" element={<HostelDashboard />} />
            <Route path="/add-hostel" element={<AddHostel />} />
            <Route path="/register/:linkId" element={<PlayerRegistration />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;