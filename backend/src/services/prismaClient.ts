import pkg from '@prisma/client';

const { PrismaClient } = (pkg as any) || {};
const prisma = new (PrismaClient as any)();
export default prisma;
