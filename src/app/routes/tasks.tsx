import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  MapPin,
  Edit,
  CheckCheckIcon,
} from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { Swipeable } from "@app/components/ui/swipeable";
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
import { useMediaQuery } from "../hooks/use-media-query";
import { Task, taskSchema } from "@repo/features/tasks/task.entity";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Field, FieldError, Input } from "@app/components/forms";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tasksQueryOptions());
    await context.queryClient.ensureQueryData(homeAreasQueryOptions());
  },
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  homeAreas: HomeArea[];
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

function TaskForm({
  initialData,
  homeAreas,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      homeAreaId: initialData?.homeArea?.id ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="title"
        validators={{
          onChange: taskSchema.shape.title,
        }}
      >
        {(field) => (
          <Field>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Clean the kitchen, Fix leaky faucet"
              disabled={isSubmitting}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <Field>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Add any additional details..."
              disabled={isSubmitting}
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              rows={3}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name="homeAreaId">
        {(field) => (
          <Field>
            <div className="grid grid-cols-2 gap-2">
              {!initialData?.homeArea && (
                <button
                  type="button"
                  onClick={() => field.handleChange("")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all ${
                    field.state.value === ""
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-input hover:border-primary/50 hover:bg-accent"
                  } ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  No Room
                </button>
              )}
              {homeAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => field.handleChange(area.id)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all ${
                    field.state.value === area.id
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-input hover:border-primary/50 hover:bg-accent"
                  } ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {field.state.value === area.id ? (
                    <CheckCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {area.name}
                </button>
              ))}
            </div>
          </Field>
        )}
      </form.Field>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmittingForm]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isSubmittingForm}
            >
              {initialData ? "Update Task" : "Create Task"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

function TasksPage() {
  const { data: tasks } = useSuspenseQuery(tasksQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const [showCompleted, setShowCompleted] = useState(false);
  const [addDialogProps, setAddDialogProps] = useState<{
    isOpen: boolean;
    initialData?: Task;
  }>({
    isOpen: false,
  });
  const [deleteDialogProps, setDeleteDialogProps] = useState<{
    isOpen: boolean;
    task?: Task;
  }>({
    isOpen: false,
  });

  const createTask = useTaskCreation(() => {
    setAddDialogProps({ isOpen: false, initialData: undefined });
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

      if (addDialogProps.initialData) {
        await updateTask.mutateAsync({
          id: addDialogProps.initialData.id,
          updates: {
            title: data.title,
            description: data.description || undefined,
            homeArea,
          },
        });
        toast.success("Task updated", {
          description: `${data.title} has been updated.`,
        });
        setAddDialogProps({ isOpen: false, initialData: undefined });
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
    if (!deleteDialogProps.task) return;

    try {
      await deleteTask.mutateAsync(deleteDialogProps.task.id);
      toast.success("Task deleted", {
        description: `${deleteDialogProps.task.title} has been removed.`,
      });
      setDeleteDialogProps({ isOpen: false, task: undefined });
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

  const renderTask = (task: Task) => {
    const cardContent = (
      <Card
        className="transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer"
        onClick={() =>
          setAddDialogProps({
            isOpen: true,
            initialData: { ...task },
          })
        }
      >
        <CardContent className="flex items-start gap-2 p-3 md:gap-3 md:p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(task);
            }}
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5 -m-0.5 hover:bg-accent rounded-md md:p-1 md:-m-1"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            ) : (
              <Circle className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium wrap-break-word text-sm md:text-base ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap wrap-break-word">
                {task.description}
              </p>
            )}
            {task.homeArea && (
              <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{task.homeArea.name}</span>
              </div>
            )}
            {task.completed && task.completedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Completed on {new Date(task.completedAt).toLocaleDateString()} @{" "}
                {new Date(task.completedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddDialogProps({
                    isOpen: true,
                    initialData: { ...task },
                  });
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogProps({ isOpen: true, task });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );

    return isMobile ? (
      <Swipeable
        key={task.id}
        onSwipeLeft={() => setDeleteDialogProps({ isOpen: true, task })}
        leftAction={
          <div className="w-full h-full bg-destructive flex items-center justify-center rounded-xl">
            <Trash2 className="h-5 w-5 text-destructive-foreground" />
          </div>
        }
      >
        {cardContent}
      </Swipeable>
    ) : (
      <div key={task.id}>{cardContent}</div>
    );
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
            onClick={() => setAddDialogProps({ isOpen: true })}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Task Dialog */}
      <ResponsiveDialog
        open={addDialogProps.isOpen}
        onOpenChange={(open) =>
          setAddDialogProps({ isOpen: open, initialData: undefined })
        }
        title={addDialogProps.initialData ? "Edit Task" : "Add Task"}
        description="Keep track of household to-dos and maintenance tasks."
      >
        <TaskForm
          initialData={addDialogProps.initialData}
          homeAreas={homeAreas}
          onSubmit={handleTaskSubmit}
          onCancel={() =>
            setAddDialogProps({ isOpen: false, initialData: undefined })
          }
          isSubmitting={createTask.isPending || updateTask.isPending}
        />
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogProps.isOpen}
        onOpenChange={(open) => setDeleteDialogProps({ isOpen: open })}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteDialogProps.task?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleTaskDelete}
        onCancel={() =>
          setDeleteDialogProps({ isOpen: false, task: undefined })
        }
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
              <div className="space-y-2">{activeTasks.map(renderTask)}</div>
            </section>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <CheckSquare className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">No active tasks</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
                  All tasks are completed! Add new tasks to keep track of
                  household chores and maintenance.
                </p>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setAddDialogProps({ isOpen: true })}
                >
                  <Plus className="h-4 w-4" />
                  Add a task
                </Button>
              </CardContent>
            </Card>
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
                  {completedTasks.map(renderTask)}
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
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
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setAddDialogProps({ isOpen: true })}
            >
              <Plus className="h-4 w-4" />
              Add your first task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
