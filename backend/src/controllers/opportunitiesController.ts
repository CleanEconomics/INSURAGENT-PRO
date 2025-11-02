import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lineOfBusiness, assignedTo } = req.query;

    let query = `
      SELECT o.*, c.name as contact_name, c.email as contact_email,
             c.phone as contact_phone, c.avatar_url as contact_avatar_url, c.tags as contact_tags
      FROM opportunities o
      LEFT JOIN contacts c ON o.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (lineOfBusiness) {
      params.push(lineOfBusiness);
      query += ` AND o.line_of_business = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND o.assigned_to_id = $${params.length}`;
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);

    // Format the results to match frontend type
    const opportunities = result.rows.map((row) => ({
      id: row.id,
      contact: {
        id: row.contact_id,
        name: row.contact_name,
        email: row.contact_email,
        phone: row.contact_phone,
        avatarUrl: row.contact_avatar_url,
        tags: row.contact_tags || [],
      },
      stage: row.stage,
      value: parseFloat(row.value),
      product: row.product,
      lineOfBusiness: row.line_of_business,
      closeDate: row.close_date,
      assignedToId: row.assigned_to_id,
    }));

    res.json(opportunities);
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

export const updateOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, value, product, lineOfBusiness, closeDate } = req.body;

    const result = await pool.query(
      `UPDATE opportunities
       SET stage = COALESCE($1, stage),
           value = COALESCE($2, value),
           product = COALESCE($3, product),
           line_of_business = COALESCE($4, line_of_business),
           close_date = COALESCE($5, close_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [stage, value, product, lineOfBusiness, closeDate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};
