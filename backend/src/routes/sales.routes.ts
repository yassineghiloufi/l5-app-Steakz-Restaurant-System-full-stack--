import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  createSale,
  getSales,
  getDailyRevenue,
  getWeeklyRevenue,
} from '../controllers/sales.controller';
import { SALES_ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate);
router.use(authorize({ roles: SALES_ROLES }));

router.get('/', getSales);
router.post('/', createSale);
router.get('/reports/daily', getDailyRevenue);
router.get('/reports/weekly', getWeeklyRevenue);

export default router;
