import { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((response) => setData(response.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">Users</h2>
          <p className="mt-3 text-3xl font-semibold">{data?.users?.length ?? '—'}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">Inventory Items</h2>
          <p className="mt-3 text-3xl font-semibold">{data?.inventory?.length ?? '—'}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">Sales Records</h2>
          <p className="mt-3 text-3xl font-semibold">{data?.sales?.length ?? '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
