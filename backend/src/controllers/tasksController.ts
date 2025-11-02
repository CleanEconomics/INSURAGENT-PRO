import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assigneeId, status, search } = req.query;
    const userId = req.user!.id;

    let query = `
      SELECT t.*, c.name as contact_name
      FROM tasks t
      LEFT JOIN contacts c ON t.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (assigneeId) {
      params.push(assigneeId);
      query += ` AND t.assignee_id = $${params.length}`;
    } else {
      // Default to current user's tasks
      params.push(userId);
      query += ` AND t.assignee_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }

    query += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, dueDate, status, priority, contactId, assigneeId, reminder } =
      req.body;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, status, priority, contact_id, assignee_id, reminder)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description,
        dueDate,
        status || 'To-do',
        priority || 'Medium',
        contactId,
        assigneeId,
        reminder,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status, priority } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           status = COALESCE($4, status),
           priority = COALESCE($5, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, dueDate, status, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};
