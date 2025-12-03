import { getContainer } from "@repo/di/container";
import { createServerFn } from "@tanstack/react-start";

export const getHomeAreas = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const homeAreas = await repos.homeAreas.findAll();
    return homeAreas;
  }
);

export const createHomeArea = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const newHomeArea = await repos.homeAreas.create(data.name);
    return newHomeArea;
  });

export const updateHomeArea = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; name: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const updatedHomeArea = await repos.homeAreas.update(data.id, data.name);
    return updatedHomeArea;
  });
