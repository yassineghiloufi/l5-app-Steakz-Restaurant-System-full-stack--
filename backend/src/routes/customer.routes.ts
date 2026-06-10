import { Router } from 'express';
import {
  getPublicBranches,
  getPublicMenu,
  getCustomerProfile,
  placeCustomerOrder,
} from '../controllers/customer.controller';

const router = Router();

router.get('/branches', getPublicBranches);
router.get('/menu', getPublicMenu);
router.get('/profile/:email', getCustomerProfile);
router.post('/orders', placeCustomerOrder);

export default router;
