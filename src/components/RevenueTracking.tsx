import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Revenue } from '../types/database.types';

export default function RevenueTracking() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);

  useEffect(() => {
    async function fetchRevenues() {
      const revenuesSnapshot = await getDocs(collection(db, 'revenues'));
      const revenuesList = revenuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Revenue));
      setRevenues(revenuesList);
    }

    fetchRevenues();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Revenue Tracking</h1>
      <div className="grid gap-6">
        {revenues.map((revenue) => (
          <div key={revenue.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold">{revenue.event_name}</h2>
            <div className="mt-4 space-y-2">
              <p>Amount: ₹{revenue.amount.toLocaleString()}</p>
              <p>Type: {revenue.type}</p>
              <p>Date: {revenue.date.toLocaleDateString()}</p>
              {revenue.notes && <p>Notes: {revenue.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}