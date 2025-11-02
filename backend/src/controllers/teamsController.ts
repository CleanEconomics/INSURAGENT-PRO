import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';

export const getTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as manager_name
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      ORDER BY t.created_at DESC
    `);

    // Get members for each team
    const teams = await Promise.all(
      result.rows.map(async (team) => {
        const membersResult = await pool.query(
          'SELECT id FROM users WHERE team_id = $1',
          [team.id]
        );
        return {
          ...team,
          memberIds: membersResult.rows.map((m) => m.id),
        };
      })
    );

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, managerId } = req.body;

    const result = await pool.query(
      `INSERT INTO teams (name, manager_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, managerId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

export const addTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    await pool.query('UPDATE users SET team_id = $1 WHERE id = $2', [id, memberId]);

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

export const getAgents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        u.role,
        u.team_id,
        COUNT(DISTINCT cl.id) FILTER (WHERE cl.assigned_to_id = u.id) as assigned_leads,
        COUNT(DISTINCT o.id) FILTER (WHERE o.assigned_to_id = u.id AND o.stage = 'Won') as policies_sold,
        COALESCE(SUM(o.value) FILTER (WHERE o.assigned_to_id = u.id AND o.stage = 'Won'), 0) as revenue,
        COUNT(DISTINCT ac.id) FILTER (WHERE ac.recruiter_id = u.id AND ac.stage = 'Retention') as recruits_onboarded,
        CASE
          WHEN COUNT(DISTINCT o.id) FILTER (WHERE o.assigned_to_id = u.id) > 0
          THEN ROUND(
            (COUNT(DISTINCT o.id) FILTER (WHERE o.assigned_to_id = u.id AND o.stage = 'Won')::decimal /
             COUNT(DISTINCT o.id) FILTER (WHERE o.assigned_to_id = u.id)::decimal) * 100,
            1
          )
          ELSE 0
        END as close_rate
      FROM users u
      LEFT JOIN client_leads cl ON cl.assigned_to_id = u.id
      LEFT JOIN opportunities o ON o.assigned_to_id = u.id
      LEFT JOIN agent_candidates ac ON ac.recruiter_id = u.id
      WHERE u.role IN ('Agent/Producer', 'Sales Manager')
      GROUP BY u.id
      ORDER BY revenue DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

export const getAgentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const agentResult = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        u.role,
        u.team_id,
        COUNT(DISTINCT cl.id) as assigned_leads,
        COUNT(DISTINCT o.id) FILTER (WHERE o.stage = 'Won') as policies_sold,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'Won'), 0) as revenue
      FROM users u
      LEFT JOIN client_leads cl ON cl.assigned_to_id = u.id
      LEFT JOIN opportunities o ON o.assigned_to_id = u.id
      WHERE u.id = $1
      GROUP BY u.id`,
      [id]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get active opportunities
    const opportunitiesResult = await pool.query(
      `SELECT o.*, c.name as contact_name
       FROM opportunities o
       LEFT JOIN contacts c ON o.contact_id = c.id
       WHERE o.assigned_to_id = $1 AND o.stage NOT IN ('Won', 'Lost')
       ORDER BY o.close_date ASC`,
      [id]
    );

    // Get recent activities
    const activitiesResult = await pool.query(
      `SELECT * FROM activities
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      ...agentResult.rows[0],
      opportunities: opportunitiesResult.rows,
      activities: activitiesResult.rows,
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to fetch agent details' });
  }
};
