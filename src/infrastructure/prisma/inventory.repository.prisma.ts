import { prisma } from "@repo/db";
import { InventoryRepository } from "@repo/features/inventory/inventory.port";
import { InventoryStatus } from "@repo/features/inventory/inventory-item.entity";

export const prismaInventoryRepository: InventoryRepository = {
  findAll: async function () {
    const result = await prisma.inventoryItem.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      include: { area: true },
    });

    return result.map((item) => {
      const { area, areaId, ...rest } = item;
      return {
        ...rest,
        status: item.status as InventoryStatus,
        homeArea: area ?? undefined,
        deletedAt: item.deletedAt ?? undefined,
      };
    });
  },

  findById: async function (id) {
    const result = await prisma.inventoryItem.findFirst({
      where: { id, deletedAt: null },
      include: { area: true },
    });

    if (!result) return null;

    const { area, areaId, ...rest } = result;
    return {
      ...rest,
      status: result.status as InventoryStatus,
      homeArea: area ?? undefined,
      deletedAt: result.deletedAt ?? undefined,
    };
  },

  create: async function (name, status, homeArea) {
    const result = await prisma.inventoryItem.create({
      data: {
        name,
        status,
        areaId: homeArea ? homeArea.id : null,
      },
      include: { area: true },
    });

    const { area, areaId, ...rest } = result;
    return {
      ...rest,
      status: result.status as InventoryStatus,
      homeArea: area ?? undefined,
      deletedAt: result.deletedAt ?? undefined,
    };
  },

  update: async function (id, updates) {
    const { homeArea, status, ...restUpdates } = updates;

    const result = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...restUpdates,
        ...(status !== undefined && { status }),
        ...(homeArea !== undefined && {
          areaId: homeArea ? homeArea.id : null,
        }),
      },
      include: { area: true },
    });

    const { area, areaId, ...rest } = result;
    return {
      ...rest,
      status: result.status as InventoryStatus,
      homeArea: area ?? undefined,
      deletedAt: result.deletedAt ?? undefined,
    };
  },

  delete: async function (id) {
    await prisma.inventoryItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  countByStatus: async function (status) {
    const count = await prisma.inventoryItem.count({
      where: { status, deletedAt: null },
    });
    return count;
  },
};
