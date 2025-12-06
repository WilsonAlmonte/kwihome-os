import { InventoryRepository } from "./inventory.port";
import { InventoryItem, InventoryStatus } from "./inventory-item.entity";
import { ShoppingListsRepository } from "../shopping-lists/shopping-lists.port";
import { ShoppingListStatus } from "../shopping-lists/shopping-list.entity";

export class ToggleInventoryStatusUseCase {
  constructor(
    private _inventoryRepository: InventoryRepository,
    private _shoppingListsRepository?: ShoppingListsRepository
  ) {}

  async execute(itemId: string, currentStatus: InventoryStatus) {
    const newStatus =
      currentStatus === InventoryStatus.IN_STOCK
        ? InventoryStatus.OUT_OF_STOCK
        : InventoryStatus.IN_STOCK;

    const updatedItem = await this._inventoryRepository.update(itemId, {
      status: newStatus,
    });

    // Auto-add to shopping list if item went OUT_OF_STOCK
    if (
      newStatus === InventoryStatus.OUT_OF_STOCK &&
      this._shoppingListsRepository
    ) {
      await this._autoAddToShoppingList(updatedItem);
    }

    return updatedItem;
  }

  private async _autoAddToShoppingList(item: InventoryItem): Promise<boolean> {
    if (!this._shoppingListsRepository) return false;

    // Find active list (DRAFT or ACTIVE)
    const activeList = await this._shoppingListsRepository.findActiveList();

    // Only add to real lists (not virtual drafts) that are DRAFT or ACTIVE
    if (
      !activeList ||
      activeList.id === "virtual-draft" ||
      (activeList.status !== ShoppingListStatus.DRAFT &&
        activeList.status !== ShoppingListStatus.ACTIVE)
    ) {
      return false;
    }

    // Check if item is already in the list by inventoryItemId
    const alreadyInList = activeList.items.some(
      (listItem) => listItem.inventoryItem?.id === item.id
    );

    if (alreadyInList) {
      return false;
    }

    // Add the item to the shopping list
    await this._shoppingListsRepository.addItem(activeList.id, {
      name: item.name,
      inventoryItem: item,
      homeArea: item.homeArea,
    });

    return true;
  }
}

export class MarkAsNotNeededUseCase {
  constructor(private _inventoryRepository: InventoryRepository) {}

  async execute(itemId: string) {
    const updatedItem = await this._inventoryRepository.update(itemId, {
      status: InventoryStatus.NOT_NEEDED,
    });

    return updatedItem;
  }
}
