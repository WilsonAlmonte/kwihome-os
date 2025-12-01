import { prisma } from "@repo/db";

export const prismaHomeAreasRepository: HomeAreasRepository = {
  findAll: async function (): Promise<HomeArea[]> {
    return prisma.homeArea.findMany({
      orderBy: { createdAt: "asc" },
      where: { deletedAt: null },
    });
  },
  findById: function (id: string): Promise<HomeArea | null> {
    return prisma.homeArea.findUnique({ where: { id, deletedAt: null } });
  },
  create: function (name: string): Promise<HomeArea> {
    return prisma.homeArea.create({ data: { name } });
  },
  update: function (id: string, name: string): Promise<HomeArea> {
    return prisma.homeArea.update({
      where: { id, deletedAt: null },
      data: { name },
    });
  },

  // Soft delete implementation
  delete: function (id: string): Promise<void> {
    return prisma.homeArea
      .update({ where: { id }, data: { deletedAt: new Date() } })
      .then(() => {});
  },

  getStats: async function (): Promise<{ total: number }> {
    const total = await prisma.homeArea.count({ where: { deletedAt: null } });
    return { total };
  },
};
