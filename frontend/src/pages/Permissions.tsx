import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import api from '../api';

interface PermissionRecord {
  id: string;
  name: string;
  description?: string;
  group?: string;
}

interface RoleRecord {
  id: string;
  name: string;
  description?: string;
  permissions: Array<{ permission: PermissionRecord }>;
}

const Permissions = () => {
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [group, setGroup] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
      ]);
      setRoles(rolesResponse.data.data.roles);
      setPermissions(permissionsResponse.data.data.permissions);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load permission data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rolePermissionSets = useMemo(() => {
    return roles.reduce<Record<string, Set<string>>>((acc, role) => {
      acc[role.id] = new Set(role.permissions.map((entry) => entry.permission.name));
      return acc;
    }, {});
  }, [roles]);

  const filteredPermissions = useMemo(() => {
    return permissions
      .filter((permission) =>
        permission.name.toLowerCase().includes(search.toLowerCase()) ||
        (permission.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (permission.group || 'unsorted').toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => (a.group || 'Unsorted').localeCompare(b.group || 'Unsorted') || a.name.localeCompare(b.name));
  }, [permissions, search]);

  const handleInputChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(event.target.value);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!name.trim()) {
      setError('Permission name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/roles/permissions', {
        name: name.trim(),
        description: description.trim() || undefined,
        group: group.trim() || undefined,
      });

      const createdPermission = response.data.data.permission;
      setPermissions((current) => [createdPermission, ...current]);
      setName('');
      setDescription('');
      setGroup('');
      setMessage(`Permission "${createdPermission.name}" created successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to create permission.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Permission Management</h1>
          <p className="mt-2 text-slate-600">View the permissions assigned to each role and add new permission definitions.</p>
        </div>
        <div className="w-full md:w-96">
          <label className="block text-sm font-medium text-slate-700">Search permissions</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permission name, description or group"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Create new permission</h2>
            <p className="mt-1 text-sm text-slate-500">Only SUPER_ADMIN can add new permissions in the system.</p>

            {message && (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Permission name</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleInputChange(setName)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. orders.create"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={handleInputChange(setDescription)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Group</label>
                <input
                  type="text"
                  value={group}
                  onChange={handleInputChange(setGroup)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. orders, inventory, payroll"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? 'Saving...' : 'Create permission'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Role permission matrix</h2>
                <p className="mt-1 text-sm text-slate-500">This table shows which roles have which permissions assigned.</p>
              </div>
              {!loading && !filteredPermissions.length && (
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  No matches
                </div>
              )}
            </div>

            <div className="mt-6 overflow-auto rounded-2xl border border-slate-100">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="sticky left-0 z-20 border-r border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Permission</th>
                    {roles.map((role) => (
                      <th key={role.id} className="border-r border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
                        {role.name.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={roles.length + 1} className="px-4 py-6 text-slate-600">
                        Loading permissions...
                      </td>
                    </tr>
                  ) : filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={roles.length + 1} className="px-4 py-6 text-slate-600">
                        No permissions match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <tr key={permission.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="sticky left-0 z-10 w-72 border-r border-slate-100 bg-white px-4 py-3">
                          <div className="font-medium text-slate-900">{permission.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{permission.group || 'Unsorted'}</div>
                        </td>
                        {roles.map((role) => (
                          <td key={`${permission.id}-${role.id}`} className="px-4 py-3 text-center">
                            {rolePermissionSets[role.id]?.has(permission.name) ? (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">✓</span>
                            ) : (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">✕</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Permissions;
