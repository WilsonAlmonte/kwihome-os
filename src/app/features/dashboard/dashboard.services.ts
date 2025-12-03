import { getContainer } from "@repo/di/container";
import { createServerFn } from "@tanstack/react-start";

export const getDashboardData = createServerFn().handler(async () => {
  const { useCases } = getContainer();
  const stats = await useCases.getDashboardData.execute();
  return stats;
});
