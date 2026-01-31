export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  due_date: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  completed?: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  completed?: boolean;
}
