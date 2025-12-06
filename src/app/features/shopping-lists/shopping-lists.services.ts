import { getContainer } from "@repo/di/container";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import {
  ShoppingList,
  ShoppingListStatus,
} from "@repo/features/shopping-lists/shopping-list.entity";
import { createServerFn } from "@tanstack/react-start";

/**
 * Get the active shopping list or generate a virtual draft from OUT_OF_STOCK items
 */
export const getActiveShoppingList = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();

    // Try to get existing active list (DRAFT or ACTIVE)
    const activeList = await repos.shoppingLists.findActiveList();
    if (activeList) {
      return activeList;
    }

    // No active list - generate a virtual draft from OUT_OF_STOCK inventory items
    const allInventoryItems = await repos.inventory.findAll();
    const outOfStockItems = allInventoryItems.filter(
      (item) => item.status === InventoryStatus.OUT_OF_STOCK
    );

    // Create a virtual draft (not saved to database yet)
    const virtualDraft: ShoppingList = {
      id: "virtual-draft",
      status: ShoppingListStatus.DRAFT,
      items: outOfStockItems.map((item) => ({
        id: `virtual-${item.id}`,
        name: item.name,
        checked: false,
        inventoryItem: item,
        homeArea: item.homeArea,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return virtualDraft;
  }
);

/**
 * Create a new shopping list from a virtual draft
 * Converts virtual draft to a real, persisted shopping list
 */
export const createShoppingListFromDraft = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      items: Array<{
        name: string;
        inventoryItem?: InventoryItem;
        homeArea?: HomeArea;
      }>;
    }) => data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();

    // Create the shopping list
    const newList = await repos.shoppingLists.create();

    // Add all items
    if (data.items.length > 0) {
      await repos.shoppingLists.addMultipleItems(
        newList.id,
        data.items.map((item) => ({
          name: item.name,
          inventoryItem: item.inventoryItem,
          homeArea: item.homeArea ?? item.inventoryItem?.homeArea,
        }))
      );
    }

    // Fetch the complete list with items
    const completeList = await repos.shoppingLists.findById(newList.id);
    return completeList;
  });

/**
 * Add an item to a shopping list
 */
export const addShoppingListItem = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      listId: string;
      name: string;
      inventoryItem?: InventoryItem;
      homeArea?: HomeArea;
      addToInventory?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    const { useCases, repos } = getContainer();

    // If this is a virtual draft, we need to create a real list first
    let listId = data.listId;
    if (listId === "virtual-draft") {
      // Get current OUT_OF_STOCK items to populate the list
      const allInventoryItems = await repos.inventory.findAll();
      const outOfStockItems = allInventoryItems.filter(
        (item) => item.status === InventoryStatus.OUT_OF_STOCK
      );

      // Create the list
      const newList = await repos.shoppingLists.create();
      listId = newList.id;

      // Add existing OUT_OF_STOCK items
      if (outOfStockItems.length > 0) {
        await repos.shoppingLists.addMultipleItems(
          listId,
          outOfStockItems.map((item) => ({
            name: item.name,
            inventoryItem: item,
            homeArea: item.homeArea,
          }))
        );
      }
    }

    // Now add the new item using the use case
    const newItem = await useCases.addItemToShoppingList.execute(
      listId,
      data.name,
      {
        inventoryItem: data.inventoryItem,
        homeArea: data.homeArea,
        addToInventory: data.addToInventory,
      }
    );

    // Return the updated list
    const updatedList = await repos.shoppingLists.findById(listId);
    return { list: updatedList, newItem };
  });

/**
 * Remove an item from a shopping list
 */
export const removeShoppingListItem = createServerFn({ method: "POST" })
  .inputValidator((data: { itemId: string; listId: string }) => data)
  .handler(async ({ data }) => {
    const { useCases, repos } = getContainer();

    // If this is a virtual draft, we need to create a real list first without this item
    if (data.listId === "virtual-draft") {
      // Get current OUT_OF_STOCK items
      const allInventoryItems = await repos.inventory.findAll();
      const outOfStockItems = allInventoryItems.filter(
        (item) => item.status === InventoryStatus.OUT_OF_STOCK
      );

      // Filter out the item being removed (virtual item id is "virtual-{inventoryItemId}")
      const inventoryIdToRemove = data.itemId.replace("virtual-", "");
      const remainingItems = outOfStockItems.filter(
        (item) => item.id !== inventoryIdToRemove
      );

      // Create the list if there are remaining items
      if (remainingItems.length > 0) {
        const newList = await repos.shoppingLists.create();
        await repos.shoppingLists.addMultipleItems(
          newList.id,
          remainingItems.map((item) => ({
            name: item.name,
            inventoryItem: item,
            homeArea: item.homeArea,
          }))
        );
        const completeList = await repos.shoppingLists.findById(newList.id);
        return completeList;
      }

      // No items remaining, return empty virtual draft
      return {
        id: "virtual-draft",
        status: ShoppingListStatus.DRAFT,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Remove from existing list
    await useCases.removeItemFromShoppingList.execute(data.itemId);
    const updatedList = await repos.shoppingLists.findById(data.listId);
    return updatedList;
  });

/**
 * Toggle an item's checked status
 */
export const toggleItemChecked = createServerFn({ method: "POST" })
  .inputValidator((data: { itemId: string; checked: boolean }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedItem = await useCases.toggleItemChecked.execute(
      data.itemId,
      data.checked
    );
    return updatedItem;
  });

/**
 * Start a shopping trip
 */
export const startShoppingTrip = createServerFn({ method: "POST" })
  .inputValidator((data: { listId: string }) => data)
  .handler(async ({ data }) => {
    const { useCases, repos } = getContainer();

    // If this is a virtual draft, we need to create a real list first
    let listId = data.listId;
    if (listId === "virtual-draft") {
      // Get current OUT_OF_STOCK items
      const allInventoryItems = await repos.inventory.findAll();
      const outOfStockItems = allInventoryItems.filter(
        (item) => item.status === InventoryStatus.OUT_OF_STOCK
      );

      if (outOfStockItems.length === 0) {
        throw new Error("Cannot start shopping with an empty list");
      }

      // Create the list
      const newList = await repos.shoppingLists.create();
      listId = newList.id;

      // Add OUT_OF_STOCK items
      await repos.shoppingLists.addMultipleItems(
        listId,
        outOfStockItems.map((item) => ({
          name: item.name,
          inventoryItem: item,
          homeArea: item.homeArea,
        }))
      );
    }

    // Start the shopping trip
    const updatedList = await useCases.startShoppingTrip.execute(listId);
    return updatedList;
  });

/**
 * Complete a shopping trip - updates inventory for checked items
 */
export const completeShoppingTrip = createServerFn({ method: "POST" })
  .inputValidator((data: { listId: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const completedList = await useCases.completeShoppingTrip.execute(
      data.listId
    );
    return completedList;
  });

/**
 * Abandon a draft shopping list
 */
export const abandonDraft = createServerFn({ method: "POST" })
  .inputValidator((data: { listId: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();

    // If it's a virtual draft, nothing to do
    if (data.listId === "virtual-draft") {
      return { success: true };
    }

    await useCases.abandonDraft.execute(data.listId);
    return { success: true };
  });

/**
 * Get shopping history (completed lists)
 */
export const getShoppingHistory = createServerFn({ method: "GET" }).handler(
  async () => {
    const { useCases } = getContainer();
    const history = await useCases.getShoppingHistory.execute();
    return history;
  }
);

/**
 * Cancel an active shopping trip - returns to DRAFT status with all items unchecked
 */
export const cancelShoppingTrip = createServerFn({ method: "POST" })
  .inputValidator((data: { listId: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedList = await useCases.cancelShoppingTrip.execute(data.listId);
    return updatedList;
  });
