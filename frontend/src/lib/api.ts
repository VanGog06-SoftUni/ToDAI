import type { Task, CreateTaskDTO, UpdateTaskDTO } from "./types";

const API_URL = "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? (payload as any).error
        : undefined) || "Request failed";

    throw new ApiError(response.status, message, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks`);
    return handleResponse<Task[]>(response);
  },

  async createTask(task: CreateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  async updateTask(id: number, task: UpdateTaskDTO): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },
};
