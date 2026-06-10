import { Navigate, Outlet } from 'react-router-dom';
import { getAuthContext } from '../utils/auth';

const SuperAdminRoute = () => {
  const ctx = getAuthContext();
  if (!ctx) return <Navigate to="/login" replace />;
  if (ctx.primaryRole !== 'SUPER_ADMIN') return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default SuperAdminRoute;
