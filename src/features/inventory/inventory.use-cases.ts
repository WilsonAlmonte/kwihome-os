import { InventoryRepository } from "./inventory.port";
import { InventoryStatus } from "./inventory-item.entity";

export class ToggleInventoryStatusUseCase {
  constructor(private _inventoryRepository: InventoryRepository) {}

  async execute(itemId: string, currentStatus: InventoryStatus) {
    const newStatus =
      currentStatus === InventoryStatus.IN_STOCK
        ? InventoryStatus.OUT_OF_STOCK
        : InventoryStatus.IN_STOCK;

    const updatedItem = await this._inventoryRepository.update(itemId, {
      status: newStatus,
    });

    return updatedItem;
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
