import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Trophy, Users, Activity, Calendar, Clock, MapPin } from 'lucide-react';
import type { SportTeam, Match } from '../types';

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
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<'cricket' | 'volleyball' | 'kabaddi'>('cricket');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to view this page');
          return;
        }

        // Fetch teams owned by the current user
        const teamsQuery = query(
          collection(db, 'teams'),
          where('userId', '==', user.uid)
        );
        const teamsSnap = await getDocs(teamsQuery);
        const teams = teamsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SportTeam[];

        // Fetch hostels owned by the current user
        const hostelsQuery = query(
          collection(db, 'hostels'),
          where('userId', '==', user.uid)
        );
        const hostelsSnap = await getDocs(hostelsQuery);
        
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

        // Fetch matches
        const matchesQuery = query(collection(db, 'matches'));
        const matchesSnap = await getDocs(matchesQuery);
        const matchesData = matchesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Match[];
        setMatches(matchesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sportEmoji = {
    cricket: '🏏',
    volleyball: '🏐',
    kabaddi: '🤼'
  };

  const groupMatchesByDate = (matches: Match[]) => {
    const filtered = matches.filter(match => match.sport === selectedSport);
    return filtered.reduce((acc, match) => {
      const date = match.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(match);
      return acc;
    }, {} as Record<string, Match[]>);
  };

  const groupedMatches = groupMatchesByDate(matches);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Trophy className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Hostels</p>
              <p className="text-2xl font-bold text-white">{stats.totalHostels}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold text-white">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Activity className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Players</p>
              <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Schedule Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Match Schedule</h2>
            <p className="text-gray-400">View upcoming matches and their timings</p>
          </div>
          
          <div className="flex gap-4">
            {(['cricket', 'volleyball', 'kabaddi'] as const).map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedSport === sport
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{sportEmoji[sport]}</span>
                <span className="capitalize">{sport}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([date, dayMatches]) => (
            <div key={date} className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              <div className="grid gap-4">
                {dayMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                      match.status === 'completed'
                        ? 'border-green-500'
                        : match.status === 'cancelled'
                        ? 'border-red-500'
                        : 'border-orange-500'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white mb-2">
                            {match.team1Name} vs {match.team2Name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {match.startTime} - {match.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {match.venue}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            match.status === 'completed'
                              ? 'bg-green-500/20 text-green-300'
                              : match.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-orange-500/20 text-orange-300'
                          }`}
                        >
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {match.status === 'completed' && match.winner && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">Winner: </span>
                        <span className="text-green-400">{match.winner}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedMatches).length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No matches scheduled for {selectedSport}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}