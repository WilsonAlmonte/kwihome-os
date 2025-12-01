import { DashboardData } from "./dashboard-data.entity";

export default class GetDashboardDataUseCase {
  constructor(private homeAreasRepository: HomeAreasRepository) {}

  async execute(): Promise<DashboardData> {
    const homeAreasStats = await this.homeAreasRepository.getStats();
    return {
      totalHomeAreas: homeAreasStats.total,
      outOfStockItems: 10,
      pendingTasks: 5,
      itemsInShoppingList: 8,
      totalNotes: 15,
    };
  }
}
