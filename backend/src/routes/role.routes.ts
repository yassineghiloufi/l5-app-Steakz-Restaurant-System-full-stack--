import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  createPermission,
  createRole,
  getPermissions,
  getRoles,
  updateRolePermissions,
} from '../controllers/role.controller';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.use(authenticate);
// Restrict role & permission management to SUPER_ADMIN only
router.get('/', authorize({ roles: ['SUPER_ADMIN'] }), getRoles);
router.post('/', authorize({ roles: ['SUPER_ADMIN'] }), createRole);
router.get('/permissions', authorize({ roles: ['SUPER_ADMIN'] }), getPermissions);
router.post('/permissions', authorize({ roles: ['SUPER_ADMIN'] }), createPermission);
router.put('/:roleId/permissions', authorize({ roles: ['SUPER_ADMIN'] }), updateRolePermissions);

export default router;
