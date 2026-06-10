import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Chains = () => {
  const [chains, setChains] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const loadChains = async () => {
    const response = await api.get('/operations/chains');
    setChains(response.data.data.chains);
  };

  useEffect(() => {
    loadChains();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/operations/chains', { name, code, description });
    setName('');
    setCode('');
    setDescription('');
    setMessage('Chain created successfully');
    loadChains();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Restaurant Chains</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Branches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {chains.map((chain) => (
                  <tr key={chain.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{chain.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{chain.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{chain.branches?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Chain</h2>
          {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" rows={3} />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create Chain
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chains;
