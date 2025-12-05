import { z } from "zod";

export type HomeArea = {
  id: string;
} & z.infer<typeof homeAreaSchema>;

// Validation schema for creating/updating home areas
export const homeAreaSchema = z.object({
  name: z
    .string()
    .min(1, "Area name is required")
    .max(50, "Area name must be 50 characters or less")
    .trim(),
});
