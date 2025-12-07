import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash2, Edit, MapPin, Calendar, Search } from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { Swipeable } from "@app/components/ui/swipeable";
import { notesQueryOptions } from "../features/notes/notes.query";
import { homeAreasQueryOptions } from "../features/home-areas/home-areas.query";
import {
  useNoteCreation,
  useNoteUpdate,
  useNoteDeletion,
} from "../features/notes/notes.hooks";
import { NotesEmpty } from "../features/notes/notes-empty";
import { useMediaQuery } from "../hooks/use-media-query";
import type { Note, NoteInput } from "@repo/features/notes/note.entity";
import { NoteForm } from "@app/components/forms";
import { useDialogState } from "../hooks/use-dialog-state";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(notesQueryOptions());
    await context.queryClient.ensureQueryData(homeAreasQueryOptions());
  },
});

function NotesPage() {
  const { data: notes } = useSuspenseQuery(notesQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());
  const createDialog = useDialogState();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const deleteDialog = useDialogState<Note>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreaFilters, setSelectedAreaFilters] = useState<Set<string>>(
    new Set(["all"])
  );

  const createNoteMutation = useNoteCreation();
  const updateNoteMutation = useNoteUpdate();
  const deleteNoteMutation = useNoteDeletion();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCreateNote = async (data: NoteInput) => {
    try {
      await createNoteMutation.mutateAsync(data);
      createDialog.close();
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleUpdateNote = async (data: NoteInput) => {
    if (!editingNote) return;

    try {
      await updateNoteMutation.mutateAsync({ id: editingNote.id, ...data });
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteDialog.data) return;

    try {
      await deleteNoteMutation.mutateAsync(deleteDialog.data.id);
      setViewingNote(null);
      setEditingNote(null);
      deleteDialog.close();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const toggleAreaFilter = (filterId: string) => {
    const newFilters = new Set(selectedAreaFilters);

    if (filterId === "all") {
      // If "All Rooms" is clicked, clear all other filters
      setSelectedAreaFilters(new Set(["all"]));
    } else {
      // Remove "all" if it's selected
      newFilters.delete("all");

      // Toggle the clicked filter
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }

      // If no filters left, default to "all"
      if (newFilters.size === 0) {
        newFilters.add("all");
      }

      setSelectedAreaFilters(newFilters);
    }
  };

  // Filter notes based on search and area
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedAreaFilters.has("all") ||
      (selectedAreaFilters.has("none") && !note.homeArea) ||
      (note.homeArea && selectedAreaFilters.has(note.homeArea.id));

    return matchesSearch && matchesArea;
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-1">
            Save important information about your home
          </p>
        </div>
        <Button onClick={() => createDialog.open()} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {isDesktop && "Add Note"}
        </Button>
      </div>

      {/* Filters */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Room Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedAreaFilters.has("all") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAreaFilter("all")}
            >
              All Rooms ({notes.length})
            </Button>
            <Button
              variant={selectedAreaFilters.has("none") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAreaFilter("none")}
            >
              No Room ({notes.filter((n) => !n.homeArea).length})
            </Button>
            {homeAreas.map((area) => {
              const count = notes.filter(
                (n) => n.homeArea?.id === area.id
              ).length;
              return (
                <Button
                  key={area.id}
                  variant={
                    selectedAreaFilters.has(area.id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleAreaFilter(area.id)}
                >
                  {area.name} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 && notes.length === 0 && (
        <NotesEmpty
          onCreateNote={() => createDialog.open()}
          isFirstNote={true}
        />
      )}

      {filteredNotes.length === 0 && notes.length > 0 && (
        <NotesEmpty
          onCreateNote={() => createDialog.open()}
          isFirstNote={false}
        />
      )}

      {/* Grid layout for notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Swipeable key={note.id} onSwipeLeft={() => deleteDialog.open(note)}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => setViewingNote(note)}
            >
              <CardContent className="p-3 space-y-2 md:p-4 md:space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, "")}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-3">
                    {note.homeArea && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{note.homeArea.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Swipeable>
        ))}
      </div>

      {/* Create Dialog */}
      <ResponsiveDialog
        open={createDialog.isOpen}
        onOpenChange={(open) =>
          open ? createDialog.open() : createDialog.close()
        }
        title="Create Note"
        maxWidth="sm:max-w-[700px]"
      >
        <NoteForm
          homeAreas={homeAreas}
          onSubmit={handleCreateNote}
          onCancel={() => createDialog.close()}
          isSubmitting={createNoteMutation.isPending}
        />
      </ResponsiveDialog>

      {/* Edit Dialog */}
      <ResponsiveDialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        title="Edit Note"
        maxWidth="sm:max-w-[1000px]"
      >
        {editingNote && (
          <NoteForm
            initialData={editingNote}
            homeAreas={homeAreas}
            onSubmit={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            isSubmitting={updateNoteMutation.isPending}
          />
        )}
      </ResponsiveDialog>

      {/* View Dialog */}
      <ResponsiveDialog
        open={!!viewingNote}
        onOpenChange={(open) => !open && setViewingNote(null)}
        title={viewingNote?.title || "Note"}
        minWidth="sm:min-w-[700px]"
        // calc(80%)
      >
        {viewingNote && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {viewingNote.homeArea && (
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                  <MapPin className="h-3 w-3" />
                  <span>{viewingNote.homeArea.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Updated {new Date(viewingNote.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: viewingNote.content }}
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingNote(viewingNote);
                  setViewingNote(null);
                }}
                className="gap-1.5 flex-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteDialog.open(viewingNote);
                  setViewingNote(null);
                }}
                className="gap-1.5 flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          open ? deleteDialog.open() : deleteDialog.close()
        }
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteDialog.data?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteNote}
        onCancel={() => deleteDialog.close()}
        isLoading={deleteNoteMutation.isPending}
      />
    </div>
  );
}
