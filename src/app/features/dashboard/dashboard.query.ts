import { queryOptions } from "@tanstack/react-query";
import { getDashboardData } from "./dashboard.services";

export const DASHBOARD_DATA = "dashboard-data";

export const dashboardDataQueryOptions = () =>
  queryOptions({
    queryKey: [DASHBOARD_DATA],
    queryFn: () => getDashboardData(),
  });
