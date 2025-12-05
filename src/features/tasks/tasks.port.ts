import { HomeArea } from "../home-areas/home-area.entity";
import { Task } from "./task.entity";

export interface TasksRepository {
  findAll(): Promise<Task[]>;
  create(
    title: string,
    description?: string,
    homeArea?: HomeArea
  ): Promise<Task>;
  delete(id: string): Promise<void>;
  update(
    id: string,
    updates: Partial<
      Omit<Task, "id" | "completedAt"> & { completedAt: Date | null }
    >
  ): Promise<Task>;
  countUncompleted(): Promise<number>;
}
