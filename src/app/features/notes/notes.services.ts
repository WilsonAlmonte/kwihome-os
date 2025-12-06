import { getContainer } from "@repo/di/container";
import { noteSchema } from "@repo/features/notes/note.entity";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAllNotes = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const notes = await repos.notes.findAll();
    return notes;
  }
);

export const getNoteById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const note = await repos.notes.findById(data.id);
    return note;
  });

export const createNote = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof noteSchema>) => noteSchema.parse(data))
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const homeArea =
      data.homeAreaId && data.homeAreaId !== ""
        ? ({ id: data.homeAreaId } as any)
        : undefined;
    const note = await repos.notes.create(data.title, data.content, homeArea);
    return note;
  });

export const updateNote = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: string } & Partial<z.infer<typeof noteSchema>>) => data
  )
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    const homeArea =
      data.homeAreaId !== undefined
        ? data.homeAreaId === null || data.homeAreaId === ""
          ? null
          : ({ id: data.homeAreaId } as any)
        : undefined;
    const note = await repos.notes.update(data.id, {
      title: data.title,
      content: data.content,
      homeArea,
    });
    return note;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { repos } = getContainer();
    await repos.notes.delete(data.id);
    return { success: true };
  });

export const countNotes = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const count = await repos.notes.count();
    return count;
  }
);
