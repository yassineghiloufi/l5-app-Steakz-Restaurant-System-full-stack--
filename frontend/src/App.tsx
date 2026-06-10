import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Unauthorized from './pages/Unauthorized';
import Chains from './pages/Chains';
import Branches from './pages/Branches';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import Customers from './pages/Customers';
import Payroll from './pages/Payroll';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';
import CustomerPortal from './pages/CustomerPortal';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
import { getAuthContext, hasPermission, hasRole } from './utils/auth';
import SuperAdminRoute from './components/SuperAdminRoute';
import { PERMISSIONS } from './constants/permissions';

const sidebarItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Customer Portal', path: '/customer' },
  // Login Tester intentionally not listed in the public sidebar
  { label: 'Users', path: '/users', permission: PERMISSIONS.USERS_VIEW },
  { label: 'Chains', path: '/chains', permission: PERMISSIONS.RESTAURANTS_VIEW },
  { label: 'Branches', path: '/branches', permission: PERMISSIONS.BRANCHES_VIEW },
  { label: 'Orders', path: '/orders', permission: PERMISSIONS.ORDERS_VIEW },
  { label: 'Reservations', path: '/reservations', permission: PERMISSIONS.RESERVATIONS_VIEW },
  { label: 'Customers', path: '/customers', permission: PERMISSIONS.USERS_VIEW },
  { label: 'Payroll', path: '/payroll', permission: PERMISSIONS.PAYROLL_VIEW },
  { label: 'Marketing', path: '/marketing', permission: PERMISSIONS.MARKETING_VIEW },
  { label: 'Settings', path: '/settings', permission: PERMISSIONS.SETTINGS_VIEW },
  { label: 'Inventory', path: '/inventory', permission: PERMISSIONS.INVENTORY_VIEW },
  { label: 'Reports', path: '/reports', permission: PERMISSIONS.REPORTS_VIEW },
  { label: 'Tasks', path: '/tasks', permission: PERMISSIONS.ORDERS_VIEW },
  { label: 'Roles', path: '/roles', permission: PERMISSIONS.USERS_ASSIGN_ROLES },
  { label: 'Permissions', path: '/permissions', permission: PERMISSIONS.USERS_ASSIGN_ROLES },
];

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const authContext = getAuthContext();

  const visibleMenu = sidebarItems.filter((item) => {
    if (item.path === '/permissions' || item.path === '/roles') return hasRole('SUPER_ADMIN');
    return !item.permission || hasPermission(item.permission);
  });

  const handleLogout = () => {
    localStorage.removeItem('steakz_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {!isLoginPage && (
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl font-semibold">Steakz MIS</div>
              <div className="text-sm text-slate-500">{authContext?.primaryRole || 'Guest'}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {visibleMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {authContext && (
                <button onClick={handleLogout} className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900">
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/customer" element={<CustomerPortal />} />
        {/* /login-tester removed — tester component deleted; only SUPER_ADMIN can use testing tools via backend or admin UI */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="" element={<Dashboard />} />
          <Route path="users" element={<PermissionRoute permission={PERMISSIONS.USERS_VIEW} />}>
            <Route path="" element={<Users />} />
          </Route>
          <Route path="chains" element={<Chains />} />
          <Route path="branches" element={<Branches />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="inventory" element={<PermissionRoute permission={PERMISSIONS.INVENTORY_VIEW} />}>
            <Route path="" element={<Inventory />} />
          </Route>
          <Route path="reports" element={<PermissionRoute permission={PERMISSIONS.REPORTS_VIEW} />}>
            <Route path="" element={<Reports />} />
          </Route>
          <Route path="tasks" element={<Tasks />} />
          <Route path="roles" element={<SuperAdminRoute />}>
            <Route path="" element={<Roles />} />
          </Route>
          <Route path="permissions" element={<SuperAdminRoute />}>
            <Route path="" element={<Permissions />} />
          </Route>
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
