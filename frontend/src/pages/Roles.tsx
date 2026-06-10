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

const Roles = () => {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolePermissionMap, setRolePermissionMap] = useState<Record<string, Set<string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
      ]);

      const fetchedRoles: RoleRecord[] = rolesResponse.data.data.roles;
      setRoles(fetchedRoles);
      setPermissions(permissionsResponse.data.data.permissions);
      setRolePermissionMap(
        fetchedRoles.reduce((map, role) => {
          map[role.id] = new Set(role.permissions.map((rp) => rp.permission.name));
          return map;
        }, {} as Record<string, Set<string>>),
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRoles = useMemo(
    () => roles.filter((role) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(search.toLowerCase()),
    ),
    [roles, search],
  );

  const handleCreateRole = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/roles', {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName('');
      setDescription('');
      setMessage(`Role "${response.data.data.role.name}" created successfully.`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create role.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePermissions = (roleId: string) => {
    setSelectedRoleId((current) => (current === roleId ? null : roleId));
    setMessage(null);
    setError(null);
  };

  const handlePermissionToggle = (roleId: string, permissionName: string) => {
    setRolePermissionMap((current) => {
      const next = { ...current };
      const permissions = new Set(next[roleId] || []);
      if (permissions.has(permissionName)) {
        permissions.delete(permissionName);
      } else {
        permissions.add(permissionName);
      }
      next[roleId] = permissions;
      return next;
    });
  };

  const handleSavePermissions = async (roleId: string) => {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const permissionNames = Array.from(rolePermissionMap[roleId] || []);
      await api.put(`/roles/${roleId}/permissions`, { permissions: permissionNames });
      setMessage('Permissions updated successfully.');
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Role Management</h1>
          <p className="mt-2 text-slate-600">Create roles, review role descriptions, and manage assigned permissions.</p>
        </div>
        <div className="w-full md:w-96">
          <label className="block text-sm font-medium text-slate-700">Search roles</label>
          <input
            type="text"
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            placeholder="Search roles by name or description"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Loading roles...</div>
          ) : filteredRoles.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">No roles found.</div>
          ) : (
            filteredRoles.map((role) => (
              <div key={role.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{role.name.replace(/_/g, ' ')}</h2>
                    <p className="mt-2 text-sm text-slate-500">{role.description || 'No description provided.'}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">{role.permissions.length} permission{role.permissions.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePermissions(role.id)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {selectedRoleId === role.id ? 'Close editor' : 'Edit permissions'}
                    </button>
                  </div>
                </div>

                {selectedRoleId === role.id && (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-700">Permission editor</span>
                      <span className="text-sm text-slate-500">Toggle permissions and save the updated role access.</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <input
                            type="checkbox"
                            checked={rolePermissionMap[role.id]?.has(permission.name) || false}
                            onChange={() => handlePermissionToggle(role.id, permission.name)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{permission.name}</div>
                            <p className="text-sm text-slate-500">{permission.description || 'No description available.'}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{permission.group || 'Unsorted'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSavePermissions(role.id)}
                        disabled={saving}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {saving ? 'Saving...' : 'Save permissions'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleId(null)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {role.permissions.map((rp) => (
                    <span key={rp.permission.id} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {rp.permission.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Create new role</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new role and then assign permissions using the role editor.</p>

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

            <form onSubmit={handleCreateRole} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Role name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. STORE_MANAGER"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  placeholder="Optional description for the new role"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? 'Creating...' : 'Create role'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Roles;
