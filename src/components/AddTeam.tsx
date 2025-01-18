import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import { Trophy, Users, Shield } from 'lucide-react';
import type { SportTeam } from '../types';

interface AddTeamProps {
  hostelId: string;
  sport: 'cricket' | 'volleyball' | 'kabaddi';
  onClose: () => void;
  onTeamCreated: (team: SportTeam) => void;
}

export default function AddTeam({ hostelId, sport, onClose, onTeamCreated }: AddTeamProps) {
  const [maxPlayers, setMaxPlayers] = useState('15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to create a team');
      }

      const db = getFirestore();
      
      // First verify that the hostel exists
      const hostelRef = doc(db, 'hostels', hostelId);
      const hostelDoc = await getDoc(hostelRef);
      
      if (!hostelDoc.exists()) {
        throw new Error('Hostel not found');
      }

      const hostelData = hostelDoc.data();
      if (hostelData.userId !== user.uid) {
        throw new Error('You do not have permission to add teams to this hostel');
      }

      const teamData = {
        hostel_id: hostelId,
        sport,
        maxPlayers: parseInt(maxPlayers),
        players: [],
        matches: 0,
        wins: 0,
        captain: '',
        createdAt: new Date().toISOString(),
        userId: user.uid
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      onTeamCreated({ id: docRef.id, ...teamData, hostelId } as SportTeam);
      onClose();
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const sportIcon = {
    cricket: '🏏',
    volleyball: '🏐',
    kabaddi: '🤼'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            {sportIcon[sport]}
            New {sport.charAt(0).toUpperCase() + sport.slice(1)} Team
          </h2>
          <p className="text-gray-400 mt-2">Set up your team configuration</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Maximum Players
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                required
                min="1"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Set the maximum number of players allowed in the team
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}