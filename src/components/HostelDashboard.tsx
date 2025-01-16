import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Hostel, SportTeam } from '../types';
import { Lock, Users, Trophy, Plus, Edit, Medal, Activity, Download } from 'lucide-react';
import AddTeam from './AddTeam';
import TeamView from './TeamView';
import * as XLSX from 'xlsx';

export default function HostelDashboard() {
  const { hostelId } = useParams();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [teams, setTeams] = useState<SportTeam[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddTeam, setShowAddTeam] = useState<'cricket' | 'volleyball' | 'kabaddi' | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<SportTeam | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!hostelId) return;
      
      try {
        // Fetch hostel data
        const hostelRef = doc(db, 'hostels', hostelId);
        const hostelSnap = await getDoc(hostelRef);
        
        if (hostelSnap.exists()) {
          const hostelData = { id: hostelSnap.id, ...hostelSnap.data() } as Hostel;
          setHostel(hostelData);
          
          // Fetch teams for this hostel
          const teamsQuery = query(
            collection(db, 'teams'),
            where('hostel_id', '==', hostelId)
          );
          const teamsSnap = await getDocs(teamsQuery);
          const teamsData = teamsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hostelId // Add hostelId to each team
          })) as SportTeam[];
          
          setTeams(teamsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load hostel data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hostelId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostel && password === hostel.password) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem(`hostel_auth_${hostelId}`, 'true');
    } else {
      setError('Incorrect password');
    }
  };

  const handleTeamCreated = (newTeam: SportTeam) => {
    setTeams(prevTeams => [...prevTeams, newTeam]);
    setShowAddTeam(null);
  };

  const handleTeamUpdated = (updatedTeam: SportTeam) => {
    setTeams(prevTeams => 
      prevTeams.map(team => team.id === updatedTeam.id ? updatedTeam : team)
    );
    setSelectedTeam(null);
  };

  const exportTeamData = (team: SportTeam) => {
    // Prepare player data for export
    const playerData = team.players.map((player, index) => ({
      'No.': index + 1,
      'Name': player.name,
      'Role': player.role,
      'Jersey Number': player.jerseyNumber,
      'Mobile Number': player.mobileNumber,
      'T-shirt Size': player.tshirtSize
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(playerData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');

    // Generate Excel file
    XLSX.writeFile(wb, `${hostel?.name}_${team.sport}_team.xlsx`);
  };

  // Check for saved authentication state on component mount
  useEffect(() => {
    if (hostelId) {
      const isAuth = localStorage.getItem(`hostel_auth_${hostelId}`);
      if (isAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, [hostelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Hostel not found</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">{hostel.name}</h2>
            <p className="mt-2 text-sm text-gray-400">Enter password to access dashboard</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-900/50 text-red-200 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg bg-gray-700 border-transparent focus:border-orange-500 focus:ring-orange-500 text-white"
                placeholder="Enter dashboard password"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-800"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Available sports that don't have teams yet
  const availableSports = {
    cricket: hostel.sports?.cricket && !teams.find(t => t.sport === 'cricket'),
    volleyball: hostel.sports?.volleyball && !teams.find(t => t.sport === 'volleyball'),
    kabaddi: hostel.sports?.kabaddi && !teams.find(t => t.sport === 'kabaddi')
  };

  const hasAvailableSports = Object.values(availableSports).some(Boolean);

  const sportEmoji = {
    cricket: '🏏',
    volleyball: '🏐',
    kabaddi: '🤼'
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-8 shadow-xl border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{hostel.name}</h1>
              <p className="text-gray-400">Sports Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-700/50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">{teams.length} Teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Team Section */}
      {hasAvailableSports && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-8 shadow-xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-bold text-white">Create New Teams</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(availableSports).map(([sport, isAvailable]) => 
              isAvailable && (
                <button
                  key={sport}
                  onClick={() => setShowAddTeam(sport as any)}
                  className="group relative bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-xl hover:from-orange-600 hover:to-orange-800 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-xl transition-opacity" />
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-4xl mb-2">{sportEmoji[sport as keyof typeof sportEmoji]}</div>
                    <span className="text-xl font-bold text-white capitalize">{sport} Team</span>
                    <p className="text-white/80 text-sm">Create your {sport} team now</p>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Existing Teams Section */}
      {teams.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Medal className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Your Teams</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl">
                      <Trophy className="h-8 w-8 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sportEmoji[team.sport]}</span>
                        <h3 className="text-xl font-bold text-white capitalize">
                          {team.sport} Team
                        </h3>
                      </div>
                      <p className="text-gray-400">
                        {team.players.length} / {team.maxPlayers} Players
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => exportTeamData(team)}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => setSelectedTeam(team)}
                      className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Manage Team</span>
                    </button>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Players</span>
                      </div>
                      <span className="text-white font-semibold">{team.players.length}</span>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Matches</span>
                      </div>
                      <span className="text-white font-semibold">{team.matches}</span>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Wins</span>
                      </div>
                      <span className="text-white font-semibold">{team.wins}</span>
                    </div>
                  </div>
                </div>

                {/* Players Grid */}
                {team.players.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Players</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team.players.map((player) => (
                        <div key={player.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-4">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-xl text-gray-400">
                                {player.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h5 className="text-white font-medium">{player.name}</h5>
                            <p className="text-gray-400 text-sm">{player.role}</p>
                            <p className="text-gray-400 text-sm">#{player.jerseyNumber}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Teams Message */}
      {teams.length === 0 && !hasAvailableSports && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-12 text-center shadow-xl border border-gray-700">
          <Trophy className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Teams Available</h3>
          <p className="text-gray-400">All possible teams have been created</p>
        </div>
      )}

      {/* Modals */}
      {showAddTeam && (
        <AddTeam
          hostelId={hostel.id}
          sport={showAddTeam}
          onClose={() => setShowAddTeam(null)}
          onTeamCreated={handleTeamCreated}
        />
      )}

      {selectedTeam && (
        <TeamView
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onTeamUpdated={handleTeamUpdated}
        />
      )}
    </div>
  );
}