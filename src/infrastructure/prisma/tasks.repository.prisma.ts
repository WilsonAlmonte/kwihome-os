import { prisma } from "@repo/db";
import { TasksRepository } from "@repo/features/tasks/tasks.port";

export const prismaTasksRepository: TasksRepository = {
  findAll: async function () {
    const result = await prisma.task.findMany({
      orderBy: { createdAt: "asc" },
      include: { area: true },
    });

    return result.map((task) => ({
      ...task,
      description: task.description ?? undefined,
      homeArea: task.area ?? undefined,
      completedAt: task.completedAt ?? undefined,
    }));
  },
  create: async function (title, description, homeArea) {
    const result = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        areaId: homeArea ? homeArea.id : null,
        completedAt: null,
      },
      include: { area: true },
    });

    return {
      ...result,
      description: result.description ?? undefined,
      homeArea: result.area ?? undefined,
      completedAt: result.completedAt ?? undefined,
    };
  },
  delete: async function (id) {
    await prisma.task.delete({ where: { id } });
  },
  update: async function (id, updates) {
    const { homeArea, ...restUpdates } = updates;

    const result = await prisma.task.update({
      where: { id },
      data: {
        ...restUpdates,
        description:
          updates.description === undefined ? undefined : updates.description,
        ...(homeArea !== undefined && {
          areaId: homeArea ? homeArea.id : null,
        }),
      },
      include: { area: true },
    });

    return {
      ...result,
      description: result.description ?? undefined,
      homeArea: result.area ?? undefined,
      completedAt: result.completedAt ?? undefined,
    };
  },
  countUncompleted: async function () {
    const count = await prisma.task.count({ where: { completed: false } });
    return count;
  },
};
