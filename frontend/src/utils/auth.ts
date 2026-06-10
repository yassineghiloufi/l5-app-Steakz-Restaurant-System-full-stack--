export type AuthPayload = {
  id: string;
  email: string;
  primaryRole: string;
  chainId: string;
  roleNames: string[];
  permissions: string[];
  branchIds: string[];
  departmentIds: string[];
};

export const getAuthToken = () => localStorage.getItem('steakz_token');

export const parseJwt = <T extends object>(token: string): T | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
};

export const getAuthContext = (): AuthPayload | null => {
  const token = getAuthToken();
  if (!token) return null;
  return parseJwt<AuthPayload>(token);
};

export const hasPermission = (permission: string): boolean => {
  const context = getAuthContext();
  return Boolean(context?.permissions?.includes(permission));
};

export const hasRole = (role: string): boolean => {
  const context = getAuthContext();
  return Boolean(context?.roleNames?.includes(role) || context?.primaryRole === role);
};
