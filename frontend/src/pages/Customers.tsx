import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');
  const [message, setMessage] = useState('');

  const loadCustomers = async () => {
    const response = await api.get('/operations/customers');
    setCustomers(response.data.data.customers);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/operations/customers', {
      name,
      email,
      phone,
      loyaltyPoints: Number(loyaltyPoints),
    });
    setName('');
    setEmail('');
    setPhone('');
    setLoyaltyPoints('0');
    setMessage('Customer created successfully');
    loadCustomers();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Customer Management</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.phone ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Customer</h2>
          {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Loyalty Points</label>
              <input value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} type="number" min="0" className="mt-2 w-full rounded-xl border px-3 py-2" />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add Customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Customers;
