import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as services from "./home-areas.services";
import { HOME_AREAS_QUERY_KEY } from "./home-areas.query";

export const useHomeAreaCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => services.createHomeArea({ data: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOME_AREAS_QUERY_KEY] });
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
