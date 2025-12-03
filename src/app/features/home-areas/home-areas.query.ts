import { queryOptions } from "@tanstack/react-query";
import * as services from "./home-areas.services";

export const HOME_AREAS_QUERY_KEY = "home-areas";

export const homeAreasQueryOptions = () =>
  queryOptions({
    queryKey: [HOME_AREAS_QUERY_KEY],
    queryFn: () => services.getHomeAreas(),
  });
