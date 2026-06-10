import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  assignTask,
  getTasks,
  updateTask,
} from '../controllers/task.controller';
import { TASK_EDIT_ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', authorize({ roles: TASK_EDIT_ROLES }), assignTask);
router.put('/:id', authorize({ roles: TASK_EDIT_ROLES }), updateTask);

export default router;
