import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import prisma from './prismaClient';
import {
  buildJwtPayload,
  createUserRoleAssignment,
  getRoleByName,
  getUserByEmailWithRoles,
  getUserContextById,
  seedRolesAndPermissions,
  assignBranches,
  assignDepartments,
  recordLoginHistory,
} from './rbac.service';
import { ROLES } from '../constants/roles';

const createJwt = (payload: { id: string; email: string }) => {
  const secret: Secret = process.env.JWT_SECRET || 'supersecretkey';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      primaryRole: true,
      chainId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      primaryRole: true,
      chainId: true,
      createdAt: true,
      updatedAt: true,
      branches: {
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      departments: {
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      roles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                include: {
                  permission: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUserRecord = async ({
  name,
  email,
  password,
  primaryRole,
  roleName,
  chainId,
  branchIds = [],
  departmentIds = [],
}: {
  name: string;
  email: string;
  password: string;
  primaryRole: string;
  roleName: string;
  chainId: string;
  branchIds?: string[];
  departmentIds?: string[];
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = await getRoleByName(roleName);
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      primaryRole,
      chainId,
      roles: {
        create: [{ roleId: role.id }],
      },
      branches: {
        create: branchIds.map((branchId) => ({ branchId })),
      },
      departments: {
        create: departmentIds.map((departmentId) => ({ departmentId })),
      },
    },
  });

  return getUserById(user.id);
};

export const updateUserRecord = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    primaryRole?: string;
    roleName?: string;
    branchIds?: string[];
    departmentIds?: string[];
    assignedById?: string;
  },
) => {
  const updateData: any = {
    name: data.name,
    email: data.email,
    primaryRole: data.primaryRole,
  };

  if (data.roleName) {
    const role = await getRoleByName(data.roleName);
    if (!role) {
      throw new Error(`Role ${data.roleName} not found`);
    }
    await createUserRoleAssignment(id, role.id, data.assignedById);
    updateData.primaryRole = data.roleName;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  if (data.branchIds) {
    await assignBranches(id, data.branchIds);
  }

  if (data.departmentIds) {
    await assignDepartments(id, data.departmentIds);
  }

  return getUserById(user.id);
};

export const deleteUserRecord = async (id: string) => {
  await prisma.user.delete({ where: { id } });
};

export const loginUser = async (
  email: string,
  password: string,
  meta: { ip?: string; userAgent?: string } = {},
) => {
  const user = await getUserByEmailWithRoles(email);
  if (!user) {
    await recordLoginHistory({ email, success: false, ip: meta.ip, userAgent: meta.userAgent });
    return { success: false, message: 'Invalid credentials' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await recordLoginHistory({ email, userId: user.id, success: false, ip: meta.ip, userAgent: meta.userAgent });
    return { success: false, message: 'Invalid credentials' };
  }

  const userContext = await getUserContextById(user.id);
  if (!userContext) {
    await recordLoginHistory({ email, userId: user.id, success: false, ip: meta.ip, userAgent: meta.userAgent });
    return { success: false, message: 'Invalid user context' };
  }

  const token = createJwt(buildJwtPayload(userContext));
  await recordLoginHistory({ email, userId: user.id, success: true, ip: meta.ip, userAgent: meta.userAgent });
  return {
    success: true,
    data: {
      token,
      user: userContext,
    },
  };
};

export const ensureOwnerUser = async () => {
  // Roles and permissions seeded at startup once to avoid concurrent upsert races

  const ownerEmail = process.env.OWNER_EMAIL || 'owner@steakz.local';
  const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@123';
  const ownerName = process.env.OWNER_NAME || 'Owner';

  const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
  if (!defaultChain) {
    throw new Error('Default chain must be seeded before owner creation');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingUser) {
    if (existingUser.primaryRole !== ROLES.CHAIN_OWNER) {
      await updateUserRecord(existingUser.id, { primaryRole: ROLES.CHAIN_OWNER, roleName: ROLES.CHAIN_OWNER });
    }

    const passwordMatches = await bcrypt.compare(ownerPassword, existingUser.password);
    if (!passwordMatches || existingUser.name !== ownerName || existingUser.chainId !== defaultChain.id) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: ownerName,
          password: await bcrypt.hash(ownerPassword, 10),
          chainId: defaultChain.id,
        },
      });
    }

    return getUserContextById(existingUser.id);
  }

  return createUserRecord({
    name: ownerName,
    email: ownerEmail,
    password: ownerPassword,
    primaryRole: ROLES.CHAIN_OWNER,
    roleName: ROLES.CHAIN_OWNER,
    chainId: defaultChain.id,
  });
};

export const ensureDefaultRoleUsers = async () => {
  const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
  const defaultBranch = await prisma.branch.findUnique({ where: { code: 'DEFAULT_BRANCH' } });

  if (!defaultChain) {
    throw new Error('Default chain must be seeded before user creation');
  }

  if (!defaultBranch) {
    throw new Error('Default branch must be seeded before user creation');
  }

  const ownerEmail = process.env.OWNER_EMAIL || 'owner@steakz.local';
  const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@123';
  const ownerName = process.env.OWNER_NAME || 'Chain Owner';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@steakz.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  const roleAccounts = [
    { roleName: ROLES.SUPER_ADMIN, email: 'superadmin@steakz.local', password: 'SuperAdmin@123', name: 'Super Admin' },
    { roleName: ROLES.ADMIN, email: adminEmail, password: adminPassword, name: adminName },
    { roleName: ROLES.CHAIN_OWNER, email: ownerEmail, password: ownerPassword, name: ownerName },
    { roleName: ROLES.OPERATIONS_DIRECTOR, email: 'operations.director@steakz.local', password: 'Operations@123', name: 'Operations Director' },
    { roleName: ROLES.REGIONAL_MANAGER, email: 'regional.manager@steakz.local', password: 'Regional@123', name: 'Regional Manager' },
    { roleName: ROLES.BRANCH_MANAGER, email: 'branch.manager@steakz.local', password: 'Branch@123', name: 'Branch Manager' },
    { roleName: ROLES.KITCHEN_MANAGER, email: 'kitchen.manager@steakz.local', password: 'Kitchen@123', name: 'Kitchen Manager' },
    { roleName: ROLES.INVENTORY_MANAGER, email: 'inventory.manager@steakz.local', password: 'Inventory@123', name: 'Inventory Manager' },
    { roleName: ROLES.FINANCE_MANAGER, email: 'finance.manager@steakz.local', password: 'Finance@123', name: 'Finance Manager' },
    { roleName: ROLES.HR_MANAGER, email: 'hr.manager@steakz.local', password: 'HR@123', name: 'HR Manager' },
    { roleName: ROLES.MARKETING_MANAGER, email: 'marketing.manager@steakz.local', password: 'Marketing@123', name: 'Marketing Manager' },
    { roleName: ROLES.SUPERVISOR, email: 'supervisor@steakz.local', password: 'Supervisor@123', name: 'Supervisor' },
    { roleName: ROLES.CASHIER, email: 'cashier@steakz.local', password: 'Cashier@123', name: 'Cashier' },
    { roleName: ROLES.WAITER, email: 'waiter@steakz.local', password: 'Waiter@123', name: 'Waiter' },
    { roleName: ROLES.CHEF, email: 'chef@steakz.local', password: 'Chef@123', name: 'Chef' },
    { roleName: ROLES.KITCHEN_STAFF, email: 'kitchen.staff@steakz.local', password: 'KitchenStaff@123', name: 'Kitchen Staff' },
    { roleName: ROLES.RECEPTIONIST, email: 'receptionist@steakz.local', password: 'Receptionist@123', name: 'Receptionist' },
    { roleName: ROLES.DELIVERY_DRIVER, email: 'driver@steakz.local', password: 'Driver@123', name: 'Delivery Driver' },
    { roleName: ROLES.ACCOUNTANT, email: 'accountant@steakz.local', password: 'Accountant@123', name: 'Accountant' },
    { roleName: ROLES.CUSTOMER_SUPPORT, email: 'support@steakz.local', password: 'Support@123', name: 'Customer Support' },
  ];

  for (const account of roleAccounts) {
    const existingUser = await prisma.user.findUnique({ where: { email: account.email } });
    if (existingUser) {
      if (existingUser.primaryRole !== account.roleName) {
        await updateUserRecord(existingUser.id, { primaryRole: account.roleName, roleName: account.roleName });
      }

      const passwordMatches = await bcrypt.compare(account.password, existingUser.password);
      if (!passwordMatches || existingUser.name !== account.name || existingUser.chainId !== defaultChain.id) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: account.name,
            password: await bcrypt.hash(account.password, 10),
            chainId: defaultChain.id,
          },
        });
      }

      await assignBranches(existingUser.id, [defaultBranch.id]);
      continue;
    }

    await createUserRecord({
      name: account.name,
      email: account.email,
      password: account.password,
      primaryRole: account.roleName,
      roleName: account.roleName,
      chainId: defaultChain.id,
      branchIds: [defaultBranch.id],
    });
  }
};

export const ensureSampleBusinessData = async () => {
  const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
  const defaultBranch = await prisma.branch.findUnique({ where: { code: 'DEFAULT_BRANCH' } });

  if (!defaultChain || !defaultBranch) {
    throw new Error('Default chain and branch must exist before seeding sample business data');
  }

  const sampleEmployees = [
    { name: 'Maria Lopez', email: 'maria.lopez@steakz.local', password: 'Employee@123', primaryRole: ROLES.WAITER, roleName: ROLES.WAITER },
    { name: 'Jamal Carter', email: 'jamal.carter@steakz.local', password: 'Employee@123', primaryRole: ROLES.CHEF, roleName: ROLES.CHEF },
    { name: 'Nina Patel', email: 'nina.patel@steakz.local', password: 'Employee@123', primaryRole: ROLES.RECEPTIONIST, roleName: ROLES.RECEPTIONIST },
  ];

  const createdEmployees = [] as Array<{
    id: string;
    name: string;
    email: string;
    primaryRole: string;
    chainId: string;
  }>;

  for (const employee of sampleEmployees) {
    const existingUser = await prisma.user.findUnique({ where: { email: employee.email } });
    if (existingUser) {
      if (existingUser.primaryRole !== employee.primaryRole) {
        await updateUserRecord(existingUser.id, { primaryRole: employee.primaryRole, roleName: employee.roleName });
      }
      await assignBranches(existingUser.id, [defaultBranch.id]);
      const existingRecord = await getUserById(existingUser.id);
      if (existingRecord) {
        createdEmployees.push(existingRecord);
      }
      continue;
    }

    const user = await createUserRecord({
      name: employee.name,
      email: employee.email,
      password: employee.password,
      primaryRole: employee.primaryRole,
      roleName: employee.roleName,
      chainId: defaultChain.id,
      branchIds: [defaultBranch.id],
    });

    if (user) {
      createdEmployees.push(user);
    }
  }

  const inventoryExamples = [
    { itemName: 'Premium Ribeye Steak', quantity: 120, supplier: 'Steakz Meats Co.', minimumStock: 30 },
    { itemName: 'Chicken Breasts', quantity: 220, supplier: 'FreshFarm Poultry', minimumStock: 40 },
    { itemName: 'Tomato Sauce', quantity: 85, supplier: 'Italian Pantry Ltd.', minimumStock: 20 },
    { itemName: 'Olive Oil', quantity: 60, supplier: 'Mediterranean Imports', minimumStock: 15 },
    { itemName: 'Fresh Lettuce', quantity: 45, supplier: 'Greens & Herbs Co.', minimumStock: 20 },
  ];

  for (const item of inventoryExamples) {
    const existingItem = await prisma.inventory.findFirst({ where: { itemName: item.itemName } });
    if (existingItem) {
      await prisma.inventory.update({
        where: { id: existingItem.id },
        data: {
          quantity: item.quantity,
          supplier: item.supplier,
          minimumStock: item.minimumStock,
        },
      });
      continue;
    }

    await prisma.inventory.create({ data: item });
  }

  const menuExamples = [
    { name: 'Steakz Signature Ribeye', description: '12 oz prime ribeye served with garlic butter', category: 'Steaks', price: 29.95 },
    { name: 'Classic Caesar Salad', description: 'Crisp romaine, parmesan, and house-made Caesar dressing', category: 'Salads', price: 10.5 },
    { name: 'Grilled Salmon Fillet', description: 'Herb-marinated salmon with roasted vegetables', category: 'Seafood', price: 24.75 },
    { name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil and parmesan', category: 'Sides', price: 8.5 },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', category: 'Desserts', price: 9.95 },
  ];

  for (const menuItem of menuExamples) {
    const existingMenuItem = await prisma.menuItem.findFirst({ where: { name: menuItem.name, chainId: defaultChain.id } });
    if (existingMenuItem) {
      await prisma.menuItem.update({
        where: { id: existingMenuItem.id },
        data: {
          description: menuItem.description,
          category: menuItem.category,
          price: menuItem.price,
          chainId: defaultChain.id,
        },
      });
      continue;
    }

    await prisma.menuItem.create({
      data: {
        ...menuItem,
        chainId: defaultChain.id,
      },
    });
  }

  const customerExamples = [
    { name: 'Diana Rivera', email: 'diana.rivera@gmail.com', phone: '555-0190', loyaltyPoints: 120 },
    { name: 'Jason Kim', email: 'jason.kim@gmail.com', phone: '555-0234', loyaltyPoints: 85 },
  ];

  const customerRecords = [] as Array<{ id: string; email: string }>;
  for (const customer of customerExamples) {
    const existingCustomer = await prisma.customer.findUnique({ where: { email: customer.email } });
    if (existingCustomer) {
      const updatedCustomer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: customer.name,
          phone: customer.phone,
          loyaltyPoints: customer.loyaltyPoints,
          chainId: defaultChain.id,
        },
      });
      customerRecords.push({ id: updatedCustomer.id, email: updatedCustomer.email });
      continue;
    }

    const createdCustomer = await prisma.customer.create({
      data: {
        ...customer,
        chainId: defaultChain.id,
      },
    });
    customerRecords.push({ id: createdCustomer.id, email: createdCustomer.email });
  }

  const waiter = await prisma.user.findUnique({ where: { email: 'waiter@steakz.local' } });
  const chef = await prisma.user.findUnique({ where: { email: 'chef@steakz.local' } });
  const accountant = await prisma.user.findUnique({ where: { email: 'accountant@steakz.local' } });

  const orderExamples = [
    {
      customerEmail: 'diana.rivera@gmail.com',
      status: 'COMPLETED',
      takenByEmail: 'waiter@steakz.local',
      items: [
        { name: 'Steakz Signature Ribeye', quantity: 1 },
        { name: 'Truffle Fries', quantity: 1 },
      ],
    },
    {
      customerEmail: 'jason.kim@gmail.com',
      status: 'COMPLETED',
      takenByEmail: 'waiter@steakz.local',
      items: [
        { name: 'Grilled Salmon Fillet', quantity: 1 },
        { name: 'Classic Caesar Salad', quantity: 1 },
      ],
    },
  ];

  for (const example of orderExamples) {
    const customer = await prisma.customer.findUnique({ where: { email: example.customerEmail } });
    const takenBy = await prisma.user.findUnique({ where: { email: example.takenByEmail } });
    if (!customer || !takenBy) {
      continue;
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        name: { in: example.items.map((item) => item.name) },
        chainId: defaultChain.id,
      },
    });

    const existingOrder = await prisma.order.findFirst({
      where: {
        branchId: defaultBranch.id,
        customerId: customer.id,
        takenById: takenBy.id,
        status: example.status,
      },
      include: { items: true },
    });

    if (!existingOrder) {
      const orderItems = example.items.map((item: any) => {
        const menuItem: any = menuItems.find((menu: any) => menu.name === item.name);
        return {
          menuItemId: menuItem?.id ?? '',
          quantity: item.quantity,
          unitPrice: menuItem?.price ?? 0,
          total: (menuItem?.price ?? 0) * item.quantity,
        };
      }).filter((item) => item.menuItemId !== '');

      await prisma.order.create({
        data: {
          branchId: defaultBranch.id,
          customerId: customer.id,
          takenById: takenBy.id,
          status: example.status,
          total: orderItems.reduce((sum, item) => sum + item.total, 0),
          items: {
            create: orderItems,
          },
        },
      });
    }
  }

  const payrollExamples = [
    { employeeEmail: 'chef@steakz.local', amount: 2345.0, periodStart: new Date('2026-05-01'), periodEnd: new Date('2026-05-15') },
    { employeeEmail: 'waiter@steakz.local', amount: 1520.0, periodStart: new Date('2026-05-01'), periodEnd: new Date('2026-05-15') },
    { employeeEmail: 'accountant@steakz.local', amount: 2760.0, periodStart: new Date('2026-05-01'), periodEnd: new Date('2026-05-15') },
  ];

  for (const payroll of payrollExamples) {
    const employee = await prisma.user.findUnique({ where: { email: payroll.employeeEmail } });
    if (!employee) {
      continue;
    }

    const existingPayroll = await prisma.payrollRecord.findFirst({
      where: {
        userId: employee.id,
        periodStart: payroll.periodStart,
        periodEnd: payroll.periodEnd,
      },
    });

    if (!existingPayroll) {
      await prisma.payrollRecord.create({
        data: {
          userId: employee.id,
          amount: payroll.amount,
          periodStart: payroll.periodStart,
          periodEnd: payroll.periodEnd,
          processed: true,
        },
      });
    }
  }
};

export const ensureAdminUser = async () => {
  // Roles and permissions seeded at startup once to avoid concurrent upsert races

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@steakz.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
  if (!defaultChain) {
    throw new Error('Default chain must be seeded before admin creation');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) {
    if (existingUser.primaryRole !== ROLES.ADMIN) {
      await updateUserRecord(existingUser.id, { primaryRole: ROLES.ADMIN, roleName: ROLES.ADMIN });
    }
    return getUserContextById(existingUser.id);
  }

  return createUserRecord({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    primaryRole: ROLES.ADMIN,
    roleName: ROLES.ADMIN,
    chainId: defaultChain.id,
  });
};
