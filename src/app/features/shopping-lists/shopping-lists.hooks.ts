import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as services from "./shopping-lists.services";
import { SHOPPING_LIST_QUERY_KEY } from "./shopping-lists.query";
import { INVENTORY_QUERY_KEY } from "../inventory/inventory.query";
import { DASHBOARD_DATA } from "../dashboard/dashboard.query";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { InventoryItem } from "@repo/features/inventory/inventory-item.entity";
import { ShoppingList } from "@repo/features/shopping-lists/shopping-list.entity";

export const useAddShoppingListItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      listId: string;
      name: string;
      inventoryItem?: InventoryItem;
      homeArea?: HomeArea;
      addToInventory?: boolean;
    }) => services.addShoppingListItem({ data }),
    onSuccess: (result) => {
      // If a new list was created, update the cache with it
      if (result?.list) {
        queryClient.setQueryData([SHOPPING_LIST_QUERY_KEY], result.list);
      }
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useRemoveShoppingListItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; listId: string }) =>
      services.removeShoppingListItem({ data }),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
      const previousList = queryClient.getQueryData<ShoppingList>([
        SHOPPING_LIST_QUERY_KEY,
      ]);

      // Optimistic update: remove item from list
      if (previousList) {
        queryClient.setQueryData<ShoppingList>([SHOPPING_LIST_QUERY_KEY], {
          ...previousList,
          items: previousList.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          [SHOPPING_LIST_QUERY_KEY],
          context.previousList
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
    },
  });
};

export const useToggleItemChecked = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; checked: boolean }) =>
      services.toggleItemChecked({ data }),
    onMutate: async ({ itemId, checked }) => {
      await queryClient.cancelQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
      const previousList = queryClient.getQueryData<ShoppingList>([
        SHOPPING_LIST_QUERY_KEY,
      ]);

      // Optimistic update: toggle checked state
      if (previousList) {
        queryClient.setQueryData<ShoppingList>([SHOPPING_LIST_QUERY_KEY], {
          ...previousList,
          items: previousList.items.map((item) =>
            item.id === itemId ? { ...item, checked } : item
          ),
        });
      }

      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          [SHOPPING_LIST_QUERY_KEY],
          context.previousList
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
    },
  });
};

export const useStartShoppingTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) =>
      services.startShoppingTrip({ data: { listId } }),
    onSuccess: (updatedList) => {
      queryClient.setQueryData([SHOPPING_LIST_QUERY_KEY], updatedList);
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
    },
  });
};

export const useCompleteShoppingTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) =>
      services.completeShoppingTrip({ data: { listId } }),
    onSuccess: () => {
      // Invalidate both shopping list and inventory (inventory items updated to IN_STOCK)
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};

export const useAbandonDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => services.abandonDraft({ data: { listId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
    },
  });
};

export const useCancelShoppingTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) =>
      services.cancelShoppingTrip({ data: { listId } }),
    onSuccess: (updatedList) => {
      queryClient.setQueryData([SHOPPING_LIST_QUERY_KEY], updatedList);
      queryClient.invalidateQueries({ queryKey: [SHOPPING_LIST_QUERY_KEY] });
    },
  });
};
