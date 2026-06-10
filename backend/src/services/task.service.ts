import prisma from './prismaClient';

export const fetchTasks = async (assignedTo?: string) => {
  const where = assignedTo ? { assignedToId: assignedTo } : undefined;
  return prisma.task.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
};

export const assignTaskRecord = async ({ title, description, assignedTo }: { title: string; description: string; assignedTo: string }) => {
  return prisma.task.create({
    data: {
      title,
      description,
      assignedToId: assignedTo,
    },
    include: { assignedTo: true },
  });
};

export const updateTaskRecord = async (
  id: string,
  data: Partial<{ title: string; description: string; status: string; assignedTo: string }>
) => {
  try {
    return prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as any,
        assignedToId: data.assignedTo,
      },
      include: { assignedTo: true },
    });
  } catch {
    return null;
  }
};
