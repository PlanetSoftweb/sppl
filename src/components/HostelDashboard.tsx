import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, Volunteer, Revenue, Hostel, Player } from '../types/database.types';
import PlayerManagementModal from './PlayerManagementModal';

export default function HostelDashboard() {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [formData, setFormData] = useState({
    sport: 'VOLLEYBALL',
    captain_name: '',
    team_size: '',
    hostel_password: ''
  });

  useEffect(() => {
    if (hostelId) {
      fetchHostelData();
    }
  }, [hostelId]);

  async function fetchHostelData() {
    try {
      const hostelDoc = await getDoc(doc(db, 'hostels', hostelId!));
      if (hostelDoc.exists()) {
        setHostel({ id: hostelDoc.id, ...hostelDoc.data() } as Hostel);
      } else {
        navigate('/hostels');
      }
    } catch (err) {
      console.error('Error fetching hostel:', err);
      navigate('/hostels');
    }
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostel?.password === verificationPassword) {
      setIsVerified(true);
      setError('');
      fetchTeams();
      fetchPlayers();
      fetchVolunteers();
      fetchRevenues();
    } else {
      setError('Invalid hostel password');
    }
  };

  async function fetchTeams() {
    try {
      const q = query(collection(db, 'teams'), where('hostel_id', '==', hostelId));
      const teamsSnapshot = await getDocs(q);
      const teamsList = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: `${doc.data().sport} Team`
      } as Team));
      setTeams(teamsList);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }

  async function fetchPlayers() {
    try {
      const teamsQuery = query(collection(db, 'teams'), where('hostel_id', '==', hostelId));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamIds = teamsSnapshot.docs.map(doc => doc.id);
      
      const playersQuery = query(collection(db, 'players'), where('team_id', 'in', teamIds));
      const playersSnapshot = await getDocs(playersQuery);
      const playersList = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      setPlayers(playersList);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  }

  async function fetchVolunteers() {
    try {
      const q = query(collection(db, 'volunteers'), where('hostel_id', '==', hostelId));
      const volunteersSnapshot = await getDocs(q);
      const volunteersList = volunteersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Volunteer));
      setVolunteers(volunteersList);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    }
  }

  async function fetchRevenues() {
    try {
      const q = query(collection(db, 'revenues'), where('hostel_id', '==', hostelId));
      const revenuesSnapshot = await getDocs(q);
      const revenuesList = revenuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Revenue));
      setRevenues(revenuesList);
    } catch (err) {
      console.error('Error fetching revenues:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!hostel) throw new Error('Hostel not found');
      if (formData.hostel_password !== hostel.password) {
        throw new Error('Invalid hostel password');
      }

      await addDoc(collection(db, 'teams'), {
        hostel_id: hostelId,
        sport: formData.sport,
        captain_name: formData.captain_name,
        team_size: parseInt(formData.team_size),
        created_at: new Date()
      });

      setShowForm(false);
      setFormData({
        sport: 'VOLLEYBALL',
        captain_name: '',
        team_size: '',
        hostel_password: ''
      });
      fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team. Please try again.');
      console.error('Error adding team:', err);
    }
  };

  if (!hostel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Access {hostel.name} Dashboard
          </h1>
          <form onSubmit={handleVerification} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Enter Hostel Password</label>
                <input
                  type="password"
                  required
                  value={verificationPassword}
                  onChange={(e) => setVerificationPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter password to access dashboard"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Access Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          {hostel.name} Dashboard
        </h1>

        <div className="mb-6">
          <nav className="flex space-x-4">
            <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>
              Teams & Players
            </TabButton>
            <TabButton active={activeTab === 'volunteers'} onClick={() => setActiveTab('volunteers')}>
              Volunteers
            </TabButton>
            <TabButton active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>
              Revenue
            </TabButton>
          </nav>
        </div>

        {activeTab === 'teams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Teams</h2>
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
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                  >
                    Add Team
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {team.name} - {team.sport}
                      </h3>
                      <div className="mt-2 space-y-1 text-gray-300">
                        <p>Captain: {team.captain_name}</p>
                        <p>Team Size: {team.team_size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTeam(team)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                    >
                      Manage Players
                    </button>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-300 mb-2">Current Players</h4>
                    <div className="space-y-2">
                      {players
                        .filter(player => player.team_id === team.id)
                        .map(player => (
                          <div key={player.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              {player.profile_image && (
                                <img
                                  src={player.profile_image}
                                  alt={player.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <p className="text-sm text-gray-400">Position: {player.position}</p>
                                <p className="text-sm text-gray-400">Roll Number: {player.roll_number}</p>
                                <p className="text-sm text-gray-400">Status: {player.status}</p>
                              </div>
                            </div>
                            {player.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePlayerStatusUpdate(player.id, 'APPROVED')}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handlePlayerStatusUpdate(player.id, 'REJECTED')}
                                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="grid gap-4 md:grid-cols-2">
            {volunteers.map((volunteer) => (
              <div key={volunteer.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white">{volunteer.name}</h3>
                <div className="mt-4 space-y-2 text-gray-300">
                  <p>Role: {volunteer.role}</p>
                  <p>Sport: {volunteer.assigned_sport}</p>
                  <p>Contact: {volunteer.contact_number}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid gap-4 md:grid-cols-2">
            {revenues.map((revenue) => (
              <div key={revenue.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white">{revenue.event_name}</h3>
                <div className="mt-4 space-y-2 text-gray-300">
                  <p>Amount: ₹{revenue.amount.toLocaleString()}</p>
                  <p>Type: {revenue.type}</p>
                  <p>Date: {new Date(revenue.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTeam && (
        <PlayerManagementModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSuccess={() => {
            fetchPlayers();
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
}

function TabButton({ children, active, onClick }: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium ${
        active 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}