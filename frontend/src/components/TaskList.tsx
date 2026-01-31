import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/use-tasks';

import { TaskDialog } from './TaskDialog';
import { TaskItem } from './TaskItem';

import type { Task, CreateTaskDTO, UpdateTaskDTO } from "@/lib/types";
export function TaskList() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } =
    useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-3xl font-bold">ToDAI</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No tasks yet</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first task
                  </Button>
                </div>
              ) : (
                <>
                  {pendingTasks.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Active Tasks ({pendingTasks.length})
                      </h2>
                      {pendingTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  )}

                  {completedTasks.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Completed ({completedTasks.length})
                      </h2>
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                          onEdit={handleEdit}
                        />
                      ))}
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
