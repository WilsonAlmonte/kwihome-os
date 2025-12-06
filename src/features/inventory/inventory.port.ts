import { HomeArea } from "../home-areas/home-area.entity";
import { InventoryItem, InventoryStatus } from "./inventory-item.entity";

export interface InventoryRepository {
  findAll(): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem | null>;
  create(
    name: string,
    status: InventoryStatus,
    homeArea?: HomeArea
  ): Promise<InventoryItem>;
  update(
    id: string,
    updates: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
  countByStatus(status: InventoryStatus): Promise<number>;
}
