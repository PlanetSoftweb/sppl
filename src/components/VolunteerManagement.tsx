import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Volunteer } from '../types/database.types';

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    contact_number: '',
    email: '',
    assigned_sport: ''
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    try {
      const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
      const volunteersList = volunteersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Volunteer));
      setVolunteers(volunteersList);
    } catch (err) {
      setError('Failed to fetch volunteers. Please try again later.');
      console.error('Error fetching volunteers:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'volunteers'), {
        ...formData,
        created_at: new Date()
      });
      setShowForm(false);
      setFormData({ name: '', role: '', contact_number: '', email: '', assigned_sport: '' });
      fetchVolunteers();
    } catch (err) {
      setError('Failed to add volunteer. Please try again.');
      console.error('Error adding volunteer:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Volunteer'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Sport</label>
              <select
                required
                value={formData.assigned_sport}
                onChange={(e) => setFormData({ ...formData, assigned_sport: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Sport</option>
                <option value="VOLLEYBALL">Volleyball</option>
                <option value="KABADDI">Kabaddi</option>
                <option value="CRICKET">Cricket</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              Add Volunteer
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {volunteers.map((volunteer) => (
          <div key={volunteer.id} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">{volunteer.name}</h2>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>Role: {volunteer.role}</p>
              <p>Sport: {volunteer.assigned_sport}</p>
              <p>Contact: {volunteer.contact_number}</p>
              <p>Email: {volunteer.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}