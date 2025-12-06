import { z } from "zod";
import { HomeArea } from "../home-areas/home-area.entity";
import { InventoryItem } from "../inventory/inventory-item.entity";

export enum ShoppingListStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export type ShoppingListItem = {
  id: string;
  name: string;
  checked: boolean;
  inventoryItem?: InventoryItem;
  homeArea?: HomeArea;
  createdAt: Date;
  updatedAt: Date;
};

export type ShoppingList = {
  id: string;
  status: ShoppingListStatus;
  startedAt?: Date;
  completedAt?: Date;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
};

// Validation schema for creating/updating shopping list items
export const shoppingListItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be 100 characters or less")
    .trim(),
  inventoryItemId: z.string().optional(),
  homeAreaId: z.string().optional(),
  addToInventory: z.boolean().optional().default(false),
});

export type CreateShoppingListItemInput = z.infer<
  typeof shoppingListItemSchema
>;
