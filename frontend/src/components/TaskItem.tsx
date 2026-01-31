import { format } from 'date-fns';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import type { Task, UpdateTaskDTO } from "@/lib/types";
interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, data: UpdateTaskDTO) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onUpdate, onDelete, onEdit }: TaskItemProps) {
  const priorityStyles: Record<Task["priority"], string> = {
    LOW: "border-blue-200 bg-blue-50 text-blue-700",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
    HIGH: "border-red-200 bg-red-50 text-red-700",
  };

  const dueDate = task.due_date ? new Date(task.due_date) : null;

  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const isOverdue =
    !!dueDate &&
    now !== null &&
    !task.completed &&
    dueDate.getTime() < now - 24 * 60 * 60 * 1000;
  const isDueSoon =
    !!dueDate &&
    now !== null &&
    !task.completed &&
    !isOverdue &&
    dueDate.getTime() < now + 48 * 60 * 60 * 1000;

  const handleCheckboxChange = (checked: boolean) => {
    onUpdate(task.id, { completed: checked });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-card p-4 transition-colors hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring",
        task.completed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3
            className={cn(
              "truncate font-medium text-base",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                priorityStyles[task.priority],
              )}
            >
              {task.priority}
            </span>

            {dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue
                    ? "text-destructive"
                    : isDueSoon
                      ? "text-amber-700"
                      : "text-muted-foreground",
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(dueDate, "MMM dd, yyyy")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="opacity-0 transition-opacity text-destructive hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
