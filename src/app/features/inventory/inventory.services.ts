import { getContainer } from "@repo/di/container";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import { createServerFn } from "@tanstack/react-start";

export const getAllInventoryItems = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const items = await repos.inventory.findAll();
    return items;
  }
);

export const createInventoryItem = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; status: InventoryStatus; homeArea?: HomeArea }) =>
      data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const newItem = await repos.inventory.create(
      data.name,
      data.status,
      data.homeArea
    );
    return newItem;
  });

export const updateInventoryItem = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      updates: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>;
    }) => data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const updatedItem = await repos.inventory.update(data.id, data.updates);
    return updatedItem;
  });

export const deleteInventoryItem = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    await repos.inventory.delete(data.id);
  });

export const toggleInventoryStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: string; currentStatus: InventoryStatus }) => data
  )
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedItem = await useCases.toggleInventoryStatus.execute(
      data.id,
      data.currentStatus
    );
    return updatedItem;
  });

export const markAsNotNeeded = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedItem = await useCases.markAsNotNeeded.execute(data.id);
    return updatedItem;
  });
