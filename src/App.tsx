import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import HostelList from './components/HostelList';
import HostelDashboard from './components/HostelDashboard';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <div className="min-h-screen bg-gray-900">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/hostels" element={<HostelList />} />
                      <Route path="/hostels/:hostelId" element={<HostelDashboard />} />
                    </Routes>
                  </main>
                </div>
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;