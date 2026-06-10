import { useEffect, useState } from 'react';
import api from '../api';

const Payroll = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    api.get('/operations/payroll').then((response) => setRecords(response.data.data.payrollRecords));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">Payroll</h1>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Processed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 text-sm text-slate-900">{record.user?.name ?? 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">${record.amount?.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(record.periodStart).toLocaleDateString()} - {new Date(record.periodEnd).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{record.processed ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;
