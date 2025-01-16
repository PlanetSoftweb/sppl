import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Trophy, Users, Activity } from 'lucide-react';
import type { SportTeam } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalTeams: 0,
    totalPlayers: 0,
    sportStats: {
      cricket: 0,
      volleyball: 0,
      kabaddi: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current user
        const user = auth.currentUser;
        if (!user) return;

        // Fetch hostels
        const hostelsSnap = await getDocs(collection(db, 'hostels'));
        
        // Fetch teams with user filter
        const teamsQuery = query(
          collection(db, 'teams'),
          where('userId', '==', user.uid)
        );
        const teamsSnap = await getDocs(teamsQuery);
        const teams = teamsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SportTeam[];
        
        // Calculate total players and sport-specific stats
        const totalPlayers = teams.reduce((acc, team) => 
          acc + (Array.isArray(team.players) ? team.players.length : 0), 0
        );

        // Calculate sport-specific stats
        const sportStats = teams.reduce((acc, team) => {
          acc[team.sport] = (acc[team.sport] || 0) + 1;
          return acc;
        }, {
          cricket: 0,
          volleyball: 0,
          kabaddi: 0
        });
        
        setStats({
          totalHostels: hostelsSnap.size,
          totalTeams: teams.length,
          totalPlayers,
          sportStats
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          totalHostels: 0,
          totalTeams: 0,
          totalPlayers: 0,
          sportStats: {
            cricket: 0,
            volleyball: 0,
            kabaddi: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const sportEmoji = {
    cricket: '🏏',
    volleyball: '🏐',
    kabaddi: '🤼'
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white">Sports Event Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Trophy className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total Hostels</h2>
              <p className="text-2xl font-semibold text-white">{stats.totalHostels}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total Teams</h2>
              <p className="text-2xl font-semibold text-white">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Activity className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-400">Total Players</h2>
              <p className="text-2xl font-semibold text-white">{stats.totalPlayers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sports Breakdown */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Sports Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.sportStats).map(([sport, count]) => (
            <div key={sport} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sportEmoji[sport as keyof typeof sportEmoji]}</span>
                  <span className="text-gray-300 capitalize">{sport}</span>
                </div>
                <span className="text-white font-semibold">{count} Teams</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}