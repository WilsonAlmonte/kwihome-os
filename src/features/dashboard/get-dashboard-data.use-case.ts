import { HomeAreasRepository } from "../home-areas/home-areas.port";
import { DashboardData } from "./dashboard-data.entity";
import { TasksRepository } from "../tasks/tasks.port";
import { NotesRepository } from "../notes/notes.port";
import { InventoryRepository } from "../inventory/inventory.port";
import { InventoryStatus } from "../inventory/inventory-item.entity";
import { ShoppingListsRepository } from "../shopping-lists";

export default class GetDashboardDataUseCase {
  constructor(
    private _homeAreasRepo: HomeAreasRepository,
    private _tasksRepo: TasksRepository,
    private _notesRepo: NotesRepository,
    private _inventoryRepo: InventoryRepository,
    private _shoppingListsRepo: ShoppingListsRepository
  ) {}

  async execute(): Promise<DashboardData> {
    const [
      homeAreasStats,
      uncompletedTasksCount,
      totalNotes,
      outOfStockItems,
      itemsInShoppingList,
    ] = await Promise.all([
      this._homeAreasRepo.getStats(),
      this._tasksRepo.countUncompleted(),
      this._notesRepo.count(),
      this._inventoryRepo.countByStatus(InventoryStatus.OUT_OF_STOCK),
      this._shoppingListsRepo.countItemsInActiveList(),
    ]);

    return {
      totalHomeAreas: homeAreasStats.total,
      outOfStockItems,
      pendingTasks: uncompletedTasksCount,
      itemsInShoppingList:
        itemsInShoppingList > 0 ? itemsInShoppingList : outOfStockItems,
      totalNotes,
    };
  }
}
