import { z } from "zod";
import { HomeArea } from "../home-areas/home-area.entity";

export enum InventoryStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  NOT_NEEDED = "NOT_NEEDED",
}

export type InventoryItem = {
  id: string;
  status: InventoryStatus;
  homeArea?: HomeArea;
  createdAt: Date;
  updatedAt: Date;
} & Omit<z.infer<typeof inventoryItemSchema>, "homeAreaId">;

// Validation schema for creating/updating inventory items
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be 100 characters or less")
    .trim(),
  homeAreaId: z.string().optional(),
  status: z
    .enum(InventoryStatus)
    .optional()
    .default(InventoryStatus.OUT_OF_STOCK),
});
