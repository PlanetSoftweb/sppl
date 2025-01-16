import React, { useState, useRef } from 'react';
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Shirt, Medal, Shield, Upload, Loader, X, Save } from 'lucide-react';
import type { Player, SportTeam } from '../types';

interface EditPlayerProps {
  team: SportTeam;
  player: Player;
  onClose: () => void;
  onPlayerUpdated: (oldPlayer: Player, newPlayer: Player) => void;
}

const IMGBB_API_KEY = '9c7cee1493206c1cd4e8411094fd4348';

export default function EditPlayer({ team, player, onClose, onPlayerUpdated }: EditPlayerProps) {
  const [playerData, setPlayerData] = useState({
    name: player.name,
    role: player.role,
    jerseyNumber: player.jerseyNumber.toString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(player.photoUrl || '');
  const [uploadProgress, setUploadProgress] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to edit a player');
      }

      // Verify team ownership
      const teamRef = doc(db, 'teams', team.id);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }

      const teamData = teamDoc.data();
      if (teamData.userId !== user.uid) {
        throw new Error('You do not have permission to modify this team');
      }

      let photoUrl = player.photoUrl;
      
      if (imageFile) {
        setUploadProgress(true);
        photoUrl = await uploadImageToImgBB(imageFile);
        setUploadProgress(false);
      }

      const updatedPlayer: Player = {
        ...player,
        name: playerData.name.trim(),
        role: playerData.role.trim(),
        jerseyNumber: parseInt(playerData.jerseyNumber),
        photoUrl: photoUrl || undefined,
      };

      // Remove old player and add updated one
      await updateDoc(teamRef, {
        players: arrayRemove(player)
      });
      await updateDoc(teamRef, {
        players: arrayUnion(updatedPlayer)
      });

      onPlayerUpdated(player, updatedPlayer);
      onClose();
    } catch (err) {
      console.error('Error updating player:', err);
      setError(err instanceof Error ? err.message : 'Failed to update player. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full">
                <Save className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Edit Player</h2>
          <p className="text-gray-400 mt-2">
            {team.sport.charAt(0).toUpperCase() + team.sport.slice(1)} Team
          </p>
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
                      setImagePreview(player.photoUrl || '');
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  {uploadProgress ? 'Uploading...' : 'Saving...'}
                  <Loader className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}