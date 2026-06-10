import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken, hasPermission } from '../utils/auth';

type PermissionRouteProps = {
  permission: string;
  fallback?: string;
};

const PermissionRoute = ({ permission, fallback = '/unauthorized' }: PermissionRouteProps) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
