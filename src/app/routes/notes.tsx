import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

function NotesPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-muted-foreground mt-1">
          Save important information about your home
        </p>
      </div>

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
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create your first note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
