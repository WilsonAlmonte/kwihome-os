import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { tasksQueryOptions } from "../features/tasks/task.query";
import { homeAreasQueryOptions } from "../features/home-areas/home-areas.query";
import {
  useTaskCreation,
  useTaskUpdate,
  useTaskDeletion,
  useMarkTaskComplete,
  useMarkTaskPending,
} from "../features/tasks/tasks.hooks";
import { TasksEmpty } from "../features/tasks/tasks-empty";
import { Task } from "@repo/features/tasks/task.entity";
import { useDialogState } from "../hooks/use-dialog-state";
import { TaskForm, TaskFormData } from "../components/forms/task-form";
import { TaskItemCard } from "../components/cards/task-item-card";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tasksQueryOptions());
    context.queryClient.prefetchQuery(homeAreasQueryOptions());
  },
});

function TasksPage() {
  const { data: tasks } = useSuspenseQuery(tasksQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());

  const [showCompleted, setShowCompleted] = useState(false);
  const addDialog = useDialogState<Task>();
  const deleteDialog = useDialogState<Task>();

  const createTask = useTaskCreation(() => {
    addDialog.close();
  });
  const updateTask = useTaskUpdate();
  const deleteTask = useTaskDeletion();
  const markComplete = useMarkTaskComplete();
  const markPending = useMarkTaskPending();

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleTaskSubmit = async (data: TaskFormData) => {
    try {
      const homeArea = data.homeAreaId
        ? homeAreas.find((area) => area.id === data.homeAreaId)
        : undefined;

      if (addDialog.data) {
        await updateTask.mutateAsync({
          id: addDialog.data.id,
          updates: {
            title: data.title,
            description: data.description || undefined,
            homeArea,
          },
        });
        toast.success("Task updated", {
          description: `${data.title} has been updated.`,
        });
        addDialog.close();
      } else {
        await createTask.mutateAsync({
          title: data.title,
          description: data.description || undefined,
          homeArea,
        });
        toast.success("Task created", {
          description: `${data.title} has been added to your tasks.`,
        });
      }
    } catch (error) {
      toast.error("Failed to save task", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleTaskDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      await deleteTask.mutateAsync(deleteDialog.data.id);
      toast.success("Task deleted", {
        description: `${deleteDialog.data.title} has been removed.`,
      });
      deleteDialog.close();
    } catch (error) {
      toast.error("Failed to delete task", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const toastId = toast.loading(
      task.completed ? "Marking as pending..." : "Completing task..."
    );
    try {
      if (task.completed) {
        await markPending.mutateAsync(task.id);
        toast.success("Task marked as pending", { id: toastId });
      } else {
        await markComplete.mutateAsync(task.id);
        toast.success("Task completed!", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to update task", {
        id: toastId,
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of household to-dos and chores
          </p>
        </div>
        {tasks.length > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => addDialog.open()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Task Dialog */}
      <ResponsiveDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) addDialog.close();
        }}
        title={addDialog.data ? "Edit Task" : "Add Task"}
        description="Keep track of household to-dos and maintenance tasks."
      >
        <TaskForm
          initialData={addDialog.data}
          homeAreas={homeAreas}
          onSubmit={handleTaskSubmit}
          onCancel={() => addDialog.close()}
          isSubmitting={createTask.isPending || updateTask.isPending}
        />
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) deleteDialog.close();
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteDialog.data?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleTaskDelete}
        onCancel={() => deleteDialog.close()}
        isLoading={deleteTask.isPending}
      />

      {tasks.length > 0 ? (
        <div className="space-y-6">
          {/* Active Tasks */}
          {activeTasks.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Active Tasks
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({activeTasks.length})
                </span>
              </h2>
              <div className="space-y-2">
                {activeTasks.map((task) => (
                  <TaskItemCard
                    key={task.id}
                    task={task}
                    openAddDialog={addDialog.open}
                    openDeleteDialog={deleteDialog.open}
                    handleToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </section>
          ) : (
            <TasksEmpty
              onAddTask={() => addDialog.open()}
              hasActiveTasks={true}
            />
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <section>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-lg font-semibold mb-3 hover:text-primary transition-colors"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    showCompleted ? "rotate-180" : ""
                  }`}
                />
                Completed Tasks
                <span className="text-sm text-muted-foreground font-normal">
                  ({completedTasks.length})
                </span>
              </button>
              {showCompleted && (
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskItemCard
                      key={task.id}
                      task={task}
                      openAddDialog={addDialog.open}
                      openDeleteDialog={deleteDialog.open}
                      handleToggleComplete={handleToggleComplete}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        <TasksEmpty onAddTask={() => addDialog.open()} isFirstTask={true} />
      )}
    </div>
  );
}
