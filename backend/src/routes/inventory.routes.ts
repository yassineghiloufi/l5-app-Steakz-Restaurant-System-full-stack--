import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  addInventory,
  deleteInventory,
  getInventory,
  updateInventory,
} from '../controllers/inventory.controller';
import { INVENTORY_ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate);
router.use(authorize({ roles: INVENTORY_ROLES }));

router.get('/', getInventory);
router.post('/', addInventory);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;
