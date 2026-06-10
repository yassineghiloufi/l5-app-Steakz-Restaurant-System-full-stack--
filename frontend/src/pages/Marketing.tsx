import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Marketing = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [budget, setBudget] = useState('0');
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState('');

  const loadCampaigns = async () => {
    const response = await api.get('/operations/marketing');
    setCampaigns(response.data.data.campaigns);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/operations/marketing', {
      title,
      channel,
      budget: Number(budget),
      active,
    });
    setTitle('');
    setChannel('');
    setBudget('0');
    setActive(true);
    setMessage('Campaign created successfully');
    loadCampaigns();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Marketing Campaigns</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Channel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Budget</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{campaign.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{campaign.channel}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">${campaign.budget?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{campaign.active ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">New Campaign</h2>
          {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Channel</label>
              <input value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Budget</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div className="flex items-center gap-3">
              <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
              <label htmlFor="active" className="text-sm font-medium">Active</label>
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create Campaign
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
