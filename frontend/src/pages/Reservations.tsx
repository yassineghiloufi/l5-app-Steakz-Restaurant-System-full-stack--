import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Reservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [reservationTime, setReservationTime] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('');

  const loadReservations = async () => {
    const response = await api.get('/operations/reservations');
    setReservations(response.data.data.reservations);
  };

  const loadBranches = async () => {
    const response = await api.get('/operations/branches');
    setBranches(response.data.data.branches);
    setBranchId(response.data.data.branches[0]?.id || '');
  };

  useEffect(() => {
    loadReservations();
    loadBranches();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post('/operations/reservations', {
      branchId,
      guestName,
      partySize: Number(partySize),
      reservationTime,
      status,
    });
    setGuestName('');
    setPartySize('2');
    setReservationTime('');
    setStatus('PENDING');
    setMessage('Reservation created successfully');
    loadReservations();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Reservations</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Guest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Branch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Party Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{reservation.guestName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{reservation.branch?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{reservation.partySize}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{reservation.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Reservation</h2>
          {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Branch</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Guest Name</label>
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Party Size</label>
              <input value={partySize} onChange={(e) => setPartySize(e.target.value)} type="number" min="1" className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Reservation Time</label>
              <input value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} type="datetime-local" className="mt-2 w-full rounded-xl border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2">
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create Reservation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
