import { useEffect, useMemo, useState } from 'react';
import api from '../api';

interface ReportRow {
  day?: string;
  week?: string;
  revenue: number;
}

const Reports = () => {
  const [daily, setDaily] = useState<ReportRow[]>([]);
  const [weekly, setWeekly] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          api.get('/sales/reports/daily'),
          api.get('/sales/reports/weekly'),
        ]);

        setDaily(dailyRes.data.data.report || []);
        setWeekly(weeklyRes.data.data.report || []);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const totalDaily = useMemo(
    () => daily.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [daily],
  );

  const totalWeekly = useMemo(
    () => weekly.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [weekly],
  );

  return (
    <div className="mx-auto max-w-7xl py-8 px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-2 text-slate-600">Review daily and weekly revenue trends for your operations.</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">Updated data from daily and weekly sales reports.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-700">
                {loading ? 'Loading' : 'Current'}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Daily revenue</p>
                <div className="mt-3 text-3xl font-semibold text-slate-900">${totalDaily.toFixed(2)}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Weekly revenue</p>
                <div className="mt-3 text-3xl font-semibold text-slate-900">${totalWeekly.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Daily report</h2>
                <p className="mt-1 text-sm text-slate-500">Revenue totals per day.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-700">
                {daily.length} days
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        Loading daily report...
                      </td>
                    </tr>
                  ) : daily.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        No daily revenue data available.
                      </td>
                    </tr>
                  ) : (
                    daily.map((item) => (
                      <tr key={item.day ?? Math.random()}>
                        <td className="px-4 py-4 text-slate-700">{item.day ? new Date(item.day).toLocaleDateString() : 'Unknown'}</td>
                        <td className="px-4 py-4 font-semibold text-slate-900">${Number(item.revenue).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Weekly report</h2>
                <p className="mt-1 text-sm text-slate-500">Revenue totals per week.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-700">
                {weekly.length} weeks
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3">Week</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        Loading weekly report...
                      </td>
                    </tr>
                  ) : weekly.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        No weekly revenue data available.
                      </td>
                    </tr>
                  ) : (
                    weekly.map((item) => (
                      <tr key={item.week ?? Math.random()}>
                        <td className="px-4 py-4 text-slate-700">{item.week ? new Date(item.week).toLocaleDateString() : 'Unknown'}</td>
                        <td className="px-4 py-4 font-semibold text-slate-900">${Number(item.revenue).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reports;
