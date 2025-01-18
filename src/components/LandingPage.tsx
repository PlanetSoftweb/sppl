import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, DollarSign, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 font-poppins">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 backdrop-blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sports Event Manager
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Streamline your sports events management with our comprehensive platform for hostels and institutions
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-xl hover:shadow-orange-500/20"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-xl border border-gray-700/50">
            <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Team Management</h3>
            <p className="text-gray-400">
              Efficiently manage your sports teams, players, and registrations all in one place
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-xl border border-gray-700/50">
            <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Match Scheduling</h3>
            <p className="text-gray-400">
              Create and manage match schedules, track scores, and monitor team performance
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-xl border border-gray-700/50">
            <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Budget Tracking</h3>
            <p className="text-gray-400">
              Keep track of expenses, sponsorships, and manage your sports event budget effectively
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}