import React, { useState, useRef } from 'react';
import { doc, updateDoc, arrayUnion, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserPlus, User, Shirt, Medal, Shield, Upload, Loader, X, Link as LinkIcon, Phone } from 'lucide-react';
import type { Player, SportTeam } from '../types';

interface AddPlayerProps {
  team: SportTeam;
  onClose: () => void;
  onPlayerAdded: (player: Player) => void;
}

const IMGBB_API_KEY = '9c7cee1493206c1cd4e8411094fd4348';

export default function AddPlayer({ team, onClose, onPlayerAdded }: AddPlayerProps) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'link'>('choose');
  const [playerData, setPlayerData] = useState({
    name: '',
    role: '',
    jerseyNumber: '',
    mobileNumber: '',
    tshirtSize: 'M' as Player['tshirtSize']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (team.players.length >= team.maxPlayers) {
      setError('Team is already at maximum capacity');
      return;
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(playerData.mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to add a player');
      }

      const teamRef = doc(db, 'teams', team.id);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }

      const teamData = teamDoc.data();
      if (teamData.userId !== user.uid) {
        throw new Error('You do not have permission to modify this team');
      }

      let photoUrl = '';
      
      if (imageFile) {
        setUploadProgress(true);
        photoUrl = await uploadImageToImgBB(imageFile);
        setUploadProgress(false);
      }

      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 15),
        name: playerData.name.trim(),
        role: playerData.role.trim(),
        jerseyNumber: parseInt(playerData.jerseyNumber),
        photoUrl: photoUrl || undefined,
        mobileNumber: playerData.mobileNumber,
        tshirtSize: playerData.tshirtSize,
        userId: user.uid,
        teamId: team.id
      };

      await updateDoc(teamRef, {
        players: arrayUnion(newPlayer),
        userId: user.uid
      });

      onPlayerAdded(newPlayer);
      onClose();
    } catch (err) {
      console.error('Error adding player:', err);
      setError(err instanceof Error ? err.message : 'Failed to add player. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  const generateRegistrationLink = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to generate a registration link');
      }

      const registrationDoc = await addDoc(collection(db, 'registrationLinks'), {
        teamId: team.id,
        sport: team.sport,
        createdAt: new Date().toISOString(),
        active: true,
        userId: user.uid
      });

      const link = `${window.location.origin}/register/${registrationDoc.id}`;
      setRegistrationLink(link);
    } catch (err) {
      console.error('Error generating registration link:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate registration link');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationLink);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Add Players</h2>
            <p className="text-gray-400 mt-2">Choose how to add players</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              {error}
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(90vh-16rem)] pr-2 space-y-6">
            {mode === 'choose' && (
              <div className="space-y-4">
                <button
                  onClick={() => setMode('manual')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                >
                  Add Player Manually
                </button>
                <button
                  onClick={() => setMode('link')}
                  className="w-full bg-gray-700 text-white px-6 py-4 rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                >
                  Generate Registration Link
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            )}

            {mode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Player Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={playerData.name}
                      onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                      className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                      placeholder="Enter player name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Role
                  </label>
                  <div className="relative">
                    <Medal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={playerData.role}
                      onChange={(e) => setPlayerData({...playerData, role: e.target.value})}
                      className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                      placeholder="Enter player role"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Jersey Number
                  </label>
                  <div className="relative">
                    <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={playerData.jerseyNumber}
                      onChange={(e) => setPlayerData({...playerData, jerseyNumber: e.target.value})}
                      className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                      placeholder="Enter jersey number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={playerData.mobileNumber}
                      onChange={(e) => setPlayerData({...playerData, mobileNumber: e.target.value})}
                      className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  <p className="text-sm text-gray-400">Enter 10-digit number without spaces or special characters</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    T-shirt Size
                  </label>
                  <select
                    required
                    value={playerData.tshirtSize}
                    onChange={(e) => setPlayerData({...playerData, tshirtSize: e.target.value as Player['tshirtSize']})}
                    className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Player Photo
                  </label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 mx-auto border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Upload Photo</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-400 text-center mt-2">
                      Max size: 2MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setMode('choose')}
                    className="flex-1 px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors duration-200"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        {uploadProgress ? 'Uploading...' : 'Adding...'}
                        <Loader className="h-4 w-4 animate-spin" />
                      </span>
                    ) : (
                      'Add Player'
                    )}
                  </button>
                </div>
              </form>
            )}

            {mode === 'link' && (
              <div className="space-y-6">
                {registrationLink ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Registration Link</h3>
                    <div className="bg-gray-700/50 p-4 rounded-xl">
                      <p className="text-sm text-gray-300 break-all">{registrationLink}</p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center gap-2 w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Copy Link
                    </button>
                    <p className="text-sm text-gray-400 text-center">
                      Share this link with players to let them register for the team
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={generateRegistrationLink}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        Generating Link...
                        <Loader className="h-4 w-4 animate-spin" />
                      </span>
                    ) : (
                      'Generate Registration Link'
                    )}
                  </button>
                )}

                <button
                  onClick={() => setMode('choose')}
                  className="w-full px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors duration-200"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}