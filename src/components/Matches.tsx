import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Calendar, Clock, MapPin, Trophy, Shield, Users, Plus, Edit2, X, Building2, AlertCircle } from 'lucide-react';
import type { Match, SportTeam, Hostel } from '../types';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState<'cricket' | 'volleyball' | 'kabaddi'>('cricket');
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<SportTeam[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel1, setSelectedHostel1] = useState('');
  const [selectedHostel2, setSelectedHostel2] = useState('');
  const [newMatch, setNewMatch] = useState({
    team1Id: '',
    team2Id: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    venue: '',
    notes: '',
    round: '1',
    matchNumber: '1'
  });

  const sportEmoji = {
    cricket: '🏏',
    volleyball: '🏐',
    kabaddi: '🤼'
  };

  useEffect(() => {
    fetchData();
  }, [selectedSport]);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to view matches');
        return;
      }

      // Fetch matches for selected sport
      const matchesQuery = query(
        collection(db, 'matches'),
        where('sport', '==', selectedSport)
      );
      const matchesSnap = await getDocs(matchesQuery);
      const matchesData = matchesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
      setMatches(matchesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // Fetch teams
      const teamsQuery = query(collection(db, 'teams'));
      const teamsSnap = await getDocs(teamsQuery);
      const teamsData = teamsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SportTeam[];
      setTeams(teamsData);

      // Fetch hostels
      const hostelsQuery = query(collection(db, 'hostels'));
      const hostelsSnap = await getDocs(hostelsQuery);
      const hostelsData = hostelsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hostel[];
      setHostels(hostelsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load matches data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to add a match');

      // Get hostel names for team names
      const team1 = teams.find(t => t.id === newMatch.team1Id);
      const team2 = teams.find(t => t.id === newMatch.team2Id);
      const hostel1 = hostels.find(h => h.id === team1?.hostel_id);
      const hostel2 = hostels.find(h => h.id === team2?.hostel_id);

      if (!team1 || !team2 || !hostel1 || !hostel2) {
        throw new Error('Invalid team or hostel selection');
      }

      const matchData = {
        sport: selectedSport,
        team1Id: newMatch.team1Id,
        team2Id: newMatch.team2Id,
        team1Name: `${hostel1.name} ${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Team`,
        team2Name: `${hostel2.name} ${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Team`,
        date: newMatch.date,
        startTime: newMatch.startTime,
        endTime: newMatch.endTime,
        venue: newMatch.venue.trim(),
        status: 'scheduled',
        notes: newMatch.notes.trim(),
        round: parseInt(newMatch.round),
        matchNumber: parseInt(newMatch.matchNumber),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'matches'), matchData);
      
      setNewMatch({
        team1Id: '',
        team2Id: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        venue: '',
        notes: '',
        round: '1',
        matchNumber: '1'
      });
      setShowAddMatch(false);
      fetchData();
    } catch (err) {
      console.error('Error adding match:', err);
      setError(err instanceof Error ? err.message : 'Failed to add match');
    }
  };

  const handleUpdateMatch = async (matchId: string, status: 'completed' | 'cancelled', winner?: string) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const updateData: Partial<Match> = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'completed' && winner) {
        updateData.winner = winner;
      }

      await updateDoc(matchRef, updateData);
      fetchData();
    } catch (err) {
      console.error('Error updating match:', err);
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Sports Matches</h1>
          <p className="text-gray-400">Manage and track all sports matches</p>
        </div>
        <button
          onClick={() => setShowAddMatch(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Schedule Match
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-400" />
          {error}
        </div>
      )}

      {/* Sport Selection Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {(['cricket', 'volleyball', 'kabaddi'] as const).map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              selectedSport === sport
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{sportEmoji[sport]}</span>
            <span className="capitalize">{sport}</span>
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No matches scheduled yet</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl">
                      <Trophy className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {match.team1Name} vs {match.team2Name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(match.date).toLocaleDateString()}
                        </div>
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

                  {match.notes && (
                    <p className="text-gray-400 mt-2">{match.notes}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {match.status === 'scheduled' ? (
                    <>
                      <button
                        onClick={() => handleUpdateMatch(match.id, 'completed', match.team1Name)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Trophy className="h-5 w-5" />
                        {match.team1Name} Won
                      </button>
                      <button
                        onClick={() => handleUpdateMatch(match.id, 'completed', match.team2Name)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Trophy className="h-5 w-5" />
                        {match.team2Name} Won
                      </button>
                      <button
                        onClick={() => handleUpdateMatch(match.id, 'cancelled')}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                        Cancel Match
                      </button>
                    </>
                  ) : (
                    <div className={`text-center px-4 py-2 rounded-lg ${
                      match.status === 'completed'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {match.status === 'completed' ? (
                        <>
                          <p className="font-medium">Winner</p>
                          <p className="text-sm mt-1">{match.winner}</p>
                        </>
                      ) : (
                        'Cancelled'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Match Modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl h-[90vh] shadow-2xl border border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Schedule New Match</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} League Match
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMatch(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleAddMatch} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    {error}
                  </div>
                )}

                {/* League Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Round Number
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newMatch.round}
                      onChange={(e) => setNewMatch({...newMatch, round: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Match Number
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newMatch.matchNumber}
                      onChange={(e) => setNewMatch({...newMatch, matchNumber: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    />
                  </div>
                </div>

                {/* Team Selection Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Hostel 1 Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Hostel
                    </label>
                    <select
                      required
                      value={selectedHostel1}
                      onChange={(e) => {
                        setSelectedHostel1(e.target.value);
                        setNewMatch({...newMatch, team1Id: ''});
                      }}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map(hostel => (
                        <option key={hostel.id} value={hostel.id}>
                          {hostel.name}
                        </option>
                      ))}
                    </select>

                    {selectedHostel1 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Team
                        </label>
                        <select
                          required
                          value={newMatch.team1Id}
                          onChange={(e) => setNewMatch({...newMatch, team1Id: e.target.value})}
                          className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                        >
                          <option value="">Select Team</option>
                          {teams
                            .filter(team => team.hostel_id === selectedHostel1 && team.sport === selectedSport)
                            .map(team => (
                              <option key={team.id} value={team.id}>
                                {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Team
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Hostel 2 Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Second Hostel
                    </label>
                    <select
                      required
                      value={selectedHostel2}
                      onChange={(e) => {
                        setSelectedHostel2(e.target.value);
                        setNewMatch({...newMatch, team2Id: ''});
                      }}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    >
                      <option value="">Select Hostel</option>
                      {hostels
                        .filter(hostel => hostel.id !== selectedHostel1)
                        .map(hostel => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                          </option>
                        ))}
                    </select>

                    {selectedHostel2 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Team
                        </label>
                        <select
                          required
                          value={newMatch.team2Id}
                          onChange={(e) => setNewMatch({...newMatch, team2Id: e.target.value})}
                          className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                        >
                          <option value="">Select Team</option>
                          {teams
                            .filter(team => team.hostel_id === selectedHostel2 && team.sport === selectedSport)
                            .map(team => (
                              <option key={team.id} value={team.id}>
                                {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Team
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Details Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newMatch.date}
                        onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                        className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        value={newMatch.startTime}
                        onChange={(e) => setNewMatch({...newMatch, startTime: e.target.value})}
                        className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        required
                        value={newMatch.endTime}
                        onChange={(e) => setNewMatch({...newMatch, endTime: e.target.value})}
                        className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      required
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({...newMatch, venue: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      placeholder="Enter venue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newMatch.notes}
                      onChange={(e) => setNewMatch({...newMatch, notes: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      placeholder="Add any additional notes"
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddMatch(false)}
                  className="flex-1 px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMatch}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Schedule Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}