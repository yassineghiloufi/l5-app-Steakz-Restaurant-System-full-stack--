import { useEffect, useState } from 'react';
import api from '../api';

const Settings = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, { value: string; enabled: boolean }>>({});
  const [message, setMessage] = useState('');

  const loadSettings = async () => {
    const response = await api.get('/operations/settings');
    setSettings(response.data.data.settings);
    const initialEdits: Record<string, { value: string; enabled: boolean }> = {};
    response.data.data.settings.forEach((setting: any) => {
      initialEdits[setting.id] = { value: setting.value, enabled: setting.enabled };
    });
    setEdits(initialEdits);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdate = async (id: string) => {
    if (!edits[id]) return;
    await api.put(`/operations/settings/${id}`, edits[id]);
    setMessage('Setting updated successfully');
    loadSettings();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">System Settings</h1>
      <div className="mt-6 space-y-6">
        {message && <p className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
        {settings.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">No configured settings found.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Key</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Enabled</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {settings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 text-sm text-slate-900">{setting.key}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <input
                        value={edits[setting.id]?.value ?? ''}
                        onChange={(e) => setEdits({ ...edits, [setting.id]: { ...edits[setting.id], value: e.target.value } })}
                        className="w-full rounded-xl border px-3 py-2"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={edits[setting.id]?.enabled ?? false}
                          onChange={(e) => setEdits({ ...edits, [setting.id]: { ...edits[setting.id], enabled: e.target.checked } })}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                        Enabled
                      </label>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <button
                        onClick={() => handleUpdate(setting.id)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
