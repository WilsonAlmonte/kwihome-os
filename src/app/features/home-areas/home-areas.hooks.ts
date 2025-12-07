import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import * as services from "./home-areas.services";
import {
  HOME_AREAS_QUERY_KEY,
  homeAreasQueryOptions,
} from "./home-areas.query";
import { DASHBOARD_DATA } from "../dashboard/dashboard.query";

export const useHomeAreas = () => {
  return useSuspenseQuery(homeAreasQueryOptions());
};

export const useHomeAreaCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => services.createHomeArea({ data: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOME_AREAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};

export const useHomeAreaUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      services.updateHomeArea({ data: { id, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOME_AREAS_QUERY_KEY] });
    },
  });
};

export const useHomeAreaDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.deleteHomeArea({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOME_AREAS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};
