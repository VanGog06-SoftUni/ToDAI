import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { ApiError, taskApi } from '@/lib/api';

import type { Task, CreateTaskDTO, UpdateTaskDTO } from "@/lib/types";
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to fetch tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskDTO) => {
    // Optimistic update - add task immediately
    const tempId = Date.now();
    const optimisticTask: Task = {
      id: tempId,
      ...taskData,
      description: taskData.description || null,
      due_date: taskData.due_date || null,
      priority: taskData.priority || "MEDIUM",
      completed: taskData.completed || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const newTask = await taskApi.createTask(taskData);
      // Replace optimistic task with real task from server
      setTasks((prev) => prev.map((t) => (t.id === tempId ? newTask : t)));
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      // Rollback on error
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to create task",
      });
    }
  };

  const updateTask = async (id: number, taskData: UpdateTaskDTO) => {
    // Store original task for rollback
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...taskData, updated_at: new Date().toISOString() }
          : t,
      ),
    );

    try {
      const updatedTask = await taskApi.updateTask(id, taskData);
      // Update with server response
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      // Rollback on error
      setTasks((prev) => prev.map((t) => (t.id === id ? originalTask : t)));
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update task",
      });
    }
  };

  const deleteTask = async (id: number) => {
    // Store original task for rollback
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return;

    // Optimistic update - remove immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await taskApi.deleteTask(id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      // Rollback on error - restore task in original position
      setTasks((prev) => {
        const index = tasks.findIndex((t) => t.id === id);
        const newTasks = [...prev];
        newTasks.splice(index, 0, originalTask);
        return newTasks;
      });
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete task",
      });
    }
  };

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
