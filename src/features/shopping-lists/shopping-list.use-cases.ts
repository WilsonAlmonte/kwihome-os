import { HomeArea } from "../home-areas/home-area.entity";
import {
  InventoryItem,
  InventoryStatus,
} from "../inventory/inventory-item.entity";
import { InventoryRepository } from "../inventory/inventory.port";
import { ShoppingList, ShoppingListStatus } from "./shopping-list.entity";
import {
  CreateShoppingListItemData,
  ShoppingListsRepository,
} from "./shopping-lists.port";

/**
 * Get the active shopping list (DRAFT or ACTIVE status) or create a new draft
 */
export class GetOrCreateDraftUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(): Promise<ShoppingList> {
    // Try to get existing active list
    const activeList = await this._shoppingListsRepository.findActiveList();
    if (activeList) {
      return activeList;
    }

    // Create a new draft
    return await this._shoppingListsRepository.create();
  }
}

/**
 * Add an item to a shopping list, optionally creating an inventory item
 */
export class AddItemToShoppingListUseCase {
  constructor(
    private _shoppingListsRepository: ShoppingListsRepository,
    private _inventoryRepository: InventoryRepository
  ) {}

  async execute(
    listId: string,
    name: string,
    options?: {
      inventoryItem?: InventoryItem;
      homeArea?: HomeArea;
      addToInventory?: boolean;
    }
  ) {
    let inventoryItem = options?.inventoryItem;
    const homeArea = options?.homeArea;

    // If user wants to add to inventory, create the inventory item first
    if (options?.addToInventory && !inventoryItem) {
      inventoryItem = await this._inventoryRepository.create(
        name,
        InventoryStatus.OUT_OF_STOCK,
        homeArea
      );
    }

    const itemData: CreateShoppingListItemData = {
      name,
      inventoryItem,
      homeArea: homeArea ?? inventoryItem?.homeArea,
    };

    return await this._shoppingListsRepository.addItem(listId, itemData);
  }
}

/**
 * Remove an item from a shopping list
 */
export class RemoveItemFromShoppingListUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(itemId: string) {
    await this._shoppingListsRepository.removeItem(itemId);
  }
}

/**
 * Toggle an item's checked status
 */
export class ToggleItemCheckedUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(itemId: string, checked: boolean) {
    return await this._shoppingListsRepository.toggleItemChecked(
      itemId,
      checked
    );
  }
}

/**
 * Start a shopping trip - changes status from DRAFT to ACTIVE
 */
export class StartShoppingTripUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(listId: string) {
    const list = await this._shoppingListsRepository.findById(listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.status !== ShoppingListStatus.DRAFT) {
      throw new Error("Can only start a shopping trip from a draft list");
    }

    if (list.items.length === 0) {
      throw new Error("Cannot start shopping with an empty list");
    }

    return await this._shoppingListsRepository.updateStatus(
      listId,
      ShoppingListStatus.ACTIVE,
      new Date() // startedAt
    );
  }
}

/**
 * Complete a shopping trip - updates inventory for checked items
 */
export class CompleteShoppingTripUseCase {
  constructor(
    private _shoppingListsRepository: ShoppingListsRepository,
    private _inventoryRepository: InventoryRepository
  ) {}

  async execute(listId: string) {
    const list = await this._shoppingListsRepository.findById(listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.status !== ShoppingListStatus.ACTIVE) {
      throw new Error("Can only complete an active shopping trip");
    }

    // Update inventory for all checked items that are linked to inventory
    const checkedItemsWithInventory = list.items.filter(
      (item) => item.checked && item.inventoryItem
    );

    for (const item of checkedItemsWithInventory) {
      if (item.inventoryItem) {
        await this._inventoryRepository.update(item.inventoryItem.id, {
          status: InventoryStatus.IN_STOCK,
        });
      }
    }

    // Mark list as completed
    return await this._shoppingListsRepository.updateStatus(
      listId,
      ShoppingListStatus.COMPLETED,
      new Date() // completedAt
    );
  }
}

/**
 * Abandon a draft shopping list
 */
export class AbandonDraftUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(listId: string) {
    const list = await this._shoppingListsRepository.findById(listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.status !== ShoppingListStatus.DRAFT) {
      throw new Error("Can only abandon a draft list");
    }

    await this._shoppingListsRepository.delete(listId);
  }
}

/**
 * Get shopping list history (completed lists)
 */
export class GetShoppingHistoryUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute() {
    return await this._shoppingListsRepository.findCompletedLists();
  }
}

/**
 * Cancel an active shopping trip - returns to DRAFT status with all items unchecked
 */
export class CancelShoppingTripUseCase {
  constructor(private _shoppingListsRepository: ShoppingListsRepository) {}

  async execute(listId: string) {
    const list = await this._shoppingListsRepository.findById(listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.status !== ShoppingListStatus.ACTIVE) {
      throw new Error("Can only cancel an active shopping trip");
    }

    // Uncheck all items for a clean slate
    await this._shoppingListsRepository.uncheckAllItems(listId);

    // Reset to DRAFT status (startedAt will remain but status changes)
    return await this._shoppingListsRepository.updateStatus(
      listId,
      ShoppingListStatus.DRAFT
    );
  }
}
