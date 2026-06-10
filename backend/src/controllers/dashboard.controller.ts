import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { getAllUsers } from '../services/user.service';
import { fetchInventory } from '../services/inventory.service';
import { fetchSales, fetchDailyRevenue, fetchWeeklyRevenue } from '../services/sales.service';
import { fetchTasks } from '../services/task.service';
import { ROLES } from '../constants/roles';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const role = req.user?.primaryRole;
  if (!role) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const data: Record<string, unknown> = {};

  const highLevelRoles: string[] = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.CHAIN_OWNER,
    ROLES.OPERATIONS_DIRECTOR,
    ROLES.REGIONAL_MANAGER,
  ];

  if (highLevelRoles.includes(role)) {
    data.users = await getAllUsers();
    data.inventory = await fetchInventory();
    data.sales = await fetchSales();
    data.dailyRevenue = await fetchDailyRevenue();
    data.weeklyRevenue = await fetchWeeklyRevenue();
    data.tasks = await fetchTasks();
  }

  const branchLeadershipRoles: string[] = [
    ROLES.BRANCH_MANAGER,
    ROLES.OPERATIONS_DIRECTOR,
    ROLES.REGIONAL_MANAGER,
  ];

  if (branchLeadershipRoles.includes(role)) {
    data.inventory = await fetchInventory();
    data.sales = await fetchSales();
    data.dailyRevenue = await fetchDailyRevenue();
    data.weeklyRevenue = await fetchWeeklyRevenue();
    data.tasks = await fetchTasks();
  }

  const frontlineRoles: string[] = [
    ROLES.CASHIER,
    ROLES.WAITER,
    ROLES.CHEF,
    ROLES.KITCHEN_STAFF,
    ROLES.RECEPTIONIST,
    ROLES.DELIVERY_DRIVER,
  ];

  if (frontlineRoles.includes(role)) {
    data.tasks = await fetchTasks(req.user?.id);
    data.inventory = await fetchInventory();
  }

  if (role === ROLES.ACCOUNTANT) {
    data.sales = await fetchSales();
    data.dailyRevenue = await fetchDailyRevenue();
    data.weeklyRevenue = await fetchWeeklyRevenue();
  }

  const inventoryRoles: string[] = [ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_MANAGER];
  if (inventoryRoles.includes(role)) {
    data.inventory = await fetchInventory();
  }

  res.json({ success: true, data });
};
