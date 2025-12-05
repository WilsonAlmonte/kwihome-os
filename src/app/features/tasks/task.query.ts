export const TASKS_QUERY_KEY = "tasks";
import { queryOptions } from "@tanstack/react-query";
import * as services from "./tasks.services";

export const tasksQueryOptions = () =>
  queryOptions({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: () => services.getAllTasks(),
  });
