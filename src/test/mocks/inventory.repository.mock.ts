import { InventoryRepository } from "@repo/features/inventory/inventory.port";
import { InventoryItem } from "@repo/features/inventory/inventory-item.entity";

// Mock data store
let mockInventoryItems: (InventoryItem & { deletedAt: Date | null })[] = [];
let idCounter = 1;

export const mockInventoryRepository: InventoryRepository = {
  findAll: async function () {
    return mockInventoryItems.filter((item) => !item.deletedAt);
  },

  findById: async function (id) {
    const item = mockInventoryItems.find((i) => i.id === id && !i.deletedAt);
    return item ?? null;
  },

  create: async function (name, status, homeArea) {
    const newItem: InventoryItem = {
      id: `mock-inventory-${idCounter++}`,
      name,
      status,
      homeArea,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockInventoryItems.push({ ...newItem, deletedAt: null });
    return newItem;
  },

  update: async function (id, updates) {
    const index = mockInventoryItems.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error("Inventory item not found");
    }

    mockInventoryItems[index] = {
      ...mockInventoryItems[index],
      ...updates,
      updatedAt: new Date(),
    };

    return mockInventoryItems[index];
  },

  delete: async function (id) {
    const index = mockInventoryItems.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error("Inventory item not found");
    }
    mockInventoryItems[index] = {
      ...mockInventoryItems[index],
      deletedAt: new Date(),
    };
  },

  countByStatus: async function (status) {
    return mockInventoryItems.filter(
      (item) => item.status === status && !item.deletedAt
    ).length;
  },
};

// Helper to reset mock data (useful for testing)
export function resetMockInventory() {
  mockInventoryItems = [];
  idCounter = 1;
}
