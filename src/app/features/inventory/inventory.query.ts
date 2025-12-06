export const INVENTORY_QUERY_KEY = "inventory";
import { queryOptions } from "@tanstack/react-query";
import * as services from "./inventory.services";

export const inventoryQueryOptions = () =>
  queryOptions({
    queryKey: [INVENTORY_QUERY_KEY],
    queryFn: () => services.getAllInventoryItems(),
  });
