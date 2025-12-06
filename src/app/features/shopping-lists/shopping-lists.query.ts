import { queryOptions } from "@tanstack/react-query";
import * as services from "./shopping-lists.services";

export const SHOPPING_LIST_QUERY_KEY = "shopping-list";
export const SHOPPING_HISTORY_QUERY_KEY = "shopping-history";

export const shoppingListQueryOptions = () =>
  queryOptions({
    queryKey: [SHOPPING_LIST_QUERY_KEY],
    queryFn: () => services.getActiveShoppingList(),
  });

export const shoppingHistoryQueryOptions = () =>
  queryOptions({
    queryKey: [SHOPPING_HISTORY_QUERY_KEY],
    queryFn: () => services.getShoppingHistory(),
  });
