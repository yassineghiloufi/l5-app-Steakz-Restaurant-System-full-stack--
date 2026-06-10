import prisma from './prismaClient';
import { PERMISSIONS } from '../constants/permissions';
import { ROLES } from '../constants/roles';

export type UserContext = {
  id: string;
  email: string;
  primaryRole: string;
  chainId: string;
  branchIds: string[];
  departmentIds: string[];
  permissions: string[];
  roleNames: string[];
};

export const getUserContextById = async (userId: string): Promise<UserContext | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      branches: true,
      departments: true,
    },
  });

  if (!user) {
    return null;
  }

  const roleNames = Array.from(new Set(user.roles.map((userRole: any) => userRole.role.name))) as string[];
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((userRole: any) =>
        userRole.role.permissions.map((rolePermission: any) => rolePermission.permission.name),
      ),
    ),
  ) as string[];

  return {
    id: user.id,
    email: user.email,
    primaryRole: user.primaryRole,
    chainId: user.chainId,
    branchIds: user.branches.map((assignment: any) => assignment.branchId),
    departmentIds: user.departments.map((assignment: any) => assignment.departmentId),
    permissions,
    roleNames,
  };
};

export const userHasAnyRole = (user: UserContext, roles: string[]) => {
  return roles.some((role) => user.roleNames.includes(role));
};

export const userHasPermissions = (user: UserContext, permissions: string[]) => {
  return permissions.every((permission) => user.permissions.includes(permission));
};

export const buildJwtPayload = (user: UserContext) => {
  return {
    id: user.id,
    email: user.email,
    primaryRole: user.primaryRole,
    chainId: user.chainId,
    roleNames: user.roleNames,
    permissions: user.permissions,
    branchIds: user.branchIds,
    departmentIds: user.departmentIds,
  };
};

export const createOrUpdatePermission = async (permissionName: string, description?: string, group?: string) => {
  return prisma.permission.upsert({
    where: { name: permissionName },
    create: { name: permissionName, description, group },
    update: { description, group },
  });
};

export const createOrUpdateRole = async (roleName: string, description?: string, isSystem = false) => {
  return prisma.role.upsert({
    where: { name: roleName },
    create: { name: roleName, description, isSystem },
    update: { description, isSystem },
  });
};

export const assignPermissionsToRole = async (roleName: string, permissionNames: string[]) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error(`Role ${roleName} does not exist`);
  }

  const permissions = await Promise.all(permissionNames.map((name) => createOrUpdatePermission(name)));
  const rolePermissions = permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id }));

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  return prisma.rolePermission.createMany({ data: rolePermissions, skipDuplicates: true });
};

export const assignPermissionsToRoleById = async (roleId: string, permissionNames: string[]) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new Error(`Role ID ${roleId} does not exist`);
  }

  const permissions = await Promise.all(permissionNames.map((name) => createOrUpdatePermission(name)));
  const rolePermissions = permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id }));

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  return prisma.rolePermission.createMany({ data: rolePermissions, skipDuplicates: true });
};

export const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const getAllPermissions = async () => {
  return prisma.permission.findMany({ orderBy: { group: 'asc' } });
};

export const seedRolesAndPermissions = async () => {
  const defaultChain = await prisma.chain.upsert({
    where: { code: 'DEFAULT_CHAIN' },
    create: { name: 'Default Steakz Chain', code: 'DEFAULT_CHAIN', description: 'Primary restaurant chain for Steakz MIS' },
    update: {},
  });

  const defaultBranch = await prisma.branch.upsert({
    where: { code: 'DEFAULT_BRANCH' },
    create: { name: 'Default Steakz Branch', code: 'DEFAULT_BRANCH', chainId: defaultChain.id, region: 'Central', address: 'Headquarters' },
    update: {},
  });

  const permissions = Object.values(PERMISSIONS);
  await Promise.all(permissions.map((name) => createOrUpdatePermission(name)));

  await Promise.all([
    createOrUpdateRole(ROLES.SUPER_ADMIN, 'Platform owner with full access', true),
    createOrUpdateRole(ROLES.ADMIN, 'Legacy system administrator (backwards compatibility)', true),
    createOrUpdateRole(ROLES.CHAIN_OWNER, 'Chain owner with full chain access', true),
    createOrUpdateRole(ROLES.OPERATIONS_DIRECTOR, 'Operations director with operational oversight', true),
    createOrUpdateRole(ROLES.REGIONAL_MANAGER, 'Regional manager with multi-branch visibility', true),
    createOrUpdateRole(ROLES.BRANCH_MANAGER, 'Branch manager with branch-level control', true),
    createOrUpdateRole(ROLES.KITCHEN_MANAGER, 'Manager responsible for kitchen operations', true),
    createOrUpdateRole(ROLES.INVENTORY_MANAGER, 'Inventory manager with stock control', true),
    createOrUpdateRole(ROLES.FINANCE_MANAGER, 'Finance manager with financial access', true),
    createOrUpdateRole(ROLES.HR_MANAGER, 'HR manager with employee administration', true),
    createOrUpdateRole(ROLES.MARKETING_MANAGER, 'Marketing manager with campaign visibility', true),
    createOrUpdateRole(ROLES.SUPERVISOR, 'Supervisor with operations oversight', true),
    createOrUpdateRole(ROLES.CASHIER, 'Cashier with POS access', true),
    createOrUpdateRole(ROLES.WAITER, 'Waiter with order and reservation access', true),
    createOrUpdateRole(ROLES.CHEF, 'Chef with kitchen access', true),
    createOrUpdateRole(ROLES.KITCHEN_STAFF, 'Kitchen staff with production access', true),
    createOrUpdateRole(ROLES.RECEPTIONIST, 'Receptionist with reservation and customer access', true),
    createOrUpdateRole(ROLES.DELIVERY_DRIVER, 'Delivery driver with order delivery access', true),
    createOrUpdateRole(ROLES.ACCOUNTANT, 'Accountant with financial reporting rights', true),
    createOrUpdateRole(ROLES.CUSTOMER_SUPPORT, 'Customer support with customer issue handling', true),
  ]);

  const rolePermissionMapping: Record<string, string[]> = {
    [ROLES.SUPER_ADMIN]: permissions,
    [ROLES.ADMIN]: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN_ROLES,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_CREATE,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.INVENTORY_DELETE,
      PERMISSIONS.INVENTORY_ADJUST_STOCK,
      PERMISSIONS.BRANCHES_VIEW,
      PERMISSIONS.BRANCHES_CREATE,
      PERMISSIONS.BRANCHES_EDIT,
      PERMISSIONS.BRANCHES_DELETE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.FINANCE_MANAGE,
      PERMISSIONS.PAYROLL_VIEW,
      PERMISSIONS.PAYROLL_PROCESS,
      PERMISSIONS.MARKETING_VIEW,
      PERMISSIONS.MARKETING_MANAGE,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.ORDERS_CANCEL,
      PERMISSIONS.ORDERS_REFUND,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.RESERVATIONS_CREATE,
      PERMISSIONS.RESERVATIONS_EDIT,
      PERMISSIONS.RESERVATIONS_CANCEL,
      PERMISSIONS.EMPLOYEES_VIEW,
      PERMISSIONS.EMPLOYEES_EDIT,
    ],
    [ROLES.CHAIN_OWNER]: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN_ROLES,
      PERMISSIONS.BRANCHES_VIEW,
      PERMISSIONS.BRANCHES_CREATE,
      PERMISSIONS.BRANCHES_EDIT,
      PERMISSIONS.BRANCHES_DELETE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.INVENTORY_ADJUST_STOCK,
      PERMISSIONS.EMPLOYEES_VIEW,
      PERMISSIONS.EMPLOYEES_EDIT,
    ],
    [ROLES.OPERATIONS_DIRECTOR]: [
      PERMISSIONS.BRANCHES_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.MARKETING_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
    ],
    [ROLES.REGIONAL_MANAGER]: [
      PERMISSIONS.BRANCHES_VIEW,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ],
    [ROLES.BRANCH_MANAGER]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.RESERVATIONS_CREATE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.EMPLOYEES_VIEW,
      PERMISSIONS.EMPLOYEES_EDIT,
      PERMISSIONS.REPORTS_VIEW,
    ],
    [ROLES.KITCHEN_MANAGER]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_ADJUST_STOCK,
    ],
    [ROLES.INVENTORY_MANAGER]: [
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_CREATE,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.INVENTORY_DELETE,
      PERMISSIONS.INVENTORY_ADJUST_STOCK,
    ],
    [ROLES.FINANCE_MANAGER]: [
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
    [ROLES.HR_MANAGER]: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.PAYROLL_VIEW,
      PERMISSIONS.PAYROLL_PROCESS,
    ],
    [ROLES.MARKETING_MANAGER]: [
      PERMISSIONS.MARKETING_VIEW,
      PERMISSIONS.MARKETING_MANAGE,
      PERMISSIONS.REPORTS_VIEW,
    ],
    [ROLES.SUPERVISOR]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ],
    [ROLES.CASHIER]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_CANCEL,
    ],
    [ROLES.WAITER]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.RESERVATIONS_CREATE,
    ],
    [ROLES.CHEF]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
    ],
    [ROLES.KITCHEN_STAFF]: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
    ],
    [ROLES.RECEPTIONIST]: [
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.RESERVATIONS_CREATE,
      PERMISSIONS.USERS_VIEW,
    ],
    [ROLES.DELIVERY_DRIVER]: [
      PERMISSIONS.ORDERS_VIEW,
    ],
    [ROLES.ACCOUNTANT]: [
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
    [ROLES.CUSTOMER_SUPPORT]: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.RESERVATIONS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ],
  };

  await Promise.all(
    Object.entries(rolePermissionMapping).map(([roleName, permissionNames]) => assignPermissionsToRole(roleName, permissionNames)),
  );

  const defaultOwner = await prisma.user.findUnique({ where: { email: 'owner@steakz.local' } });
  if (!defaultOwner) {
    const ownerRole = await prisma.role.findUnique({ where: { name: ROLES.CHAIN_OWNER } });
    if (!ownerRole) {
      throw new Error('Unable to seed owner user before roles exist');
    }

    const user = await prisma.user.create({
      data: {
        name: 'Chain Owner',
        email: 'owner@steakz.local',
        password: 'Owner@123',
        primaryRole: ROLES.CHAIN_OWNER,
        chainId: defaultChain.id,
        roles: {
          create: [{ roleId: ownerRole.id }],
        },
      },
    });

    await prisma.userBranch.create({ data: { userId: user.id, branchId: defaultBranch.id } });
  }
};

export const getUserByEmailWithRoles = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      branches: true,
      departments: true,
    },
  });
};

export const getRoleByName = async (name: string) => prisma.role.findUnique({ where: { name } });

export const createUserRoleAssignment = async (userId: string, roleId: string, assignedById?: string) => {
  return prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    create: { userId, roleId, assignedById },
    update: { assignedById },
  });
};

export const assignBranches = async (userId: string, branchIds: string[]) => {
  await prisma.userBranch.deleteMany({ where: { userId } });
  return prisma.userBranch.createMany({ data: branchIds.map((branchId) => ({ userId, branchId })), skipDuplicates: true });
};

export const assignDepartments = async (userId: string, departmentIds: string[]) => {
  await prisma.userDepartment.deleteMany({ where: { userId } });
  return prisma.userDepartment.createMany({ data: departmentIds.map((departmentId) => ({ userId, departmentId })), skipDuplicates: true });
};

export const recordLoginHistory = async ({
  email,
  userId,
  success,
  ip,
  userAgent,
}: {
  email: string;
  userId?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
}) => {
  return prisma.loginHistory.create({
    data: {
      email,
      userId,
      success,
      ip,
      userAgent,
    },
  });
};

export const recordAuditLog = async ({
  userId,
  action,
  resource,
  details,
  ip,
  userAgent,
}: {
  userId?: string;
  action: string;
  resource?: string;
  details?: object;
  ip?: string;
  userAgent?: string;
}) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      details,
      ip,
      userAgent,
    },
  });
};
