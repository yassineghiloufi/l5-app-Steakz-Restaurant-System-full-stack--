import { Request, Response } from 'express';
import {
  assignPermissionsToRoleById,
  createOrUpdatePermission,
  createOrUpdateRole,
  getAllPermissions,
  getAllRoles,
} from '../services/rbac.service';

export const getRoles = async (req: Request, res: Response) => {
  const roles = await getAllRoles();
  res.json({ success: true, data: { roles } });
};

export const getPermissions = async (req: Request, res: Response) => {
  const permissions = await getAllPermissions();
  res.json({ success: true, data: { permissions } });
};

export const createRole = async (req: Request, res: Response) => {
  const { name, description, isSystem } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Role name is required' });
  }
  const role = await createOrUpdateRole(name, description, Boolean(isSystem));
  res.status(201).json({ success: true, data: { role } });
};

export const createPermission = async (req: Request, res: Response) => {
  const { name, description, group } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Permission name is required' });
  }
  const permission = await createOrUpdatePermission(name, description, group);
  res.status(201).json({ success: true, data: { permission } });
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { permissions } = req.body;
  if (!roleId || !Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: 'Invalid parameters' });
  }
  const result = await assignPermissionsToRoleById(roleId, permissions);
  res.json({ success: true, data: { result } });
};
