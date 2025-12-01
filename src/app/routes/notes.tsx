import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

function NotesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">Notes</h1>
    </div>
  );
}
