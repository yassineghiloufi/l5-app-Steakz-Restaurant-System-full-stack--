import prisma from './prismaClient';

export const fetchChains = async () => {
  return prisma.chain.findMany({
    include: {
      branches: true,
      departments: true,
    },
  });
};

export const createChain = async (data: { name: string; code: string; description?: string }) => {
  return prisma.chain.create({ data });
};

export const updateChain = async (id: string, data: { name?: string; code?: string; description?: string }) => {
  return prisma.chain.update({ where: { id }, data });
};

export const deleteChain = async (id: string) => {
  return prisma.chain.delete({ where: { id } });
};

export const fetchBranches = async (chainId?: string) => {
  const where = chainId ? { chainId } : undefined;
  return prisma.branch.findMany({ where, include: { chain: true, departments: true } });
};

export const createBranch = async (data: { name: string; code: string; region?: string; address?: string; chainId: string }) => {
  return prisma.branch.create({ data });
};

export const updateBranch = async (id: string, data: { name?: string; code?: string; region?: string; address?: string }) => {
  return prisma.branch.update({ where: { id }, data });
};

export const deleteBranch = async (id: string) => {
  return prisma.branch.delete({ where: { id } });
};

export const fetchOrders = async (branchIds?: string[]) => {
  const where = branchIds && branchIds.length > 0 ? { branchId: { in: branchIds } } : undefined;
  return prisma.order.findMany({
    where,
    include: {
      branch: true,
      customer: true,
      takenBy: true,
      items: { include: { menuItem: true } },
    },
  });
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      branch: true,
      customer: true,
      takenBy: true,
      items: { include: { menuItem: true } },
    },
  });
};

type OrderItemInput = {
  menuItemId: string;
  quantity: number;
};

export const createOrder = async (data: {
  branchId: string;
  customerId?: string;
  takenById?: string;
  status?: string;
  total?: number;
  items?: OrderItemInput[];
}) => {
  const itemData = data.items?.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    unitPrice: 0,
    total: 0,
  })) ?? [];

  let computedTotal = data.total ?? 0;
  if (itemData.length > 0) {
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemData.map((item) => item.menuItemId) } },
    });

    const menuItemMap = new Map(menuItems.map((menuItem: any) => [menuItem.id, menuItem]));
    const orderItems = itemData.map((item) => {
      const menuItem: any = menuItemMap.get(item.menuItemId);
      const unitPrice = menuItem?.price ?? 0;
      const total = unitPrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    computedTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    return prisma.order.create({
      data: {
        branchId: data.branchId,
        customerId: data.customerId,
        takenById: data.takenById,
        status: data.status,
        total: computedTotal,
        items: {
          create: orderItems,
        },
      },
      include: {
        branch: true,
        customer: true,
        takenBy: true,
        items: { include: { menuItem: true } },
      },
    });
  }

  return prisma.order.create({
    data: {
      branchId: data.branchId,
      customerId: data.customerId,
      takenById: data.takenById,
      status: data.status,
      total: computedTotal,
    },
    include: {
      branch: true,
      customer: true,
      takenBy: true,
      items: { include: { menuItem: true } },
    },
  });
};

export const updateOrder = async (id: string, data: { status?: string; total?: number }) => {
  return prisma.order.update({ where: { id }, data });
};

export const cancelOrder = async (id: string) => {
  return prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
};

export const fetchMenuItems = async (chainId?: string) => {
  const where = chainId ? { chainId } : undefined;
  return prisma.menuItem.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
};

export const createMenuItem = async (data: { chainId: string; name: string; description?: string; category?: string; price: number }) => {
  return prisma.menuItem.create({ data });
};

export const fetchReservations = async (branchIds?: string[]) => {
  const where = branchIds && branchIds.length > 0 ? { branchId: { in: branchIds } } : undefined;
  return prisma.reservation.findMany({ where, include: { branch: true } });
};

export const getReservationById = async (id: string) => {
  return prisma.reservation.findUnique({ where: { id }, include: { branch: true } });
};

export const createReservation = async (data: {
  branchId: string;
  guestName: string;
  partySize: number;
  reservationTime: Date;
  status?: string;
}) => {
  return prisma.reservation.create({ data });
};

export const updateReservation = async (id: string, data: { guestName?: string; partySize?: number; reservationTime?: Date; status?: string }) => {
  return prisma.reservation.update({ where: { id }, data });
};

export const cancelReservation = async (id: string) => {
  return prisma.reservation.update({ where: { id }, data: { status: 'CANCELLED' } });
};

export const fetchCustomers = async () => {
  return prisma.customer.findMany();
};

export const createCustomer = async (data: { chainId: string; name: string; email: string; phone?: string; loyaltyPoints?: number }) => {
  return prisma.customer.create({ data });
};

export const updateCustomer = async (id: string, data: { name?: string; email?: string; phone?: string; loyaltyPoints?: number }) => {
  return prisma.customer.update({ where: { id }, data });
};

export const deleteCustomer = async (id: string) => {
  return prisma.customer.delete({ where: { id } });
};

export const fetchPayrollRecords = async () => {
  return prisma.payrollRecord.findMany({ include: { user: true } });
};

export const processPayroll = async (data: { userId: string; amount: number; periodStart: Date; periodEnd: Date }) => {
  return prisma.payrollRecord.create({ data: { ...data, processed: true } });
};

export const fetchMarketingCampaigns = async (chainId?: string) => {
  const where = chainId ? { chainId } : undefined;
  return prisma.marketingCampaign.findMany({ where });
};

export const createMarketingCampaign = async (data: { chainId: string; title: string; channel: string; budget: number; active?: boolean }) => {
  return prisma.marketingCampaign.create({ data });
};

export const updateMarketingCampaign = async (id: string, data: { title?: string; channel?: string; budget?: number; active?: boolean }) => {
  return prisma.marketingCampaign.update({ where: { id }, data });
};

export const deleteMarketingCampaign = async (id: string) => {
  return prisma.marketingCampaign.delete({ where: { id } });
};

export const fetchSettings = async (chainId?: string) => {
  const where = chainId ? { chainId } : undefined;
  return prisma.setting.findMany({ where });
};

export const updateSetting = async (id: string, data: { value?: string; enabled?: boolean }) => {
  return prisma.setting.update({ where: { id }, data });
};
