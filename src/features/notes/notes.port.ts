import type { HomeArea } from "../home-areas/home-area.entity";
import type { Note } from "./note.entity";

export interface NotesRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(title: string, content: string, homeArea?: HomeArea): Promise<Note>;
  update(
    id: string,
    updates: {
      title?: string;
      content?: string;
      homeArea?: HomeArea | null;
    }
  ): Promise<Note>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
