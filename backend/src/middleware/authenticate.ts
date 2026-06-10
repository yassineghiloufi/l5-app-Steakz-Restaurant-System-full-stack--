import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserContextById, UserContext } from '../services/rbac.service';

export interface AuthRequest extends Request {
  user?: UserContext;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing JWT_SECRET');
    }

    const payload = jwt.verify(token, secret) as { id: string; email: string };
    const userContext = await getUserContextById(payload.id);
    if (!userContext) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    req.user = userContext;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authenticate;
