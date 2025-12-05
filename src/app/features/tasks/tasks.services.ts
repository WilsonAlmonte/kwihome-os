import { getContainer } from "@repo/di/container";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { Task } from "@repo/features/tasks/task.entity";
import { createServerFn } from "@tanstack/react-start";

export const getAllTasks = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const tasks = await repos.tasks.findAll();
    return tasks;
  }
);

export const createTask = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { title: string; description?: string; homeArea?: HomeArea }) => data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const newTask = await repos.tasks.create(
      data.title,
      data.description,
      data.homeArea
    );
    return newTask;
  });

export const updateTask = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: string; updates: Partial<Omit<Task, "id" | "completed">> }) =>
      data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const updatedTask = await repos.tasks.update(data.id, data.updates);
    return updatedTask;
  });

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    await repos.tasks.delete(data.id);
  });

export const markTaskComplete = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedTask = await useCases.markTaskComplete.execute(data.id);
    return updatedTask;
  });

export const markTaskPending = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedTask = await useCases.markTaskPending.execute(data.id);
    return updatedTask;
  });
