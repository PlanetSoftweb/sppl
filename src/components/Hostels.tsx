import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Users, Trophy } from 'lucide-react';
import type { Hostel } from '../types';

export default function Hostels() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const hostelsSnap = await getDocs(collection(db, 'hostels'));
        const hostelsData = hostelsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Hostel[];
        setHostels(hostelsData);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Hostels</h1>
        <Link
          to="/add-hostel"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Add New Hostel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <Link
            key={hostel.id}
            to={`/hostel/${hostel.id}`}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{hostel.name}</h3>
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              
              <div className="flex items-center text-gray-400 mb-4">
                <Users className="h-4 w-4 mr-2" />
                <span>{hostel.totalStudents} Students</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Participating Sports</h4>
                <div className="flex flex-wrap gap-2">
                  {hostel.sports && Object.entries(hostel.sports)
                    .filter(([_, participating]) => participating)
                    .map(([sport]) => (
                      <span
                        key={sport}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {hostels.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg">
            <Trophy className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Hostels Yet</h3>
            <p className="text-gray-400 mb-4">Get started by adding your first hostel</p>
            <Link
              to="/add-hostel"
              className="inline-flex items-center bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Add Hostel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}