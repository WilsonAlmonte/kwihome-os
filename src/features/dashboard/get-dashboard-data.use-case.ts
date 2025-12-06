import { Repositories } from "@repo/di/container";
import { HomeAreasRepository } from "../home-areas/home-areas.port";
import { DashboardData } from "./dashboard-data.entity";
import { TasksRepository } from "../tasks/tasks.port";
import { NotesRepository } from "../notes/notes.port";
import { InventoryRepository } from "../inventory/inventory.port";
import { InventoryStatus } from "../inventory/inventory-item.entity";
import { ShoppingListsRepository } from "../shopping-lists";

export default class GetDashboardDataUseCase {
  _homeAreasRepo: HomeAreasRepository;
  _tasksRepo: TasksRepository;
  _notesRepo: NotesRepository;
  _inventoryRepo: InventoryRepository;
  _shoppingListsRepo: ShoppingListsRepository;
  constructor(repos: Repositories) {
    this._homeAreasRepo = repos.homeAreas;
    this._tasksRepo = repos.tasks;
    this._notesRepo = repos.notes;
    this._inventoryRepo = repos.inventory;
    this._shoppingListsRepo = repos.shoppingLists;
  }

  async execute(): Promise<DashboardData> {
    const homeAreasStats = await this._homeAreasRepo.getStats();
    const uncompletedTasksCount = await this._tasksRepo.countUncompleted();
    const totalNotes = await this._notesRepo.count();
    const outOfStockItems = await this._inventoryRepo.countByStatus(
      InventoryStatus.OUT_OF_STOCK
    );
    const itemsInShoppingList =
      await this._shoppingListsRepo.countItemsInActiveList();
    return {
      totalHomeAreas: homeAreasStats.total,
      // This is a mock implementation that's temporary; replace with real data fetching logic
      outOfStockItems,
      pendingTasks: uncompletedTasksCount,
      itemsInShoppingList:
        itemsInShoppingList > 0 ? itemsInShoppingList : outOfStockItems,
      totalNotes,
    };
  }
}
