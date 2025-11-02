import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { start, end } = req.query;
    const userId = req.user!.id;

    let query = 'SELECT * FROM appointments WHERE user_id = $1';
    const params: any[] = [userId];

    if (start && end) {
      query += ' AND start_time >= $2 AND end_time <= $3';
      params.push(start, end);
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, contactName, startTime, endTime, type, contactId } = req.body;
    const userId = req.user!.id;

    const result = await pool.query(
      `INSERT INTO appointments (title, contact_name, contact_id, start_time, end_time, type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, contactName, contactId, startTime, endTime, type, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};
