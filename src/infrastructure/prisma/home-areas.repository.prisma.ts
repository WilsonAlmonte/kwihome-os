import { prisma } from "@repo/db";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { HomeAreasRepository } from "@repo/features/home-areas/home-areas.port";

export const prismaHomeAreasRepository: HomeAreasRepository = {
  findAll: async function (): Promise<HomeArea[]> {
    return prisma.homeArea.findMany({
      orderBy: { createdAt: "asc" },
    });
  },
  findById: function (id: string): Promise<HomeArea | null> {
    return prisma.homeArea.findFirst({ where: { id } });
  },
  create: function (name: string): Promise<HomeArea> {
    return prisma.homeArea.create({ data: { name } });
  },
  update: function (id: string, name: string): Promise<HomeArea> {
    return prisma.homeArea.update({
      where: { id },
      data: { name },
    });
  },

  delete: function (id: string): Promise<void> {
    return prisma.homeArea.delete({ where: { id } }).then(() => {});
  },

  getStats: async function (): Promise<{ total: number }> {
    const total = await prisma.homeArea.count();
    return { total };
  },
};
