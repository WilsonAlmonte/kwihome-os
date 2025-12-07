import { Plus } from "lucide-react";
import { EmptyState } from "@app/components/ui/empty-state";
import { FileText } from "lucide-react";

interface NotesEmptyProps {
  onCreateNote: () => void;
  isFirstNote?: boolean;
}

/**
 * NotesEmpty Component
 * Displays empty state when no notes exist
 */
export function NotesEmpty({
  onCreateNote,
  isFirstNote = true,
}: NotesEmptyProps) {
  return (
    <EmptyState
      icon={<FileText className="h-7 w-7" />}
      iconBgColor="bg-rose-500/10"
      iconColor="text-rose-700"
      title={isFirstNote ? "No notes yet" : "No notes match your filters"}
      description={
        isFirstNote
          ? "Jot down important details like WiFi passwords, appliance manuals, emergency contacts, or maintenance schedules."
          : "Try adjusting your search or filters."
      }
      action={{
        label: isFirstNote ? "Create your first note" : "Create Note",
        onClick: onCreateNote,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}
