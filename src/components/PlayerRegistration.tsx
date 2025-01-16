import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team } from '../types/database.types';

interface PlayerRegistrationProps {
  team: Team;
  onSuccess: () => void;
}

export default function PlayerRegistration({ team, onSuccess }: PlayerRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    contact_number: '',
    position: '',
  });
  const [error, setError] = useState('');

  const getMaxPlayers = (sport: string) => {
    switch (sport) {
      case 'CRICKET':
        return 16;
      case 'VOLLEYBALL':
      case 'KABADDI':
        return 11;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'players'), {
        team_id: team.id,
        ...formData,
        status: 'PENDING',
        created_at: new Date()
      });

      setFormData({
        name: '',
        roll_number: '',
        contact_number: '',
        position: '',
      });
      onSuccess();
    } catch (err) {
      setError('Failed to register player. Please try again.');
      console.error('Error registering player:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Register Player</h3>
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Player Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Roll Number</label>
          <input
            type="text"
            required
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Contact Number</label>
          <input
            type="tel"
            required
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Position</label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="text-sm text-gray-400">
          Maximum players allowed for {team.sport}: {getMaxPlayers(team.sport)}
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          Register Player
        </button>
      </form>
    </div>
  );
}