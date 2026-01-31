import { format } from 'date-fns';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    LOW: "bg-blue-100 text-blue-800 border-blue-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-red-100 text-red-800 border-red-200",
  };

  const handleCheckboxChange = (checked: boolean) => {
    onUpdate(task.id, { completed: checked });
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200",
        isHovered && "shadow-md",
        task.completed && "opacity-60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleCheckboxChange}
          className="mt-1"
        />

        <div className="flex-1 space-y-1">
          <h3
            className={cn(
              "font-medium text-base",
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
                "text-xs px-2 py-1 rounded-md border",
                priorityColors[task.priority],
              )}
            >
              {task.priority}
            </span>

            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className={cn("transition-opacity", !isHovered && "opacity-0")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className={cn(
              "transition-opacity text-destructive hover:text-destructive",
              !isHovered && "opacity-0",
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
