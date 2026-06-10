import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import prisma from '../services/prismaClient';
import { ROLES } from '../constants/roles';

export const authorizeBranchScope = (paramName = 'branchId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const body = req.body as Record<string, any> | undefined;
    const branchId = req.params[paramName] || body?.[paramName];
    if (!branchId) {
      return res.status(400).json({ success: false, message: `Missing ${paramName}` });
    }

    if (user.roleNames.includes(ROLES.SUPER_ADMIN) || user.roleNames.includes(ROLES.CHAIN_OWNER)) {
      return next();
    }

    if (user.branchIds.includes(branchId)) {
      return next();
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    if (branch.chainId !== user.chainId) {
      return res.status(403).json({ success: false, message: 'Branch not in your chain' });
    }

    return res.status(403).json({ success: false, message: 'Insufficient branch access' });
  };
};

export const authorizeDepartmentScope = (paramName = 'departmentId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const body = req.body as Record<string, any> | undefined;
    const departmentId = req.params[paramName] || body?.[paramName];
    if (!departmentId) {
      return res.status(400).json({ success: false, message: `Missing ${paramName}` });
    }

    if (user.roleNames.includes(ROLES.SUPER_ADMIN) || user.roleNames.includes(ROLES.CHAIN_OWNER)) {
      return next();
    }

    if (user.departmentIds.includes(departmentId)) {
      return next();
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (department.chainId !== user.chainId) {
      return res.status(403).json({ success: false, message: 'Department not in your chain' });
    }

    return res.status(403).json({ success: false, message: 'Insufficient department access' });
  };
};
