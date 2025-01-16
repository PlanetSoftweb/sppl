import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import type { Hostel } from '../types/database.types';

export default function HostelList() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    warden_name: '',
    contact_number: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  async function fetchHostels() {
    try {
      const hostelsSnapshot = await getDocs(collection(db, 'hostels'));
      const hostelsList = hostelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        password: '••••••••' // Hide password in UI
      } as Hostel));
      setHostels(hostelsList);
    } catch (err) {
      setError('Failed to fetch hostels. Please try again later.');
      console.error('Error fetching hostels:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.password || formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await addDoc(collection(db, 'hostels'), {
        name: formData.name,
        warden_name: formData.warden_name,
        contact_number: formData.contact_number,
        email: formData.email,
        password: formData.password,
        created_at: serverTimestamp()
      });

      setShowForm(false);
      setFormData({ name: '', warden_name: '', contact_number: '', email: '', password: '' });
      fetchHostels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add hostel. Please try again.');
      console.error('Error adding hostel:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Hostels
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Hostel'}
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
                <label className="block text-sm font-medium text-gray-300">Hostel Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Warden Name</label>
                <input
                  type="text"
                  required
                  value={formData.warden_name}
                  onChange={(e) => setFormData({ ...formData, warden_name: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Hostel Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-400">
                  This password will be required when adding teams to this hostel
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Add Hostel
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {hostels.map((hostel) => (
            <Link
              key={hostel.id}
              to={`/hostels/${hostel.id}`}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white">{hostel.name}</h2>
              <div className="mt-4 space-y-2 text-gray-300">
                <p>Warden: {hostel.warden_name}</p>
                <p>Contact: {hostel.contact_number}</p>
                <p>Email: {hostel.email}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}