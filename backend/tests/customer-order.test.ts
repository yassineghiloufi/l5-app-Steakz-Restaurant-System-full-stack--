import request from 'supertest';
import app from '../src/app';
import { seedRolesAndPermissions } from '../src/services/rbac.service';
import { ensureDefaultRoleUsers, ensureSampleBusinessData } from '../src/services/user.service';
import prisma from '../src/services/prismaClient';

jest.setTimeout(30000);

describe('Public Customer Order APIs', () => {
  let branchId: string;
  let menuItemId: string;
  const testEmail = `test.customer.${Date.now()}@example.com`;

  beforeAll(async () => {
    // Seed system data
    await seedRolesAndPermissions();
    await ensureDefaultRoleUsers();
    await ensureSampleBusinessData();

    // Fetch seeded branch and menu item to use in tests
    const branch = await prisma.branch.findFirst({ where: { code: 'DEFAULT_BRANCH' } });
    const menuItem = await prisma.menuItem.findFirst();

    if (!branch || !menuItem) {
      throw new Error('Database seeding failed: branch or menu item missing');
    }

    branchId = branch.id;
    menuItemId = menuItem.id;
  });

  afterAll(async () => {
    // Clean up created customer and orders
    const testCustomer = await prisma.customer.findUnique({ where: { email: testEmail } });
    if (testCustomer) {
      await prisma.orderItem.deleteMany({
        where: { order: { customerId: testCustomer.id } },
      });
      await prisma.order.deleteMany({
        where: { customerId: testCustomer.id },
      });
      await prisma.customer.delete({
        where: { id: testCustomer.id },
      });
    }
  });

  it('should fetch public branches list', async () => {
    const response = await request(app).get('/api/customer/branches');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.branches)).toBe(true);
    expect(response.body.data.branches.length).toBeGreaterThan(0);
  });

  it('should fetch public menu catalog', async () => {
    const response = await request(app).get('/api/customer/menu');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.menuItems)).toBe(true);
    expect(response.body.data.menuItems.length).toBeGreaterThan(0);
  });

  it('should query customer profile by email (non-existent initially)', async () => {
    const response = await request(app).get(`/api/customer/profile/${testEmail}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer).toBeNull();
  });

  it('should place an order publicly and create/return customer with loyalty points', async () => {
    const orderPayload = {
      name: 'Jane Test Customer',
      email: testEmail,
      phone: '555-999-8888',
      branchId,
      items: [
        { menuItemId, quantity: 2 },
      ],
    };

    const response = await request(app)
      .post('/api/customer/orders')
      .send(orderPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.order).toBeDefined();
    expect(response.body.data.order.branchId).toBe(branchId);
    expect(response.body.data.order.status).toBe('PENDING');
    expect(response.body.data.customer).toBeDefined();
    expect(response.body.data.customer.email).toBe(testEmail);
    expect(response.body.data.customer.loyaltyPoints).toBeGreaterThan(0); // loyalty points awarded
  });

  it('should query customer profile by email (existing after order)', async () => {
    const response = await request(app).get(`/api/customer/profile/${testEmail}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer).toBeDefined();
    expect(response.body.data.customer.email).toBe(testEmail);
    expect(response.body.data.customer.loyaltyPoints).toBeGreaterThan(0);
  });
});
