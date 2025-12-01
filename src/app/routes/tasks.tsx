import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Plus } from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Keep track of household to-dos and chores
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckSquare className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">No tasks yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
            Add tasks to stay on top of household chores, maintenance, or
            anything else that needs to get done.
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add your first task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
