import { FormEvent, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { PERMISSIONS } from '../constants/permissions';
import { hasPermission } from '../utils/auth';

const roleOptions = [
  'SUPER_ADMIN',
  'ADMIN',
  'CHAIN_OWNER',
  'OPERATIONS_DIRECTOR',
  'REGIONAL_MANAGER',
  'BRANCH_MANAGER',
  'KITCHEN_MANAGER',
  'INVENTORY_MANAGER',
  'FINANCE_MANAGER',
  'HR_MANAGER',
  'MARKETING_MANAGER',
  'SUPERVISOR',
  'CASHIER',
  'WAITER',
  'CHEF',
  'KITCHEN_STAFF',
  'RECEPTIONIST',
  'DELIVERY_DRIVER',
  'ACCOUNTANT',
  'CUSTOMER_SUPPORT',
];

interface UserRecord {
  id: string;
  name: string;
  email: string;
  primaryRole: string;
  createdAt: string;
  branches: Array<{ branch: { id: string; name: string; code: string } }>;
  departments: Array<{ department: { id: string; name: string } }>;
  roles: Array<{
    role: {
      id: string;
      name: string;
      permissions: Array<{ permission: { name: string } }>;
    };
  }>;
}

const Users = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roleOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users', { name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole(roleOptions[0]);
      await loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await api.delete(`/users/${id}`);
      await loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userPermissions = useMemo(
    () =>
      users.reduce<Record<string, string[]>>((acc, user) => {
        const permissionsSet = new Set<string>();
        user.roles.forEach((userRole) => {
          userRole.role.permissions.forEach((permissionEntry) => {
            permissionsSet.add(permissionEntry.permission.name);
          });
        });
        acc[user.id] = Array.from(permissionsSet).sort();
        return acc;
      }, {}),
    [users],
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="mt-2 text-slate-600">Create, view, and delete staff accounts based on your permissions.</p>
        </div>
      </div>

      {hasPermission(PERMISSIONS.USERS_CREATE) && (
        <form onSubmit={handleCreateUser} className="my-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Jane Doe" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="jane@steakz.local" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Secure password" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {roleOptions.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Saving...' : 'Create User'}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Assigned Permissions</th>
              {hasPermission(PERMISSIONS.USERS_DELETE) && <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => {
              const branchNames = user.branches.map((entry) => entry.branch.name).join(', ') || 'N/A';
              const departmentNames = user.departments.map((entry) => entry.department.name).join(', ') || 'N/A';
              const permissions = userPermissions[user.id] || [];

              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.primaryRole}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{branchNames}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{departmentNames}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {permissions.slice(0, 3).map((permission) => (
                          <span key={permission} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                            {permission}
                          </span>
                        ))}
                        {permissions.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                            +{permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">No permissions</span>
                    )}
                  </td>
                  {hasPermission(PERMISSIONS.USERS_DELETE) && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteUser(user.id)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
