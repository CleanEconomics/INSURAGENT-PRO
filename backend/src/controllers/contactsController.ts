import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

export const getContactById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const contactResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = contactResult.rows[0];

    // Fetch related policies
    const policiesResult = await pool.query('SELECT * FROM policies WHERE contact_id = $1', [id]);

    // Fetch related opportunities
    const opportunitiesResult = await pool.query(
      'SELECT * FROM opportunities WHERE contact_id = $1',
      [id]
    );

    // Fetch activities
    const activitiesResult = await pool.query(
      `SELECT * FROM activities
       WHERE related_to_type = 'contact' AND related_to_id = $1
       ORDER BY timestamp DESC`,
      [id]
    );

    res.json({
      ...contact,
      policies: policiesResult.rows,
      opportunities: opportunitiesResult.rows,
      activities: activitiesResult.rows,
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

export const createContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, tags = [] } = req.body;
    const userId = req.user!.id;

    const result = await pool.query(
      `INSERT INTO contacts (name, email, phone, tags, avatar_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, tags, `https://picsum.photos/seed/${email || name}/40/40`, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

export const updateContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, tags } = req.body;

    const result = await pool.query(
      `UPDATE contacts
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           tags = COALESCE($4, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, email, phone, tags, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const addPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId } = req.params;
    const { policyNumber, product, lineOfBusiness, premium, effectiveDate, expirationDate } =
      req.body;

    const result = await pool.query(
      `INSERT INTO policies (contact_id, policy_number, product, line_of_business, premium, effective_date, expiration_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [contactId, policyNumber, product, lineOfBusiness, premium, effectiveDate, expirationDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add policy error:', error);
    res.status(500).json({ error: 'Failed to add policy' });
  }
};

export const updatePolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { policyId } = req.params;
    const { product, lineOfBusiness, premium, status, effectiveDate, expirationDate } = req.body;

    const result = await pool.query(
      `UPDATE policies
       SET product = COALESCE($1, product),
           line_of_business = COALESCE($2, line_of_business),
           premium = COALESCE($3, premium),
           status = COALESCE($4, status),
           effective_date = COALESCE($5, effective_date),
           expiration_date = COALESCE($6, expiration_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [product, lineOfBusiness, premium, status, effectiveDate, expirationDate, policyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
};

export const deletePolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { policyId } = req.params;

    const result = await pool.query('DELETE FROM policies WHERE id = $1 RETURNING id', [policyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
};
