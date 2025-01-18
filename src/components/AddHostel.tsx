import React, { useState } from 'react';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Shield, Trophy } from 'lucide-react';

export default function AddHostel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    totalStudents: '',
    password: '',
    sports: {
      cricket: false,
      volleyball: false,
      kabaddi: false
    }
  });
  const [error, setError] = useState('');

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to add a hostel');
      }

      const db = getFirestore();
      await addDoc(collection(db, 'hostels'), {
        name: formData.name.trim(),
        totalStudents: parseInt(formData.totalStudents),
        password: formData.password,
        sports: formData.sports,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setFormData({
        name: '',
        totalStudents: '',
        password: '',
        sports: {
          cricket: false,
          volleyball: false,
          kabaddi: false
        }
      });
      
      navigate('/hostels');
    } catch (error) {
      console.error('Error adding hostel:', error);
      setError('Failed to add hostel. Please try again.');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white">Add New Hostel</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Hostel Name
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-orange-500 focus:ring-orange-500 text-white"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Total Students
            <input
              type="number"
              required
              value={formData.totalStudents}
              onChange={(e) => setFormData({...formData, totalStudents: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-orange-500 focus:ring-orange-500 text-white"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Dashboard Password
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-orange-500 focus:ring-orange-500 text-white"
              placeholder="Enter password (minimum 6 characters)"
            />
          </label>
          <p className="mt-1 text-sm text-gray-400">
            Password must be at least 6 characters long
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-300">Sports Participation</p>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.sports.cricket}
              onChange={(e) => setFormData({
                ...formData,
                sports: {...formData.sports, cricket: e.target.checked}
              })}
              className="rounded bg-gray-700 border-transparent text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-300">Cricket</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.sports.volleyball}
              onChange={(e) => setFormData({
                ...formData,
                sports: {...formData.sports, volleyball: e.target.checked}
              })}
              className="rounded bg-gray-700 border-transparent text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-300">Volleyball</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.sports.kabaddi}
              onChange={(e) => setFormData({
                ...formData,
                sports: {...formData.sports, kabaddi: e.target.checked}
              })}
              className="rounded bg-gray-700 border-transparent text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-300">Kabaddi</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Add Hostel
        </button>
      </form>
    </div>
  );
}