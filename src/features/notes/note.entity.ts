import { z } from "zod";
import type { HomeArea } from "../home-areas/home-area.entity";

export type Note = {
  id: string;
  title: string;
  content: string;
  homeArea?: HomeArea;
  createdAt: Date;
  updatedAt: Date;
} & Omit<z.infer<typeof noteSchema>, "homeAreaId">;

export const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Note title is required")
    .max(100, "Note title must be 100 characters or less")
    .trim(),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be 10,000 characters or less")
    .trim(),
  homeAreaId: z.string().optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;
