import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as services from "./inventory.services";
import { INVENTORY_QUERY_KEY } from "./inventory.query";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";

export const useInventoryItemCreation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemData: {
      name: string;
      status: InventoryStatus;
      homeArea?: HomeArea;
    }) => services.createInventoryItem({ data: itemData }),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useInventoryItemUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      updates: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>;
    }) => services.updateInventoryItem({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useInventoryItemDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.deleteInventoryItem({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useToggleInventoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; currentStatus: InventoryStatus }) =>
      services.toggleInventoryStatus({ data }),
    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: [INVENTORY_QUERY_KEY] });
      const previousItems = queryClient.getQueryData<InventoryItem[]>([
        INVENTORY_QUERY_KEY,
      ]);

      const newStatus =
        currentStatus === InventoryStatus.IN_STOCK
          ? InventoryStatus.OUT_OF_STOCK
          : InventoryStatus.IN_STOCK;

      queryClient.setQueryData<InventoryItem[]>([INVENTORY_QUERY_KEY], (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      return { previousItems };
    },
    onError: (_err, _data, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([INVENTORY_QUERY_KEY], context.previousItems);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};

export const useMarkAsNotNeeded = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.markAsNotNeeded({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [INVENTORY_QUERY_KEY] });
      const previousItems = queryClient.getQueryData<InventoryItem[]>([
        INVENTORY_QUERY_KEY,
      ]);

      queryClient.setQueryData<InventoryItem[]>([INVENTORY_QUERY_KEY], (old) =>
        old?.map((item) =>
          item.id === id
            ? { ...item, status: InventoryStatus.NOT_NEEDED }
            : item
        )
      );

      return { previousItems };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([INVENTORY_QUERY_KEY], context.previousItems);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    },
  });
};
