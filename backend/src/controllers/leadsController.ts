import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

// CLIENT LEADS
export const getClientLeads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.query;

    let query = 'SELECT * FROM client_leads WHERE 1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND assigned_to_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Fetch activities for each lead
    const leadsWithActivities = await Promise.all(
      result.rows.map(async (lead) => {
        const activities = await pool.query(
          `SELECT * FROM activities
           WHERE related_to_type = 'client_lead' AND related_to_id = $1
           ORDER BY timestamp DESC`,
          [lead.id]
        );
        return { ...lead, activities: activities.rows };
      })
    );

    res.json(leadsWithActivities);
  } catch (error) {
    console.error('Get client leads error:', error);
    res.status(500).json({ error: 'Failed to fetch client leads' });
  }
};

export const createClientLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, source, assignedToId, status = 'New' } = req.body;

    const result = await pool.query(
      `INSERT INTO client_leads (name, email, phone, source, assigned_to_id, status, avatar_url, score, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        email,
        phone,
        source,
        assignedToId,
        status,
        `https://picsum.photos/seed/${email || name}/40/40`,
        calculateLeadScore(source, status),
        calculatePriority(source, status),
      ]
    );

    const lead = result.rows[0];

    // Create initial activity
    await pool.query(
      `INSERT INTO activities (type, content, user_name, related_to_type, related_to_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['Status Change', 'Lead created.', 'System', 'client_lead', lead.id]
    );

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create client lead error:', error);
    res.status(500).json({ error: 'Failed to create client lead' });
  }
};

export const updateClientLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, source, assignedToId, score, priority } = req.body;

    const result = await pool.query(
      `UPDATE client_leads
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           status = COALESCE($4, status),
           source = COALESCE($5, source),
           assigned_to_id = COALESCE($6, assigned_to_id),
           score = COALESCE($7, score),
           priority = COALESCE($8, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, email, phone, status, source, assignedToId, score, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update client lead error:', error);
    res.status(500).json({ error: 'Failed to update client lead' });
  }
};

export const convertClientLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get lead details
    const leadResult = await pool.query('SELECT * FROM client_leads WHERE id = $1', [id]);

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    // Create contact
    const contactResult = await pool.query(
      `INSERT INTO contacts (name, email, phone, avatar_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lead.name, lead.email, lead.phone, lead.avatar_url, userId]
    );

    const contact = contactResult.rows[0];

    // Create opportunity
    const opportunityResult = await pool.query(
      `INSERT INTO opportunities (contact_id, stage, assigned_to_id, value, product, line_of_business)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [contact.id, 'New Lead', lead.assigned_to_id, 0, 'TBD', 'Life & Health']
    );

    // Update lead status
    await pool.query(
      `UPDATE client_leads SET status = 'Converted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // Add activity
    await pool.query(
      `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Status Change', 'Lead converted to opportunity.', userId, req.user!.name, 'client_lead', id]
    );

    res.json({
      contact: contact,
      opportunity: opportunityResult.rows[0],
    });
  } catch (error) {
    console.error('Convert lead error:', error);
    res.status(500).json({ error: 'Failed to convert lead' });
  }
};

export const addLeadActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, content } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    const result = await pool.query(
      `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [type, content, userId, userName, 'client_lead', id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

// RECRUIT LEADS
export const getRecruitLeads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM recruit_leads WHERE 1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Fetch activities for each lead
    const leadsWithActivities = await Promise.all(
      result.rows.map(async (lead) => {
        const activities = await pool.query(
          `SELECT * FROM activities
           WHERE related_to_type = 'recruit_lead' AND related_to_id = $1
           ORDER BY timestamp DESC`,
          [lead.id]
        );
        return { ...lead, activities: activities.rows };
      })
    );

    res.json(leadsWithActivities);
  } catch (error) {
    console.error('Get recruit leads error:', error);
    res.status(500).json({ error: 'Failed to fetch recruit leads' });
  }
};

export const createRecruitLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, source, roleInterest, status = 'New' } = req.body;

    const result = await pool.query(
      `INSERT INTO recruit_leads (name, email, phone, source, role_interest, status, avatar_url, score, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        email,
        phone,
        source,
        roleInterest,
        status,
        `https://picsum.photos/seed/${email || name}/40/40`,
        calculateLeadScore(source, status),
        calculatePriority(source, status),
      ]
    );

    const lead = result.rows[0];

    // Create initial activity
    await pool.query(
      `INSERT INTO activities (type, content, user_name, related_to_type, related_to_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['Status Change', 'Recruit lead created.', 'System', 'recruit_lead', lead.id]
    );

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create recruit lead error:', error);
    res.status(500).json({ error: 'Failed to create recruit lead' });
  }
};

export const updateRecruitLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, source, roleInterest, score, priority } = req.body;

    const result = await pool.query(
      `UPDATE recruit_leads
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           status = COALESCE($4, status),
           source = COALESCE($5, source),
           role_interest = COALESCE($6, role_interest),
           score = COALESCE($7, score),
           priority = COALESCE($8, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, email, phone, status, source, roleInterest, score, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recruit lead error:', error);
    res.status(500).json({ error: 'Failed to update recruit lead' });
  }
};

export const convertRecruitLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get lead details
    const leadResult = await pool.query('SELECT * FROM recruit_leads WHERE id = $1', [id]);

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    // Create agent candidate
    const candidateResult = await pool.query(
      `INSERT INTO agent_candidates (name, email, phone, avatar_url, stage, recruiter_id, recruiter_name, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [lead.name, lead.email, lead.phone, lead.avatar_url, 'Prospecting', userId, req.user!.name, lead.role_interest]
    );

    // Update lead status
    await pool.query(
      `UPDATE recruit_leads SET status = 'Converted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    res.json(candidateResult.rows[0]);
  } catch (error) {
    console.error('Convert recruit lead error:', error);
    res.status(500).json({ error: 'Failed to convert recruit lead' });
  }
};

// BULK IMPORT
export const bulkImportLeads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leads, leadType } = req.body; // leadType: 'client' or 'recruit'

    const table = leadType === 'client' ? 'client_leads' : 'recruit_leads';
    const imported = [];

    for (const lead of leads) {
      if (leadType === 'client') {
        const result = await pool.query(
          `INSERT INTO client_leads (name, email, phone, source, assigned_to_id, status, avatar_url, score, priority)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            lead.name,
            lead.email,
            lead.phone,
            lead.source || 'Bulk Import',
            lead.assignedTo,
            lead.status || 'New',
            `https://picsum.photos/seed/${lead.email || lead.name}/40/40`,
            calculateLeadScore(lead.source, lead.status || 'New'),
            'Medium',
          ]
        );
        imported.push(result.rows[0]);
      } else {
        const result = await pool.query(
          `INSERT INTO recruit_leads (name, email, phone, source, role_interest, status, avatar_url, score, priority)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            lead.name,
            lead.email,
            lead.phone,
            lead.source || 'Bulk Import',
            lead.roleInterest,
            lead.status || 'New',
            `https://picsum.photos/seed/${lead.email || lead.name}/40/40`,
            calculateLeadScore(lead.source, lead.status || 'New'),
            'Medium',
          ]
        );
        imported.push(result.rows[0]);
      }
    }

    res.status(201).json({ imported: imported.length, leads: imported });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import leads' });
  }
};

// Helper functions
function calculateLeadScore(source: string, status: string): number {
  let score = 0;

  // Source scoring
  if (source === 'Referral') score += 70;
  else if (source === 'Web Form') score += 30;
  else if (source === 'LinkedIn' || source === 'Indeed') score += 50;
  else score += 20;

  // Status scoring
  if (status === 'Working') score += 20;
  else if (status === 'Contacted') score += 10;

  return Math.min(score, 100);
}

function calculatePriority(source: string, status: string): 'Low' | 'Medium' | 'High' {
  const score = calculateLeadScore(source, status);
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}
