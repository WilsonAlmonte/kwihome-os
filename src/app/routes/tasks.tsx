import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
    </div>
  );
}
