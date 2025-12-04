import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as services from "./tasks.services";
import { TASKS_QUERY_KEY } from "./task.query";
import { DASHBOARD_DATA } from "../dashboard/dashboard.query";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { Task } from "@repo/features/tasks/task.entity";

export const useTaskCreation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData: {
      title: string;
      description?: string;
      homeArea?: HomeArea;
    }) => services.createTask({ data: taskData }),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};
export const useTaskUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      updates: Partial<Omit<Task, "id" | "completed">>;
    }) => services.updateTask({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};

export const useTaskDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.deleteTask({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};

export const useMarkTaskComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.markTaskComplete({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });
      const previousTasks = queryClient.getQueryData<Task[]>([TASKS_QUERY_KEY]);

      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY], (old) =>
        old?.map((task) =>
          task.id === id
            ? { ...task, completed: true, completedAt: new Date() }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData([TASKS_QUERY_KEY], context.previousTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};

export const useMarkTaskPending = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.markTaskPending({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });
      const previousTasks = queryClient.getQueryData<Task[]>([TASKS_QUERY_KEY]);

      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY], (old) =>
        old?.map((task) =>
          task.id === id
            ? { ...task, completed: false, completedAt: undefined }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData([TASKS_QUERY_KEY], context.previousTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};
