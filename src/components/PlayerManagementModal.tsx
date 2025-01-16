import { useState, useEffect } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Team, Player } from '../types/database.types';

interface PlayerManagementModalProps {
  team: Team;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlayerManagementModal({ team, onClose, onSuccess }: PlayerManagementModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    contact_number: '',
    position: '',
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [team.id]);

  async function fetchPlayers() {
    try {
      const q = query(collection(db, 'players'), where('team_id', '==', team.id));
      const snapshot = await getDocs(q);
      const playersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      setPlayers(playersList);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to fetch players. Please try again.');
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = '';
      
      if (profileImage) {
        const imageRef = ref(storage, `player-images/${team.id}/${Date.now()}-${profileImage.name}`);
        const uploadResult = await uploadBytes(imageRef, profileImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'players'), {
        team_id: team.id,
        ...formData,
        profile_image: imageUrl,
        status: 'PENDING',
        created_at: new Date()
      });

      setFormData({
        name: '',
        roll_number: '',
        contact_number: '',
        position: '',
      });
      setProfileImage(null);
      setImagePreview(null);
      setShowAddForm(false);
      await fetchPlayers();
      onSuccess();
    } catch (err) {
      setError('Failed to register player. Please try again.');
      console.error('Error registering player:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Player Management - {team.sport}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Current Players</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Add New Player'}
              </button>
            </div>
            <div className="grid gap-4">
              {players.map((player) => (
                <div key={player.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center space-x-4">
                    {player.profile_image && (
                      <img
                        src={player.profile_image}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-medium text-white">{player.name}</h4>
                      <p className="text-gray-300">Position: {player.position}</p>
                      <p className="text-gray-300">Roll Number: {player.roll_number}</p>
                      <p className="text-gray-300">Contact: {player.contact_number}</p>
                      <span className={`inline-block px-2 py-1 rounded text-sm mt-2 ${
                        player.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                        player.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {player.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {players.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No players added yet
                </div>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Add New Player</h3>
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Player Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Roll Number</label>
                      <input
                        type="text"
                        required
                        value={formData.roll_number}
                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Contact Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Position</label>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md bg-gray-800">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative w-40 h-40 mx-auto">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="rounded-full w-full h-full object-cover border-2 border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProfileImage(null);
                                setImagePreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-400">
                              <label className="relative cursor-pointer rounded-md font-medium text-indigo-500 hover:text-indigo-400">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Adding Player...' : 'Add Player'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}