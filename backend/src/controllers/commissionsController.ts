import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

// Get commission statements for a user
export const getCommissionStatements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { agentId, startDate, endDate } = req.query;

    // If user is not an admin/manager, they can only see their own commissions
    const targetUserId = req.user?.role === 'Sales Manager' && agentId ? agentId : userId;

    let query = `
      SELECT
        cs.*,
        u.name as agent_name,
        u.avatar_url as agent_avatar
      FROM commission_statements cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.user_id = $1
    `;
    const params: any[] = [targetUserId];

    if (startDate) {
      params.push(startDate);
      query += ` AND cs.period_start >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND cs.period_end <= $${params.length}`;
    }

    query += ' ORDER BY cs.period_start DESC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching commission statements:', error);
    res.status(500).json({ error: 'Failed to fetch commission statements' });
  }
};

// Get commission details for a specific statement
export const getCommissionDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { statementId } = req.params;
    const userId = req.user?.id;

    // First check if user has access to this statement
    const statementResult = await pool.query(
      'SELECT * FROM commission_statements WHERE id = $1',
      [statementId]
    );

    if (statementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Commission statement not found' });
    }

    const statement = statementResult.rows[0];

    // Check access - users can only see their own, unless they're a manager
    if (statement.user_id !== userId && req.user?.role !== 'Sales Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get detailed breakdown
    const detailsResult = await pool.query(
      `
      SELECT
        cd.*,
        p.policy_number,
        p.product,
        p.line_of_business,
        c.name as client_name
      FROM commission_details cd
      LEFT JOIN policies p ON cd.policy_id = p.id
      LEFT JOIN contacts c ON p.contact_id = c.id
      WHERE cd.statement_id = $1
      ORDER BY cd.transaction_date DESC
      `,
      [statementId]
    );

    res.json({
      statement,
      details: detailsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching commission details:', error);
    res.status(500).json({ error: 'Failed to fetch commission details' });
  }
};

// Get commission summary/overview
export const getCommissionSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { agentId, period } = req.query; // period could be 'current', 'ytd', 'last-year'

    const targetUserId = req.user?.role === 'Sales Manager' && agentId ? agentId : userId;

    // Calculate date ranges based on period
    let startDate: string;
    const now = new Date();
    const currentYear = now.getFullYear();

    switch (period) {
      case 'ytd':
        startDate = `${currentYear}-01-01`;
        break;
      case 'last-year':
        startDate = `${currentYear - 1}-01-01`;
        break;
      case 'current':
      default:
        // Current month
        startDate = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        break;
    }

    // Get total earned, paid, and pending
    const summaryResult = await pool.query(
      `
      SELECT
        SUM(total_commission) as total_earned,
        SUM(CASE WHEN status = 'Paid' THEN total_commission ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'Pending' THEN total_commission ELSE 0 END) as total_pending,
        COUNT(*) as statement_count
      FROM commission_statements
      WHERE user_id = $1 AND period_start >= $2
      `,
      [targetUserId, startDate]
    );

    // Get breakdown by product line
    const lineOfBusinessResult = await pool.query(
      `
      SELECT
        p.line_of_business,
        SUM(cd.commission_amount) as total_commission,
        COUNT(DISTINCT cd.policy_id) as policy_count
      FROM commission_details cd
      JOIN commission_statements cs ON cd.statement_id = cs.id
      JOIN policies p ON cd.policy_id = p.id
      WHERE cs.user_id = $1 AND cs.period_start >= $2
      GROUP BY p.line_of_business
      ORDER BY total_commission DESC
      `,
      [targetUserId, startDate]
    );

    // Get recent transactions
    const recentResult = await pool.query(
      `
      SELECT
        cd.*,
        p.policy_number,
        p.product,
        c.name as client_name,
        cs.period_start,
        cs.period_end
      FROM commission_details cd
      JOIN commission_statements cs ON cd.statement_id = cs.id
      JOIN policies p ON cd.policy_id = p.id
      JOIN contacts c ON p.contact_id = c.id
      WHERE cs.user_id = $1 AND cs.period_start >= $2
      ORDER BY cd.transaction_date DESC
      LIMIT 10
      `,
      [targetUserId, startDate]
    );

    res.json({
      summary: summaryResult.rows[0],
      byLineOfBusiness: lineOfBusinessResult.rows,
      recentTransactions: recentResult.rows,
    });
  } catch (error) {
    console.error('Error fetching commission summary:', error);
    res.status(500).json({ error: 'Failed to fetch commission summary' });
  }
};

// Create a new commission statement (admin/system use)
export const createCommissionStatement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only managers can create commission statements
    if (req.user?.role !== 'Sales Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId, periodStart, periodEnd, totalCommission, status = 'Pending' } = req.body;

    const result = await pool.query(
      `
      INSERT INTO commission_statements (user_id, period_start, period_end, total_commission, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [userId, periodStart, periodEnd, totalCommission, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating commission statement:', error);
    res.status(500).json({ error: 'Failed to create commission statement' });
  }
};

// Update commission statement status
export const updateCommissionStatement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only managers can update commission statements
    if (req.user?.role !== 'Sales Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { statementId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE commission_statements
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [status, statementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commission statement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating commission statement:', error);
    res.status(500).json({ error: 'Failed to update commission statement' });
  }
};
