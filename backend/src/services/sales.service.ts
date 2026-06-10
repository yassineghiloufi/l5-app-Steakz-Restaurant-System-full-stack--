import prisma from './prismaClient';

export const createSaleEntry = async ({ amount, saleDate }: { amount: number; saleDate: Date }) => {
  return prisma.sale.create({ data: { amount, saleDate } });
};

export const fetchSales = async () => {
  return prisma.sale.findMany({ orderBy: { saleDate: 'desc' } });
};

export const fetchDailyRevenue = async () => {
  return prisma.$queryRaw`
    SELECT date_trunc('day', "saleDate") as day, SUM(amount) as revenue
    FROM "Sale"
    GROUP BY day
    ORDER BY day DESC
    LIMIT 7;
  `;
};

export const fetchWeeklyRevenue = async () => {
  return prisma.$queryRaw`
    SELECT date_trunc('week', "saleDate") as week, SUM(amount) as revenue
    FROM "Sale"
    GROUP BY week
    ORDER BY week DESC
    LIMIT 6;
  `;
};
