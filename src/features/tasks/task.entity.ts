import { z } from "zod";
import { HomeArea } from "../home-areas/home-area.entity";

export type Task = {
  id: string;
  completed: boolean;
  completedAt?: Date;

  homeArea?: HomeArea;
} & Omit<z.infer<typeof taskSchema>, "homeAreaId">;

// Validation schema for creating/updating tasks
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(100, "Task title must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  homeAreaId: z.string().optional(),
});
