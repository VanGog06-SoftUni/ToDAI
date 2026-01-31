import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';

import type { FormEvent } from "react";

import type { Task, CreateTaskDTO, UpdateTaskDTO } from "@/lib/types";

type FieldErrors = Partial<Record<"title" | "due_date", string>>;

function getFieldErrorsFromPayload(payload: unknown): FieldErrors | null {
  if (!payload || typeof payload !== "object") return null;
  if (!("fieldErrors" in payload)) return null;

  const fieldErrors = (payload as { fieldErrors?: unknown }).fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return null;

  const candidate = fieldErrors as Partial<Record<string, unknown>>;
  const result: FieldErrors = {};
  if (typeof candidate.title === "string") result.title = candidate.title;
  if (typeof candidate.due_date === "string")
    result.due_date = candidate.due_date;
  return Object.keys(result).length ? result : null;
}

function getTodayIsoLocal(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskDTO | UpdateTaskDTO) => Promise<void>;
  task?: Task | null;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
}: TaskDialogProps) {
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    completed: false,
  });

  const [todayIso, setTodayIso] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setTodayIso(getTodayIsoLocal());

    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        due_date: task.due_date || "",
        priority: task.priority,
        completed: task.completed,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        completed: false,
      });
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(false);
  }, [task, open]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.due_date) {
      errors.due_date = "Due date is required";
    } else {
      const minIso = todayIso || getTodayIsoLocal();
      if (formData.due_date < minIso) {
        errors.due_date = "Due date cannot be in the past";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setFormError(null);
    const clientErrors = validate();
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
      });

      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const maybeFieldErrors = getFieldErrorsFromPayload(error.payload);
        if (maybeFieldErrors) {
          setFieldErrors(maybeFieldErrors);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Failed to save task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title"
                required
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.title}
              />
              {fieldErrors.title ? (
                <p className="text-sm text-destructive">{fieldErrors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add details about your task"
                className="resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                    setFormData({ ...formData, priority: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  min={todayIso || undefined}
                  required
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.due_date}
                />
                {fieldErrors.due_date ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.due_date}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {task
                ? isSubmitting
                  ? "Saving…"
                  : "Update Task"
                : isSubmitting
                  ? "Saving…"
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
