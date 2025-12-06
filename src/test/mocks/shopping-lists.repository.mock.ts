import {
  ShoppingList,
  ShoppingListItem,
  ShoppingListStatus,
} from "@repo/features/shopping-lists/shopping-list.entity";
import { ShoppingListsRepository } from "@repo/features/shopping-lists/shopping-lists.port";

// Mock data stores
let mockShoppingLists: (ShoppingList & { deletedAt: Date | null })[] = [];
let mockShoppingListItems: (ShoppingListItem & {
  shoppingListId: string;
  deletedAt: Date | null;
})[] = [];
let listIdCounter = 1;
let itemIdCounter = 1;

export const mockShoppingListsRepository: ShoppingListsRepository = {
  findActiveList: async function () {
    const list = mockShoppingLists.find(
      (l) =>
        (l.status === ShoppingListStatus.DRAFT ||
          l.status === ShoppingListStatus.ACTIVE) &&
        !l.deletedAt
    );

    if (!list) return null;

    const items = mockShoppingListItems.filter(
      (i) => i.shoppingListId === list.id && !i.deletedAt
    );

    return {
      ...list,
      items,
    };
  },

  findById: async function (id) {
    const list = mockShoppingLists.find((l) => l.id === id && !l.deletedAt);

    if (!list) return null;

    const items = mockShoppingListItems.filter(
      (i) => i.shoppingListId === list.id && !i.deletedAt
    );

    return {
      ...list,
      items,
    };
  },

  findAll: async function () {
    return mockShoppingLists
      .filter((l) => !l.deletedAt)
      .map((list) => ({
        ...list,
        items: mockShoppingListItems.filter(
          (i) => i.shoppingListId === list.id && !i.deletedAt
        ),
      }));
  },

  findCompletedLists: async function () {
    return mockShoppingLists
      .filter((l) => l.status === ShoppingListStatus.COMPLETED && !l.deletedAt)
      .map((list) => ({
        ...list,
        items: mockShoppingListItems.filter(
          (i) => i.shoppingListId === list.id && !i.deletedAt
        ),
      }))
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return b.completedAt.getTime() - a.completedAt.getTime();
      });
  },

  create: async function () {
    const newList: ShoppingList & { deletedAt: Date | null } = {
      id: `mock-shopping-list-${listIdCounter++}`,
      status: ShoppingListStatus.DRAFT,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockShoppingLists.push(newList);
    return { ...newList, deletedAt: undefined };
  },

  updateStatus: async function (id, status, timestamp) {
    const index = mockShoppingLists.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error("Shopping list not found");
    }

    const updateData: Partial<ShoppingList> = {
      status,
      updatedAt: new Date(),
    };

    if (status === ShoppingListStatus.ACTIVE && timestamp) {
      updateData.startedAt = timestamp;
    } else if (status === ShoppingListStatus.COMPLETED && timestamp) {
      updateData.completedAt = timestamp;
    }

    mockShoppingLists[index] = {
      ...mockShoppingLists[index],
      ...updateData,
    };

    const items = mockShoppingListItems.filter(
      (i) => i.shoppingListId === id && !i.deletedAt
    );

    return {
      ...mockShoppingLists[index],
      items,
    };
  },

  delete: async function (id) {
    const index = mockShoppingLists.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error("Shopping list not found");
    }
    mockShoppingLists[index] = {
      ...mockShoppingLists[index],
      deletedAt: new Date(),
    };
  },

  addItem: async function (listId, item) {
    const newItem: ShoppingListItem & {
      shoppingListId: string;
      deletedAt: Date | null;
    } = {
      id: `mock-shopping-item-${itemIdCounter++}`,
      name: item.name,
      checked: false,
      inventoryItem: item.inventoryItem,
      homeArea: item.homeArea,
      shoppingListId: listId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockShoppingListItems.push(newItem);

    const { shoppingListId, deletedAt, ...result } = newItem;
    return result;
  },

  updateItem: async function (itemId, updates) {
    const index = mockShoppingListItems.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new Error("Shopping list item not found");
    }

    mockShoppingListItems[index] = {
      ...mockShoppingListItems[index],
      ...updates,
      updatedAt: new Date(),
    };

    const { shoppingListId, deletedAt, ...result } =
      mockShoppingListItems[index];
    return result;
  },

  removeItem: async function (itemId) {
    const index = mockShoppingListItems.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new Error("Shopping list item not found");
    }
    mockShoppingListItems[index] = {
      ...mockShoppingListItems[index],
      deletedAt: new Date(),
    };
  },

  toggleItemChecked: async function (itemId, checked) {
    const index = mockShoppingListItems.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new Error("Shopping list item not found");
    }

    mockShoppingListItems[index] = {
      ...mockShoppingListItems[index],
      checked,
      updatedAt: new Date(),
    };

    const { shoppingListId, deletedAt, ...result } =
      mockShoppingListItems[index];
    return result;
  },

  addMultipleItems: async function (listId, items) {
    const createdItems: ShoppingListItem[] = [];

    for (const item of items) {
      const newItem: ShoppingListItem & {
        shoppingListId: string;
        deletedAt: Date | null;
      } = {
        id: `mock-shopping-item-${itemIdCounter++}`,
        name: item.name,
        checked: false,
        inventoryItem: item.inventoryItem,
        homeArea: item.homeArea,
        shoppingListId: listId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockShoppingListItems.push(newItem);

      const { shoppingListId, deletedAt, ...result } = newItem;
      createdItems.push(result);
    }

    return createdItems;
  },

  uncheckAllItems: async function (listId) {
    mockShoppingListItems = mockShoppingListItems.map((item) => {
      if (item.shoppingListId === listId && !item.deletedAt) {
        return {
          ...item,
          checked: false,
          updatedAt: new Date(),
        };
      }
      return item;
    });
  },
};

// Helper to reset mock data (useful for testing)
export function resetMockShoppingLists() {
  mockShoppingLists = [];
  mockShoppingListItems = [];
  listIdCounter = 1;
  itemIdCounter = 1;
}
