import { Task } from "@repo/features/tasks/task.entity";
import { Card, CardContent } from "../ui/card";
import { CheckCircle2, Circle, Edit, MapPin, Trash2 } from "lucide-react";
import { Button } from "../forms";
import { Swipeable } from "../ui/swipeable";
import { useMediaQuery } from "@repo/app/hooks/use-media-query";

interface TaskCardProps {
  task: Task;
  openAddDialog: (task?: Task) => void;
  openDeleteDialog: (task: Task) => void;
  handleToggleComplete: (task: Task) => void;
}
export function TaskItemCard({
  task,
  openAddDialog,
  openDeleteDialog,
  handleToggleComplete,
}: TaskCardProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const cardContent = (
    <Card
      className="transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer"
      onClick={() => openAddDialog(task)}
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
                openAddDialog(task);
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
                openDeleteDialog(task);
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
      onSwipeLeft={() => openDeleteDialog(task)}
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
}
