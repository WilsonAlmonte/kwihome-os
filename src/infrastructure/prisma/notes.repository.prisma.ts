import { prisma } from "@repo/db/client";
import type { HomeArea } from "@repo/features/home-areas/home-area.entity";
import type { NotesRepository } from "@repo/features/notes/notes.port";

export const prismaNotesRepository: NotesRepository = {
  findAll: async function () {
    const result = await prisma.note.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { area: true },
    });

    return result.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      homeArea: note.area ?? undefined,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  },

  findById: async function (id: string) {
    const result = await prisma.note.findFirst({
      where: { id, deletedAt: null },
      include: { area: true },
    });

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      homeArea: result.area ?? undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  create: async function (title: string, content: string, homeArea?: HomeArea) {
    const result = await prisma.note.create({
      data: {
        title,
        content,
        areaId: homeArea?.id,
      },
      include: { area: true },
    });

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      homeArea: result.area ?? undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  update: async function (
    id: string,
    updates: {
      title?: string;
      content?: string;
      homeArea?: HomeArea | null;
    }
  ) {
    const result = await prisma.note.update({
      where: { id },
      data: {
        title: updates.title,
        content: updates.content,
        areaId:
          updates.homeArea === null ? null : updates.homeArea?.id ?? undefined,
      },
      include: { area: true },
    });

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      homeArea: result.area ?? undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  },

  delete: async function (id: string) {
    await prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  count: async function () {
    return prisma.note.count({
      where: { deletedAt: null },
    });
  },
};
