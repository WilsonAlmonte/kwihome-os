import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Calendar,
  Search,
} from "lucide-react";
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
import { useMediaQuery } from "../hooks/use-media-query";
import type { Note, NoteInput } from "@repo/features/notes/note.entity";
import { NoteForm } from "@app/components/forms";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [deleteDialogProps, setDeleteDialogProps] = useState<{
    isOpen: boolean;
    note?: Note;
  }>({
    isOpen: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");

  const createNoteMutation = useNoteCreation();
  const updateNoteMutation = useNoteUpdate();
  const deleteNoteMutation = useNoteDeletion();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCreateNote = async (data: NoteInput) => {
    try {
      await createNoteMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
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
    if (!deleteDialogProps.note) return;

    try {
      await deleteNoteMutation.mutateAsync(deleteDialogProps.note.id);
      setViewingNote(null);
      setEditingNote(null);
      setDeleteDialogProps({ isOpen: false, note: undefined });
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Filter notes based on search and area
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedAreaFilter === "all" ||
      (selectedAreaFilter === "none" && !note.homeArea) ||
      note.homeArea?.id === selectedAreaFilter;

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
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {isDesktop && "Add Note"}
        </Button>
      </div>

      {/* Filters */}
      {notes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Areas</option>
            <option value="none">No Area</option>
            {homeAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 && notes.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-4">
              <FileText className="h-7 w-7 text-rose-700" />
            </div>
            <h3 className="font-semibold mb-1">No notes yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
              Jot down important details like WiFi passwords, appliance manuals,
              emergency contacts, or maintenance schedules.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create your first note
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredNotes.length === 0 && notes.length > 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No notes match your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Grid layout for notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Swipeable
            key={note.id}
            onSwipeLeft={() => setDeleteDialogProps({ isOpen: true, note })}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => setViewingNote(note)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
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
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create Note"
        maxWidth="sm:max-w-[700px]"
      >
        <NoteForm
          homeAreas={homeAreas}
          onSubmit={handleCreateNote}
          onCancel={() => setIsCreateDialogOpen(false)}
          isSubmitting={createNoteMutation.isPending}
        />
      </ResponsiveDialog>

      {/* Edit Dialog */}
      <ResponsiveDialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        title="Edit Note"
        maxWidth="sm:max-w-[700px]"
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
                  setDeleteDialogProps({ isOpen: true, note: viewingNote });
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
        open={deleteDialogProps.isOpen}
        onOpenChange={(open) => setDeleteDialogProps({ isOpen: open })}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteDialogProps.note?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteNote}
        onCancel={() =>
          setDeleteDialogProps({ isOpen: false, note: undefined })
        }
        isLoading={deleteNoteMutation.isPending}
      />
    </div>
  );
}
