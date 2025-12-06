import { HomeArea } from "../home-areas/home-area.entity";
import { InventoryItem } from "../inventory/inventory-item.entity";
import {
  ShoppingList,
  ShoppingListItem,
  ShoppingListStatus,
} from "./shopping-list.entity";

export interface CreateShoppingListItemData {
  name: string;
  inventoryItem?: InventoryItem;
  homeArea?: HomeArea;
}

export interface ShoppingListsRepository {
  // List operations
  findActiveList(): Promise<ShoppingList | null>;
  findById(id: string): Promise<ShoppingList | null>;
  findAll(): Promise<ShoppingList[]>;
  findCompletedLists(): Promise<ShoppingList[]>;
  create(): Promise<ShoppingList>;
  updateStatus(
    id: string,
    status: ShoppingListStatus,
    timestamp?: Date
  ): Promise<ShoppingList>;
  delete(id: string): Promise<void>;

  // Item operations
  addItem(
    listId: string,
    item: CreateShoppingListItemData
  ): Promise<ShoppingListItem>;
  updateItem(
    itemId: string,
    updates: Partial<Omit<ShoppingListItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<ShoppingListItem>;
  removeItem(itemId: string): Promise<void>;
  toggleItemChecked(
    itemId: string,
    checked: boolean
  ): Promise<ShoppingListItem>;

  // Batch operations
  addMultipleItems(
    listId: string,
    items: CreateShoppingListItemData[]
  ): Promise<ShoppingListItem[]>;
  uncheckAllItems(listId: string): Promise<void>;

  countItemsInActiveList(): Promise<number>;
}
