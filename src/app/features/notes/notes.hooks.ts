import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note, NoteInput } from "@repo/features/notes/note.entity";
import * as services from "./notes.services";
import { NOTES_QUERY_KEY } from "./notes.query";
import { toast } from "sonner";
import { DASHBOARD_DATA } from "../dashboard/dashboard.query";

export const useNoteCreation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoteInput) => services.createNote({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
      toast.success("Note created");
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });
};

export const useNoteUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string } & Partial<NoteInput>) =>
      services.updateNote({ data }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [NOTES_QUERY_KEY] });
      const previousNotes = queryClient.getQueryData<Note[]>([NOTES_QUERY_KEY]);

      queryClient.setQueryData<Note[]>([NOTES_QUERY_KEY], (old) =>
        old?.map((note) =>
          note.id === data.id
            ? { ...note, ...data, updatedAt: new Date() }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (_err, _data, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData([NOTES_QUERY_KEY], context.previousNotes);
      }
      toast.error("Failed to update note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success("Note updated");
    },
  });
};

export const useNoteDeletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.deleteNote({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTES_QUERY_KEY] });
      const previousNotes = queryClient.getQueryData<Note[]>([NOTES_QUERY_KEY]);

      queryClient.setQueryData<Note[]>([NOTES_QUERY_KEY], (old) =>
        old?.filter((note) => note.id !== id)
      );

      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData([NOTES_QUERY_KEY], context.previousNotes);
      }
      toast.error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
      toast.success("Note deleted");
    },
  });
};
