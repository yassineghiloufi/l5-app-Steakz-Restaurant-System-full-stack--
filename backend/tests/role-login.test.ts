import request from 'supertest';
import app from '../src/app';
import { seedRolesAndPermissions } from '../src/services/rbac.service';
import { ensureDefaultRoleUsers } from '../src/services/user.service';

jest.setTimeout(30000);

describe('Role-based login tests', () => {
  beforeAll(async () => {
    await seedRolesAndPermissions();
    await ensureDefaultRoleUsers();
  });

  const roleAccounts = [
    { role: 'SUPER_ADMIN', email: 'superadmin@steakz.local', password: 'SuperAdmin@123' },
    { role: 'ADMIN', email: 'admin@steakz.local', password: 'Admin@123' },
    { role: 'CHAIN_OWNER', email: 'owner@steakz.local', password: 'Owner@123' },
    { role: 'OPERATIONS_DIRECTOR', email: 'operations.director@steakz.local', password: 'Operations@123' },
    { role: 'REGIONAL_MANAGER', email: 'regional.manager@steakz.local', password: 'Regional@123' },
    { role: 'BRANCH_MANAGER', email: 'branch.manager@steakz.local', password: 'Branch@123' },
    { role: 'KITCHEN_MANAGER', email: 'kitchen.manager@steakz.local', password: 'Kitchen@123' },
    { role: 'INVENTORY_MANAGER', email: 'inventory.manager@steakz.local', password: 'Inventory@123' },
    { role: 'FINANCE_MANAGER', email: 'finance.manager@steakz.local', password: 'Finance@123' },
    { role: 'HR_MANAGER', email: 'hr.manager@steakz.local', password: 'HR@123' },
    { role: 'MARKETING_MANAGER', email: 'marketing.manager@steakz.local', password: 'Marketing@123' },
    { role: 'SUPERVISOR', email: 'supervisor@steakz.local', password: 'Supervisor@123' },
    { role: 'CASHIER', email: 'cashier@steakz.local', password: 'Cashier@123' },
    { role: 'WAITER', email: 'waiter@steakz.local', password: 'Waiter@123' },
    { role: 'CHEF', email: 'chef@steakz.local', password: 'Chef@123' },
    { role: 'KITCHEN_STAFF', email: 'kitchen.staff@steakz.local', password: 'KitchenStaff@123' },
    { role: 'RECEPTIONIST', email: 'receptionist@steakz.local', password: 'Receptionist@123' },
    { role: 'DELIVERY_DRIVER', email: 'driver@steakz.local', password: 'Driver@123' },
    { role: 'ACCOUNTANT', email: 'accountant@steakz.local', password: 'Accountant@123' },
    { role: 'CUSTOMER_SUPPORT', email: 'support@steakz.local', password: 'Support@123' },
  ];

  roleAccounts.forEach((account) => {
    it(`should log in successfully as ${account.role}`, async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: account.email, password: account.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.primaryRole).toBe(account.role);
    });
  });
});
