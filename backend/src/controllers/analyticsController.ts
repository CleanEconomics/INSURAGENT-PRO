import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dateRange = '90', teamId, agentId } = req.query;

    const daysAgo = parseInt(dateRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Build filter conditions
    let teamFilter = '';
    let agentFilter = '';
    const params: any[] = [startDate];

    if (teamId) {
      params.push(teamId);
      teamFilter = ` AND u.team_id = $${params.length}`;
    }

    if (agentId) {
      params.push(agentId);
      agentFilter = ` AND o.assigned_to_id = $${params.length}`;
    }

    // Sales Performance Over Time
    const salesPerformanceResult = await pool.query(
      `SELECT
        DATE_TRUNC('week', o.updated_at) as week,
        COUNT(*) FILTER (WHERE o.stage = 'Won') as policies_sold,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'Won'), 0) as revenue
       FROM opportunities o
       LEFT JOIN users u ON o.assigned_to_id = u.id
       WHERE o.updated_at >= $1 ${teamFilter} ${agentFilter}
       GROUP BY week
       ORDER BY week ASC`,
      params
    );

    // Sales Funnel
    const funnelResult = await pool.query(
      `SELECT
        o.stage,
        COUNT(*) as count,
        COALESCE(SUM(o.value), 0) as total_value
       FROM opportunities o
       LEFT JOIN users u ON o.assigned_to_id = u.id
       WHERE o.created_at >= $1 ${teamFilter} ${agentFilter}
       GROUP BY o.stage
       ORDER BY
         CASE o.stage
           WHEN 'New Lead' THEN 1
           WHEN 'Contacted' THEN 2
           WHEN 'Appointment Set' THEN 3
           WHEN 'Quoted' THEN 4
           WHEN 'Issued' THEN 5
           WHEN 'Won' THEN 6
           WHEN 'Lost' THEN 7
         END`,
      params
    );

    // Team Leaderboard
    const leaderboardResult = await pool.query(
      `SELECT
        u.id,
        u.name as agent_name,
        u.avatar_url,
        COUNT(DISTINCT o.id) FILTER (WHERE o.stage = 'Won') as policies_sold,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'Won'), 0) as revenue
       FROM users u
       LEFT JOIN opportunities o ON o.assigned_to_id = u.id AND o.updated_at >= $1
       WHERE u.role IN ('Agent/Producer', 'Sales Manager') ${teamFilter}
       GROUP BY u.id
       ORDER BY revenue DESC
       LIMIT 10`,
      params
    );

    // Revenue by Line of Business
    const lineOfBusinessResult = await pool.query(
      `SELECT
        o.line_of_business,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'Won'), 0) as revenue
       FROM opportunities o
       LEFT JOIN users u ON o.assigned_to_id = u.id
       WHERE o.updated_at >= $1 ${teamFilter} ${agentFilter}
       GROUP BY o.line_of_business`,
      params
    );

    res.json({
      salesPerformance: salesPerformanceResult.rows,
      salesFunnel: funnelResult.rows,
      leaderboard: leaderboardResult.rows,
      revenueByLineOfBusiness: lineOfBusinessResult.rows,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
