import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [chains, setChains] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [message, setMessage] = useState('');

  const loadBranches = async () => {
    const response = await api.get('/operations/branches');
    setBranches(response.data.data.branches);
  };

  const loadChains = async () => {
    const response = await api.get('/operations/chains');
    setChains(response.data.data.chains);
    setChainId(response.data.data.chains[0]?.id || '');
  };

  useEffect(() => {
    loadChains();
    loadBranches();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/operations/branches', { name, code, region, address, chainId });
    setName('');
    setCode('');
    setRegion('');
    setAddress('');
    setMessage('Branch created successfully');
    loadBranches();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Branch Management</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Region</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{branch.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{branch.region}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{branch.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Branch</h2>
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
              <label className="block text-sm font-medium">Chain</label>
              <select value={chainId} onChange={(e) => setChainId(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Region</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create Branch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Branches;
