import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, assignedTo } = req.query;

    let query = `
      SELECT t.*, c.name as contact_name, c.email as contact_email,
             c.phone as contact_phone, c.avatar_url as contact_avatar
      FROM service_tickets t
      LEFT JOIN contacts c ON t.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND t.priority = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND t.assigned_to_id = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(
      `SELECT t.*, c.name as contact_name, c.email as contact_email,
              c.phone as contact_phone, c.avatar_url as contact_avatar
       FROM service_tickets t
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get messages
    const messagesResult = await pool.query(
      'SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY timestamp ASC',
      [id]
    );

    res.json({
      ...ticketResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId, subject, category, priority, initialMessage } = req.body;
    const userId = req.user!.id;

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO service_tickets (ticket_number, contact_id, subject, category, priority, assigned_to_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [ticketNumber, contactId, subject, category, priority || 'Medium', userId, 'Open']
    );

    const ticket = result.rows[0];

    // Add initial message if provided
    if (initialMessage) {
      await pool.query(
        `INSERT INTO ticket_messages (ticket_id, sender, content)
         VALUES ($1, $2, $3)`,
        [ticket.id, 'Client', initialMessage]
      );
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const updateTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const result = await pool.query(
      `UPDATE service_tickets
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to_id = COALESCE($3, assigned_to_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, priority, assignedToId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const addTicketMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isInternalNote = false } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const result = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender, agent_id, agent_name, content, is_internal_note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, 'Agent', userId, userName, content, isInternalNote]
    );

    // Update ticket timestamp
    await pool.query(
      'UPDATE service_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};
