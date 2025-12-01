import { Repositories } from "@repo/di/container";
import { HomeAreasRepository } from "../home-areas/home-areas.port";
import { DashboardData } from "./dashboard-data.entity";

export default class GetDashboardDataUseCase {
  _homeAreasRepo: HomeAreasRepository;

  constructor(repos: Repositories) {
    this._homeAreasRepo = repos.homeAreas;
  }

  async execute(): Promise<DashboardData> {
    const homeAreasStats = await this._homeAreasRepo.getStats();
    return {
      totalHomeAreas: homeAreasStats.total,
      outOfStockItems: 10,
      pendingTasks: 5,
      itemsInShoppingList: 8,
      totalNotes: 15,
    };
  }
}
