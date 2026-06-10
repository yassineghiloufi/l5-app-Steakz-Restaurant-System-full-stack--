import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../controllers/user.controller';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.use(authenticate);

router.get('/', authorize({ permissions: [PERMISSIONS.USERS_VIEW] }), getUsers);
router.post('/', authorize({ permissions: [PERMISSIONS.USERS_CREATE] }), createUser);
router.put('/:id', authorize({ permissions: [PERMISSIONS.USERS_EDIT] }), updateUser);
router.delete('/:id', authorize({ permissions: [PERMISSIONS.USERS_DELETE] }), deleteUser);

export default router;
