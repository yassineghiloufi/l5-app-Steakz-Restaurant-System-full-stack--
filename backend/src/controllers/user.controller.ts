import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import {
  createUserRecord,
  deleteUserRecord,
  getAllUsers,
  updateUserRecord,
} from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json({ success: true, data: { users } });
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  const chainId = req.user?.chainId;
  if (!name || !email || !password || !role || !chainId) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const user = await createUserRecord({
    name,
    email,
    password,
    primaryRole: role,
    roleName: role,
    chainId,
  });
  res.status(201).json({ success: true, data: { user } });
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const user = await updateUserRecord(id, {
    name,
    email,
    primaryRole: role,
    roleName: role,
    assignedById: req.user?.id,
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: { user } });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteUserRecord(id);
  res.json({ success: true, data: { message: 'User deleted' } });
};
