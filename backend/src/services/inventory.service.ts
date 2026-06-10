import prisma from './prismaClient';

export const fetchInventory = async () => {
  return prisma.inventory.findMany({ orderBy: { updatedAt: 'desc' } });
};

export const addInventoryItem = async ({
  itemName,
  quantity,
  supplier,
  minimumStock,
}: {
  itemName: string;
  quantity: number;
  supplier: string;
  minimumStock: number;
}) => {
  return prisma.inventory.create({
    data: { itemName, quantity, supplier, minimumStock },
  });
};

export const updateInventoryItem = async (id: string, data: Partial<{ itemName: string; quantity: number; supplier: string; minimumStock: number }>) => {
  try {
    return prisma.inventory.update({ where: { id }, data });
  } catch {
    return null;
  }
};

export const deleteInventoryItem = async (id: string) => {
  await prisma.inventory.delete({ where: { id } });
};
