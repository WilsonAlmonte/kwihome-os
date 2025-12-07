import { Plus } from "lucide-react";
import { EmptyState } from "@app/components/ui/empty-state";
import { CheckSquare } from "lucide-react";

interface TasksEmptyProps {
  onAddTask: () => void;
  isFirstTask?: boolean;
  hasActiveTasks?: boolean;
}

/**
 * TasksEmpty Component
 * Displays empty state when no tasks exist or no active tasks
 */
export function TasksEmpty({
  onAddTask,
  isFirstTask = true,
  hasActiveTasks = false,
}: TasksEmptyProps) {
  return (
    <EmptyState
      icon={<CheckSquare className="h-7 w-7" />}
      iconBgColor="bg-primary/10"
      iconColor="text-primary"
      title={
        isFirstTask
          ? "No tasks yet"
          : hasActiveTasks
          ? "No active tasks"
          : "No tasks found"
      }
      description={
        isFirstTask
          ? "Add tasks to stay on top of household chores, maintenance, or anything else that needs to get done."
          : hasActiveTasks
          ? "All tasks are completed! Add new tasks to keep track of household chores and maintenance."
          : "No tasks match the selected filter."
      }
      action={{
        label: isFirstTask ? "Add your first task" : "Add a task",
        onClick: onAddTask,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}
