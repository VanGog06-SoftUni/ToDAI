import { NextFunction, Request, Response } from 'express';

import pool from '../database/db';
import { CreateTaskDTO, UpdateTaskDTO } from '../types/task';

type FieldErrors = Partial<Record<"title" | "due_date", string>>;

function getTodayIsoLocal(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [y, m, d] = value.split("-").map((n) => Number(n));
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return false;
  }
  if (m < 1 || m > 12) return false;

  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      description,
      due_date,
      priority = "MEDIUM",
      completed = false,
    }: CreateTaskDTO = req.body;

    const fieldErrors: FieldErrors = {};

    if (!title || title.trim() === "") {
      fieldErrors.title = "Title is required";
    }

    if (!due_date || due_date.trim() === "") {
      fieldErrors.due_date = "Due date is required";
    } else if (!isValidIsoDateString(due_date)) {
      fieldErrors.due_date = "Due date must be a valid date (YYYY-MM-DD)";
    } else {
      const todayIso = getTodayIsoLocal();
      if (due_date < todayIso) {
        fieldErrors.due_date = "Due date cannot be in the past";
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ error: "Validation failed", fieldErrors });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, completed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [title, description || null, due_date, priority, completed],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, priority, completed }: UpdateTaskDTO =
      req.body;

    const fieldErrors: FieldErrors = {};

    if (title !== undefined && title.trim() === "") {
      fieldErrors.title = "Title is required";
    }

    if (due_date !== undefined) {
      if (due_date === null || due_date.trim() === "") {
        fieldErrors.due_date = "Due date is required";
      } else if (!isValidIsoDateString(due_date)) {
        fieldErrors.due_date = "Due date must be a valid date (YYYY-MM-DD)";
      } else {
        const todayIso = getTodayIsoLocal();
        if (due_date < todayIso) {
          fieldErrors.due_date = "Due date cannot be in the past";
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ error: "Validation failed", fieldErrors });
    }

    // Build dynamic query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      values.push(due_date);
      paramCount++;
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
