import { Repositories } from "@repo/di/container";
import { HomeAreasRepository } from "../home-areas/home-areas.port";
import { DashboardData } from "./dashboard-data.entity";
import { TasksRepository } from "../tasks/tasks.port";

export default class GetDashboardDataUseCase {
  _homeAreasRepo: HomeAreasRepository;
  _tasksRepo: TasksRepository;

  constructor(repos: Repositories) {
    this._homeAreasRepo = repos.homeAreas;
    this._tasksRepo = repos.tasks;
  }

  async execute(): Promise<DashboardData> {
    const homeAreasStats = await this._homeAreasRepo.getStats();
    const uncompletedTasksCount = await this._tasksRepo.countUncompleted();
    return {
      totalHomeAreas: homeAreasStats.total,
      // This is a mock implementation that's temporary; replace with real data fetching logic
      outOfStockItems: 10,
      pendingTasks: uncompletedTasksCount,
      itemsInShoppingList: 8,
      totalNotes: 15,
    };
  }
}
