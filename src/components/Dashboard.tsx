import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalTeams: 0,
    totalVolunteers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [hostelsSnap, teamsSnap, volunteersSnap, revenuesSnap] = await Promise.all([
          getDocs(collection(db, 'hostels')),
          getDocs(collection(db, 'teams')),
          getDocs(collection(db, 'volunteers')),
          getDocs(collection(db, 'revenues')),
        ]);

        const totalRevenue = revenuesSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          return acc + (Number(data.amount) || 0);
        }, 0);

        setStats({
          totalHostels: hostelsSnap.size,
          totalTeams: teamsSnap.size,
          totalVolunteers: volunteersSnap.size,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Sports Event Management Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Hostels" 
            value={stats.totalHostels} 
            icon={<BuildingIcon />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard 
            title="Total Teams" 
            value={stats.totalTeams} 
            icon={<TeamIcon />}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard 
            title="Total Volunteers" 
            value={stats.totalVolunteers} 
            icon={<VolunteerIcon />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={<RevenueIcon />}
            gradient="from-green-500 to-green-600"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <div className="space-y-4">
              <ActivityItem 
                title="New Team Registration"
                description="Volleyball team from Hostel A registered"
                time="2 hours ago"
              />
              <ActivityItem 
                title="Revenue Update"
                description="New sponsorship payment received"
                time="5 hours ago"
              />
              <ActivityItem 
                title="Volunteer Assignment"
                description="3 new volunteers assigned to Cricket event"
                time="1 day ago"
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              <EventItem 
                title="Inter-Hostel Cricket Tournament"
                date="Feb 15, 2024"
                status="Scheduled"
              />
              <EventItem 
                title="Volleyball Championship"
                date="Feb 20, 2024"
                status="Registration Open"
              />
              <EventItem 
                title="Kabaddi League"
                date="Mar 1, 2024"
                status="Planning"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
        </div>
        <div className="text-gray-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, description, time }: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="border-l-4 border-indigo-500 pl-4">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  );
}

function EventItem({ title, date, status }: {
  title: string;
  date: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-700 bg-opacity-50 rounded-lg">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-400">{date}</p>
      </div>
      <span className="px-3 py-1 text-xs font-medium bg-indigo-500 bg-opacity-20 text-indigo-300 rounded-full">
        {status}
      </span>
    </div>
  );
}

// Icons
function BuildingIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function VolunteerIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}