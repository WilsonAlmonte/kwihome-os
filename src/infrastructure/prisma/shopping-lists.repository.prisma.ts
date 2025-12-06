import { prisma } from "@repo/db";
import { InventoryStatus } from "@repo/features/inventory/inventory-item.entity";
import {
  ShoppingList,
  ShoppingListItem,
  ShoppingListStatus,
} from "@repo/features/shopping-lists/shopping-list.entity";
import { ShoppingListsRepository } from "@repo/features/shopping-lists/shopping-lists.port";

// Helper function to map Prisma result to ShoppingListItem entity
function mapToShoppingListItem(item: any): ShoppingListItem {
  const {
    inventoryItem,
    area,
    inventoryItemId,
    areaId,
    shoppingListId,
    deletedAt,
    ...rest
  } = item;
  return {
    ...rest,
    inventoryItem: inventoryItem
      ? {
          ...inventoryItem,
          status: inventoryItem.status as InventoryStatus,
          homeArea: inventoryItem.area ?? undefined,
        }
      : undefined,
    homeArea: area ?? undefined,
  };
}

// Helper function to map Prisma result to ShoppingList entity
function mapToShoppingList(list: any): ShoppingList {
  const { items, deletedAt, ...rest } = list;
  return {
    ...rest,
    status: list.status as ShoppingListStatus,
    startedAt: list.startedAt ?? undefined,
    completedAt: list.completedAt ?? undefined,
    items: items?.map(mapToShoppingListItem) ?? [],
  };
}

export const prismaShoppingListsRepository: ShoppingListsRepository = {
  findActiveList: async function () {
    const result = await prisma.shoppingList.findFirst({
      where: {
        status: { in: ["DRAFT", "ACTIVE"] },
        deletedAt: null,
      },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return result ? mapToShoppingList(result) : null;
  },

  findById: async function (id) {
    const result = await prisma.shoppingList.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return result ? mapToShoppingList(result) : null;
  },

  findAll: async function () {
    const result = await prisma.shoppingList.findMany({
      where: { deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return result.map(mapToShoppingList);
  },

  findCompletedLists: async function () {
    const result = await prisma.shoppingList.findMany({
      where: {
        status: "COMPLETED",
        deletedAt: null,
      },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    return result.map(mapToShoppingList);
  },

  create: async function () {
    const result = await prisma.shoppingList.create({
      data: {
        status: "DRAFT",
      },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
        },
      },
    });

    return mapToShoppingList(result);
  },

  updateStatus: async function (id, status, timestamp) {
    const updateData: any = { status };

    if (status === ShoppingListStatus.ACTIVE && timestamp) {
      updateData.startedAt = timestamp;
    } else if (status === ShoppingListStatus.COMPLETED && timestamp) {
      updateData.completedAt = timestamp;
    }

    const result = await prisma.shoppingList.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            inventoryItem: {
              include: { area: true },
            },
            area: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return mapToShoppingList(result);
  },

  delete: async function (id) {
    await prisma.shoppingList.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  addItem: async function (listId, item) {
    const result = await prisma.shoppingListItem.create({
      data: {
        name: item.name,
        shoppingListId: listId,
        inventoryItemId: item.inventoryItem?.id ?? null,
        areaId: item.homeArea?.id ?? null,
      },
      include: {
        inventoryItem: {
          include: { area: true },
        },
        area: true,
      },
    });

    return mapToShoppingListItem(result);
  },

  updateItem: async function (itemId, updates) {
    const { inventoryItem, homeArea, ...restUpdates } = updates;

    const result = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        ...restUpdates,
        ...(inventoryItem !== undefined && {
          inventoryItemId: inventoryItem ? inventoryItem.id : null,
        }),
        ...(homeArea !== undefined && {
          areaId: homeArea ? homeArea.id : null,
        }),
      },
      include: {
        inventoryItem: {
          include: { area: true },
        },
        area: true,
      },
    });

    return mapToShoppingListItem(result);
  },

  removeItem: async function (itemId) {
    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  },

  toggleItemChecked: async function (itemId, checked) {
    const result = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { checked },
      include: {
        inventoryItem: {
          include: { area: true },
        },
        area: true,
      },
    });

    return mapToShoppingListItem(result);
  },

  addMultipleItems: async function (listId, items) {
    const createdItems: ShoppingListItem[] = [];

    for (const item of items) {
      const result = await prisma.shoppingListItem.create({
        data: {
          name: item.name,
          shoppingListId: listId,
          inventoryItemId: item.inventoryItem?.id ?? null,
          areaId: item.homeArea?.id ?? null,
        },
        include: {
          inventoryItem: {
            include: { area: true },
          },
          area: true,
        },
      });

      createdItems.push(mapToShoppingListItem(result));
    }

    return createdItems;
  },

  uncheckAllItems: async function (listId) {
    await prisma.shoppingListItem.updateMany({
      where: {
        shoppingListId: listId,
        deletedAt: null,
      },
      data: {
        checked: false,
      },
    });
  },
  countItemsInActiveList: async function () {
    const activeList = await this.findActiveList();
    if (!activeList) {
      return 0;
    }
    return activeList.items.length;
  },
};
