import { Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/hooks/use-tasks';

import { TaskDialog } from './TaskDialog';
import { TaskItem } from './TaskItem';

import type { Task, CreateTaskDTO, UpdateTaskDTO } from "@/lib/types";
export function TaskList() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } =
    useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = (data: CreateTaskDTO) => {
    createTask(data);
  };

  const handleUpdateTask = (data: UpdateTaskDTO) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTask(null);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const filteredTasks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return tasks;

    return tasks.filter((t) => {
      const haystack = `${t.title} ${t.description ?? ""}`.toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [query, tasks]);

  const filteredPending = filteredTasks.filter((t) => !t.completed);
  const filteredCompleted = filteredTasks.filter((t) => t.completed);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">ToDAI</h1>
            <p className="text-sm text-muted-foreground">
              Keep tasks small, visible, and moving.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            New task
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-md border bg-background px-2 py-1">
              Active:{" "}
              <span className="text-foreground">{pendingTasks.length}</span>
            </span>
            <span className="rounded-md border bg-background px-2 py-1">
              Done:{" "}
              <span className="text-foreground">{completedTasks.length}</span>
            </span>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-semibold">Your tasks</CardTitle>
          {query.trim() ? (
            <p className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0
                ? "Create your first task to get started."
                : null}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {tasks.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-10 text-center">
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                  <div className="mt-4">
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first task
                    </Button>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No results for “{query.trim()}”.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredPending.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Active
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {filteredPending.length} task
                          {filteredPending.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {filteredPending.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                            onEdit={handleEdit}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredCompleted.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Completed
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {filteredCompleted.length} task
                          {filteredCompleted.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {filteredCompleted.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                            onEdit={handleEdit}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={(data) =>
          editingTask
            ? handleUpdateTask(data as UpdateTaskDTO)
            : handleCreateTask(data as CreateTaskDTO)
        }
        task={editingTask}
      />
    </div>
  );
}
