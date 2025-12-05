import type { HomeArea } from "@repo/features/home-areas/home-area.entity";
import type { Note } from "@repo/features/notes/note.entity";
import type { NotesRepository } from "@repo/features/notes/notes.port";

let notes: Note[] = [];

export const mockNotesRepository: NotesRepository = {
  findAll: async function () {
    return notes.filter((note) => !("deletedAt" in note));
  },

  findById: async function (id: string) {
    const note = notes.find((n) => n.id === id && !("deletedAt" in n));
    return note ?? null;
  },

  create: async function (title: string, content: string, homeArea?: HomeArea) {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      homeArea,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notes.push(newNote);
    return newNote;
  },

  update: async function (
    id: string,
    updates: {
      title?: string;
      content?: string;
      homeArea?: HomeArea | null;
    }
  ) {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error(`Note with id ${id} not found`);
    }

    notes[index] = {
      ...notes[index],
      title: updates.title ?? notes[index].title,
      content: updates.content ?? notes[index].content,
      homeArea:
        updates.homeArea === null
          ? undefined
          : updates.homeArea ?? notes[index].homeArea,
      updatedAt: new Date(),
    };

    return notes[index];
  },

  delete: async function (id: string) {
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes.splice(index, 1);
    }
  },

  count: async function () {
    return notes.filter((note) => !("deletedAt" in note)).length;
  },
};

// Test helper to reset mock data
export function resetMockNotes() {
  notes = [];
}
