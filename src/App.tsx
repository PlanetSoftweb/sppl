import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import Hostels from './components/Hostels';
import HostelDashboard from './components/HostelDashboard';
import AddHostel from './components/AddHostel';
import Login from './components/Login';
import PlayerRegistration from './components/PlayerRegistration';
import RegistrationSuccess from './components/RegistrationSuccess';
import ExpenseManager from './components/ExpenseManager';
import Matches from './components/Matches';
import { Building2, Home, Trophy, LogOut, Menu, X, DollarSign, Calendar } from 'lucide-react';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Public routes that don't require authentication
  const isPublicRoute = location.pathname.startsWith('/register/') || 
                       location.pathname === '/registration-success';

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/register/:linkId" element={<PlayerRegistration />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
                  <span className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Home
                  </span>
                </Link>
                <Link to="/hostels" className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hostels
                  </span>
                </Link>
                <Link to="/matches" className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Matches
                  </span>
                </Link>
                <Link to="/expenses" className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-orange-500"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 shadow-lg border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                <span className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Home
                </span>
              </Link>
              <Link
                to="/hostels"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Hostels
                </span>
              </Link>
              <Link
                to="/matches"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Matches
                </span>
              </Link>
              <Link
                to="/expenses"
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-orange-500 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        <div className="p-6">
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/hostel/:hostelId" element={<HostelDashboard />} />
            <Route path="/add-hostel" element={<AddHostel />} />
            <Route path="/expenses" element={<ExpenseManager />} />
            <Route path="/matches" element={<Matches />} />
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