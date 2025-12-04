import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { Task } from "@repo/features/tasks/task.entity";
import { TasksRepository } from "@repo/features/tasks/tasks.port";

let tasks: Task[] = [];

export const mockTasksRepository: TasksRepository = {
  findAll: async function (): Promise<Task[]> {
    return Promise.resolve(tasks);
  },
  create: function (
    title: string,
    description?: string,
    homeArea?: HomeArea
  ): Promise<Task> {
    const id =
      tasks.length > 0
        ? (parseInt(tasks[tasks.length - 1].id) + 1).toString()
        : "1";
    const newTask: Task = {
      id,
      title,
      description: description || "",
      homeArea: homeArea || undefined,
      completed: false,
    };
    tasks.push(newTask);
    return Promise.resolve(newTask);
  },
  delete: function (id: string): Promise<void> {
    tasks = tasks.filter((task) => task.id !== id);
    return Promise.resolve();
  },
  update: function (
    id: string,
    updates: Partial<Omit<Task, "id">>
  ): Promise<Task> {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
      };
    }
    return Promise.resolve(tasks[taskIndex]);
  },
  countUncompleted: async function (): Promise<number> {
    const uncompletedTasks = tasks.filter((task) => !task.completed);
    return Promise.resolve(uncompletedTasks.length);
  },
};
