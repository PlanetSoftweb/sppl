import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Shirt, Medal, Shield, Upload, Loader, X, Trophy } from 'lucide-react';

const IMGBB_API_KEY = '9c7cee1493206c1cd4e8411094fd4348';

export default function PlayerRegistration() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamData, setTeamData] = useState<any>(null);
  const [playerData, setPlayerData] = useState({
    name: '',
    role: '',
    jerseyNumber: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRegistrationLink = async () => {
      try {
        if (!linkId) return;

        const linkRef = doc(db, 'registrationLinks', linkId);
        const linkDoc = await getDoc(linkRef);

        if (!linkDoc.exists()) {
          throw new Error('Invalid registration link');
        }

        const linkData = linkDoc.data();
        if (!linkData.active) {
          throw new Error('This registration link has expired');
        }

        const teamRef = doc(db, 'teams', linkData.teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
          throw new Error('Team not found');
        }

        setTeamData({ id: teamDoc.id, ...teamDoc.data() });
      } catch (err) {
        console.error('Error fetching registration link:', err);
        setError(err instanceof Error ? err.message : 'Failed to load registration');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationLink();
  }, [linkId]);

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
      let photoUrl = '';
      
      if (imageFile) {
        setUploadProgress(true);
        photoUrl = await uploadImageToImgBB(imageFile);
        setUploadProgress(false);
      }

      await addDoc(collection(db, 'playerRequests'), {
        name: playerData.name.trim(),
        role: playerData.role.trim(),
        jerseyNumber: parseInt(playerData.jerseyNumber),
        photoUrl: photoUrl || null,
        teamId: teamData.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        registrationLinkId: linkId
      });

      // Redirect to success page
      navigate('/registration-success');
    } catch (err) {
      console.error('Error submitting registration:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit registration');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl text-center max-w-md">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Registration Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Player Registration</h2>
          <p className="text-gray-400 mt-2">
            {teamData?.sport.charAt(0).toUpperCase() + teamData?.sport.slice(1)} Team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={playerData.name}
                onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Your Role
            </label>
            <div className="relative">
              <Medal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={playerData.role}
                onChange={(e) => setPlayerData({...playerData, role: e.target.value})}
                className="pl-10 block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white transition-all duration-200"
                placeholder="Enter your role"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Preferred Jersey Number
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
              Your Photo
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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {uploadProgress ? 'Uploading...' : 'Submitting...'}
                <Loader className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}