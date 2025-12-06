import { queryOptions } from "@tanstack/react-query";
import * as services from "./notes.services";

export const NOTES_QUERY_KEY = "notes";

export const notesQueryOptions = () =>
  queryOptions({
    queryKey: [NOTES_QUERY_KEY],
    queryFn: () => services.getAllNotes(),
  });

export const noteByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [NOTES_QUERY_KEY, id],
    queryFn: () => services.getNoteById({ data: { id } }),
  });
