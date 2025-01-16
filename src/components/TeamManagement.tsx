import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, Hostel } from '../types/database.types';

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hostel_id: '',
    hostel_password: '',
    sport: 'VOLLEYBALL',
    captain_name: '',
    team_size: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchHostels();
  }, []);

  async function fetchHostels() {
    try {
      const hostelsSnapshot = await getDocs(collection(db, 'hostels'));
      const hostelsList = hostelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Hostel));
      setHostels(hostelsList);
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  }

  async function fetchTeams() {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teamsList = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Team));
      setTeams(teamsList);
    } catch (err) {
      setError('Failed to fetch teams. Please try again later.');
      console.error('Error fetching teams:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Verify hostel password
      const hostelRef = doc(db, 'hostels', formData.hostel_id);
      const hostelDoc = await getDoc(hostelRef);
      
      if (!hostelDoc.exists()) {
        throw new Error('Hostel not found');
      }

      const hostelData = hostelDoc.data();
      if (hostelData.password !== formData.hostel_password) {
        throw new Error('Invalid hostel password');
      }

      // Add team after password verification
      await addDoc(collection(db, 'teams'), {
        hostel_id: formData.hostel_id,
        sport: formData.sport,
        captain_name: formData.captain_name,
        team_size: parseInt(formData.team_size),
        created_at: new Date()
      });

      setShowForm(false);
      setFormData({
        hostel_id: '',
        hostel_password: '',
        sport: 'VOLLEYBALL',
        captain_name: '',
        team_size: ''
      });
      fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team. Please try again.');
      console.error('Error adding team:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Teams
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Team'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Select Hostel</label>
                <select
                  required
                  value={formData.hostel_id}
                  onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Hostel Password</label>
                <input
                  type="password"
                  required
                  value={formData.hostel_password}
                  onChange={(e) => setFormData({ ...formData, hostel_password: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Sport</label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="VOLLEYBALL">Volleyball</option>
                  <option value="KABADDI">Kabaddi</option>
                  <option value="CRICKET">Cricket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Captain Name</label>
                <input
                  type="text"
                  required
                  value={formData.captain_name}
                  onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Team Size</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Add Team
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const hostel = hostels.find(h => h.id === team.hostel_id);
            return (
              <div key={team.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {hostel?.name} - {team.sport}
                </h2>
                <div className="mt-4 space-y-2 text-gray-300">
                  <p>Captain: {team.captain_name}</p>
                  <p>Team Size: {team.team_size}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}