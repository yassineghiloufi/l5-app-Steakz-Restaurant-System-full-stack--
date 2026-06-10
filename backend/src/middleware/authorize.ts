import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';

type GuardOptions = {
  roles?: string[];
  permissions?: string[];
};

const authorize = ({ roles, permissions }: GuardOptions) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (roles && !roles.some((role) => user.roleNames.includes(role))) {
      return res.status(403).json({ success: false, message: 'Insufficient role permissions' });
    }

    if (permissions && !permissions.every((permission) => user.permissions.includes(permission))) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

export default authorize;
