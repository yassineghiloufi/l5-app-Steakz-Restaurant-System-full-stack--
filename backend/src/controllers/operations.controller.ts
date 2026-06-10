import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ROLES } from '../constants/roles';
import {
  createBranch,
  createChain,
  createCustomer,
  createMarketingCampaign,
  createMenuItem,
  createOrder,
  createReservation,
  deleteBranch,
  deleteChain,
  deleteCustomer,
  deleteMarketingCampaign,
  fetchBranches,
  fetchChains,
  fetchCustomers,
  fetchMarketingCampaigns,
  fetchMenuItems,
  fetchOrders,
  fetchPayrollRecords,
  fetchReservations,
  fetchSettings,
  getOrderById,
  getReservationById,
  processPayroll,
  updateBranch,
  updateChain,
  updateCustomer,
  updateMarketingCampaign,
  updateOrder,
  updateReservation,
  updateSetting,
  cancelOrder,
  cancelReservation,
} from '../services/operations.service';

const hasGlobalBranchAccess = (req: AuthRequest, branchId: string) => {
  const user = req.user;
  if (!user) {
    return false;
  }

  const elevatedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CHAIN_OWNER, ROLES.OPERATIONS_DIRECTOR, ROLES.REGIONAL_MANAGER];
  if (elevatedRoles.some((role) => user.roleNames.includes(role))) {
    return true;
  }

  return user.branchIds.includes(branchId);
};

export const getChains = async (_req: AuthRequest, res: Response) => {
  const chains = await fetchChains();
  return res.json({ success: true, data: { chains } });
};

export const createNewChain = async (req: AuthRequest, res: Response) => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Name and code are required' });
  }

  const chain = await createChain({ name, code, description });
  return res.status(201).json({ success: true, data: { chain } });
};

export const updateExistingChain = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, code, description } = req.body;

  const chain = await updateChain(id, { name, code, description });
  return res.json({ success: true, data: { chain } });
};

export const deleteExistingChain = async (_req: AuthRequest, res: Response) => {
  const { id } = _req.params;
  await deleteChain(id);
  return res.json({ success: true, data: { message: 'Chain deleted' } });
};

export const getBranches = async (req: AuthRequest, res: Response) => {
  const branches = await fetchBranches(req.user?.chainId);
  return res.json({ success: true, data: { branches } });
};

export const createNewBranch = async (req: AuthRequest, res: Response) => {
  const { name, code, region, address, chainId } = req.body;
  const resolvedChainId = chainId ?? req.user?.chainId;

  if (!name || !code || !resolvedChainId) {
    return res.status(400).json({ success: false, message: 'Name, code, and chainId are required' });
  }

  const branch = await createBranch({ name, code, region, address, chainId: resolvedChainId });
  return res.status(201).json({ success: true, data: { branch } });
};

export const updateExistingBranch = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, code, region, address } = req.body;

  const branch = await updateBranch(id, { name, code, region, address });
  return res.json({ success: true, data: { branch } });
};

export const deleteExistingBranch = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteBranch(id);
  return res.json({ success: true, data: { message: 'Branch deleted' } });
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const branchIds = req.user?.branchIds;
  const orders = await fetchOrders(branchIds);
  return res.json({ success: true, data: { orders } });
};

export const createNewOrder = async (req: AuthRequest, res: Response) => {
  const { branchId, customerId, takenById, status, total, items } = req.body;
  if (!branchId || (total == null && (!items || items.length === 0))) {
    return res.status(400).json({ success: false, message: 'Branch ID and either a total or line items are required' });
  }

  if (!hasGlobalBranchAccess(req, branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const order = await createOrder({ branchId, customerId, takenById, status, total, items });
  return res.status(201).json({ success: true, data: { order } });
};

export const getMenuItems = async (req: AuthRequest, res: Response) => {
  const menuItems = await fetchMenuItems(req.user?.chainId);
  return res.json({ success: true, data: { menuItems } });
};

export const createNewMenuItem = async (req: AuthRequest, res: Response) => {
  const { name, description, category, price } = req.body;
  const chainId = req.user?.chainId;

  if (!name || price == null || !chainId) {
    return res.status(400).json({ success: false, message: 'Name, price, and chain context are required' });
  }

  const menuItem = await createMenuItem({ chainId, name, description, category, price });
  return res.status(201).json({ success: true, data: { menuItem } });
};

export const updateExistingOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, total } = req.body;

  const existingOrder = await getOrderById(id);
  if (!existingOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!hasGlobalBranchAccess(req, existingOrder.branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const order = await updateOrder(id, { status, total });
  return res.json({ success: true, data: { order } });
};

export const cancelExistingOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existingOrder = await getOrderById(id);
  if (!existingOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!hasGlobalBranchAccess(req, existingOrder.branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const order = await cancelOrder(id);
  return res.json({ success: true, data: { order } });
};

export const getReservations = async (req: AuthRequest, res: Response) => {
  const branchIds = req.user?.branchIds;
  const reservations = await fetchReservations(branchIds);
  return res.json({ success: true, data: { reservations } });
};

export const createNewReservation = async (req: AuthRequest, res: Response) => {
  const { branchId, guestName, partySize, reservationTime, status } = req.body;
  if (!branchId || !guestName || partySize == null || !reservationTime) {
    return res.status(400).json({ success: false, message: 'Branch ID, guest name, party size, and reservation time are required' });
  }

  if (!hasGlobalBranchAccess(req, branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const reservation = await createReservation({
    branchId,
    guestName,
    partySize,
    reservationTime: new Date(reservationTime),
    status,
  });
  return res.status(201).json({ success: true, data: { reservation } });
};

export const updateExistingReservation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { guestName, partySize, reservationTime, status } = req.body;

  const existingReservation = await getReservationById(id);
  if (!existingReservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }

  if (!hasGlobalBranchAccess(req, existingReservation.branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const reservation = await updateReservation(id, {
    guestName,
    partySize,
    reservationTime: reservationTime ? new Date(reservationTime) : undefined,
    status,
  });
  return res.json({ success: true, data: { reservation } });
};

export const cancelExistingReservation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existingReservation = await getReservationById(id);
  if (!existingReservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }

  if (!hasGlobalBranchAccess(req, existingReservation.branchId)) {
    return res.status(403).json({ success: false, message: 'Branch access denied' });
  }

  const reservation = await cancelReservation(id);
  return res.json({ success: true, data: { reservation } });
};

export const getCustomers = async (_req: AuthRequest, res: Response) => {
  const customers = await fetchCustomers();
  return res.json({ success: true, data: { customers } });
};

export const createNewCustomer = async (req: AuthRequest, res: Response) => {
  const { name, email, phone, loyaltyPoints } = req.body;
  const chainId = req.user?.chainId;
  if (!name || !email || !chainId) {
    return res.status(400).json({ success: false, message: 'Name, email, and chain context are required' });
  }

  const customer = await createCustomer({ chainId, name, email, phone, loyaltyPoints });
  return res.status(201).json({ success: true, data: { customer } });
};

export const updateExistingCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, loyaltyPoints } = req.body;

  const customer = await updateCustomer(id, { name, email, phone, loyaltyPoints });
  return res.json({ success: true, data: { customer } });
};

export const deleteExistingCustomer = async (_req: AuthRequest, res: Response) => {
  const { id } = _req.params;
  await deleteCustomer(id);
  return res.json({ success: true, data: { message: 'Customer deleted' } });
};

export const getPayrollRecordsController = async (_req: AuthRequest, res: Response) => {
  const payrollRecords = await fetchPayrollRecords();
  return res.json({ success: true, data: { payrollRecords } });
};

export const processPayrollController = async (req: AuthRequest, res: Response) => {
  const { userId, amount, periodStart, periodEnd } = req.body;
  if (!userId || amount == null || !periodStart || !periodEnd) {
    return res.status(400).json({ success: false, message: 'User ID, amount, periodStart, and periodEnd are required' });
  }

  const payrollRecord = await processPayroll({
    userId,
    amount,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
  });
  return res.status(201).json({ success: true, data: { payrollRecord } });
};

export const getMarketingCampaignsController = async (req: AuthRequest, res: Response) => {
  const campaigns = await fetchMarketingCampaigns(req.user?.chainId);
  return res.json({ success: true, data: { campaigns } });
};

export const createMarketingCampaignController = async (req: AuthRequest, res: Response) => {
  const { title, channel, budget, active } = req.body;
  const chainId = req.user?.chainId;

  if (!title || !channel || budget == null || !chainId) {
    return res.status(400).json({ success: false, message: 'Title, channel, budget, and chain context are required' });
  }

  const campaign = await createMarketingCampaign({ chainId, title, channel, budget, active });
  return res.status(201).json({ success: true, data: { campaign } });
};

export const updateMarketingCampaignController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, channel, budget, active } = req.body;

  const campaign = await updateMarketingCampaign(id, { title, channel, budget, active });
  return res.json({ success: true, data: { campaign } });
};

export const deleteMarketingCampaignController = async (_req: AuthRequest, res: Response) => {
  const { id } = _req.params;
  await deleteMarketingCampaign(id);
  return res.json({ success: true, data: { message: 'Campaign deleted' } });
};

export const getSettingsController = async (req: AuthRequest, res: Response) => {
  const settings = await fetchSettings(req.user?.chainId);
  return res.json({ success: true, data: { settings } });
};

export const updateSettingController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { value, enabled } = req.body;

  const setting = await updateSetting(id, { value, enabled });
  return res.json({ success: true, data: { setting } });
};
