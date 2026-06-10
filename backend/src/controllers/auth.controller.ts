import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { loginUser, getUserById } from '../services/user.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const result = await loginUser(email, password);
  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json(result);
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Profile access denied' });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: { user } });
};
