import { TasksRepository } from "./tasks.port";

export class MarkTaskCompleteUseCase {
  constructor(private _taskRepository: TasksRepository) {}
  async execute(taskId: string) {
    const updatedTask = await this._taskRepository.update(taskId, {
      completed: true,
      completedAt: new Date(),
    });
    return updatedTask;
  }
}

export class MarkTaskPendingUseCase {
  constructor(private _taskRepository: TasksRepository) {}
  async execute(taskId: string) {
    const updatedTask = await this._taskRepository.update(taskId, {
      completed: false,
      completedAt: null,
    });
    return updatedTask;
  }
}
