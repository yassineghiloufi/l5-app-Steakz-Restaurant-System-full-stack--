import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import {
  createNewBranch,
  createNewChain,
  createNewCustomer,
  createMarketingCampaignController,
  createNewOrder,
  createNewReservation,
  deleteExistingBranch,
  deleteExistingChain,
  deleteExistingCustomer,
  deleteMarketingCampaignController,
  getBranches,
  getChains,
  getCustomers,
  getMarketingCampaignsController,
  getMenuItems,
  getOrders,
  getPayrollRecordsController,
  getReservations,
  getSettingsController,
  processPayrollController,
  updateExistingBranch,
  updateExistingChain,
  updateExistingCustomer,
  updateMarketingCampaignController,
  updateExistingOrder,
  updateExistingReservation,
  updateSettingController,
  cancelExistingOrder,
  cancelExistingReservation,
  createNewMenuItem,
} from '../controllers/operations.controller';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();
router.use(authenticate);

router.get('/chains', authorize({ permissions: [PERMISSIONS.RESTAURANTS_VIEW] }), getChains);
router.post('/chains', authorize({ permissions: [PERMISSIONS.RESTAURANTS_CREATE] }), createNewChain);
router.put('/chains/:id', authorize({ permissions: [PERMISSIONS.RESTAURANTS_EDIT] }), updateExistingChain);
router.delete('/chains/:id', authorize({ permissions: [PERMISSIONS.RESTAURANTS_DELETE] }), deleteExistingChain);

router.get('/branches', authorize({ permissions: [PERMISSIONS.BRANCHES_VIEW] }), getBranches);
router.post('/branches', authorize({ permissions: [PERMISSIONS.BRANCHES_CREATE] }), createNewBranch);
router.put('/branches/:id', authorize({ permissions: [PERMISSIONS.BRANCHES_EDIT] }), updateExistingBranch);
router.delete('/branches/:id', authorize({ permissions: [PERMISSIONS.BRANCHES_DELETE] }), deleteExistingBranch);

router.get('/orders', authorize({ permissions: [PERMISSIONS.ORDERS_VIEW] }), getOrders);
router.post('/orders', authorize({ permissions: [PERMISSIONS.ORDERS_CREATE] }), createNewOrder);
router.put('/orders/:id', authorize({ permissions: [PERMISSIONS.ORDERS_EDIT] }), updateExistingOrder);
router.post('/orders/:id/cancel', authorize({ permissions: [PERMISSIONS.ORDERS_CANCEL] }), cancelExistingOrder);
router.get('/menu', authorize({ permissions: [PERMISSIONS.ORDERS_VIEW] }), getMenuItems);
router.post('/menu', authorize({ permissions: [PERMISSIONS.ORDERS_CREATE] }), createNewMenuItem);

router.get('/reservations', authorize({ permissions: [PERMISSIONS.RESERVATIONS_VIEW] }), getReservations);
router.post('/reservations', authorize({ permissions: [PERMISSIONS.RESERVATIONS_CREATE] }), createNewReservation);
router.put('/reservations/:id', authorize({ permissions: [PERMISSIONS.RESERVATIONS_EDIT] }), updateExistingReservation);
router.post('/reservations/:id/cancel', authorize({ permissions: [PERMISSIONS.RESERVATIONS_CANCEL] }), cancelExistingReservation);

router.get('/customers', authorize({ permissions: [PERMISSIONS.USERS_VIEW] }), getCustomers);
router.post('/customers', authorize({ permissions: [PERMISSIONS.USERS_CREATE] }), createNewCustomer);
router.put('/customers/:id', authorize({ permissions: [PERMISSIONS.USERS_EDIT] }), updateExistingCustomer);
router.delete('/customers/:id', authorize({ permissions: [PERMISSIONS.USERS_DELETE] }), deleteExistingCustomer);

router.get('/payroll', authorize({ permissions: [PERMISSIONS.PAYROLL_VIEW] }), getPayrollRecordsController);
router.post('/payroll/process', authorize({ permissions: [PERMISSIONS.PAYROLL_PROCESS] }), processPayrollController);

router.get('/marketing', authorize({ permissions: [PERMISSIONS.MARKETING_VIEW] }), getMarketingCampaignsController);
router.post('/marketing', authorize({ permissions: [PERMISSIONS.MARKETING_MANAGE] }), createMarketingCampaignController);
router.put('/marketing/:id', authorize({ permissions: [PERMISSIONS.MARKETING_MANAGE] }), updateMarketingCampaignController);
router.delete('/marketing/:id', authorize({ permissions: [PERMISSIONS.MARKETING_MANAGE] }), deleteMarketingCampaignController);

router.get('/settings', authorize({ permissions: [PERMISSIONS.SETTINGS_VIEW] }), getSettingsController);
router.put('/settings/:id', authorize({ permissions: [PERMISSIONS.SETTINGS_MANAGE] }), updateSettingController);

export default router;
