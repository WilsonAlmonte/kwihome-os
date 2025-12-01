import { HomeArea } from "./home-area.entity";

export interface HomeAreasRepository {
  findAll(): Promise<HomeArea[]>;
  findById(id: string): Promise<HomeArea | null>;
  create(name: string): Promise<HomeArea>;
  update(id: string, name: string): Promise<HomeArea>;
  delete(id: string): Promise<void>;
  getStats(): Promise<{ total: number }>;
}
