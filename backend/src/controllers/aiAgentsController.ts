import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  executeAgentTask,
  findAgentTasks,
  createOrUpdateAgentTask,
  completeAgentTask,
  failAgentTask,
  logAgentActivity,
  AIAgentConfig,
} from '../services/aiAgentService.js';

// Get all AI agents
export const getAgents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_agents ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get AI agents error:', error);
    res.status(500).json({ error: 'Failed to fetch AI agents' });
  }
};

// Get single AI agent
export const getAgent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const result = await pool.query(
      'SELECT * FROM ai_agents WHERE id = $1',
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get AI agent error:', error);
    res.status(500).json({ error: 'Failed to fetch AI agent' });
  }
};

// Update AI agent configuration
export const updateAgent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { name, description, systemPrompt, tone, taskThresholds, isActive } = req.body;

    const result = await pool.query(
      `UPDATE ai_agents
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           system_prompt = COALESCE($3, system_prompt),
           tone = COALESCE($4, tone),
           task_thresholds = COALESCE($5, task_thresholds),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, systemPrompt, tone, taskThresholds, isActive, agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update AI agent error:', error);
    res.status(500).json({ error: 'Failed to update AI agent' });
  }
};

// Execute agent tasks manually
export const executeAgent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const userId = req.user!.id;

    // Get agent configuration
    const agentResult = await pool.query(
      'SELECT * FROM ai_agents WHERE id = $1 AND is_active = true',
      [agentId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found or inactive' });
    }

    const agent: AIAgentConfig = {
      id: agentResult.rows[0].id,
      name: agentResult.rows[0].name,
      systemPrompt: agentResult.rows[0].system_prompt,
      tone: agentResult.rows[0].tone,
      taskThresholds: agentResult.rows[0].task_thresholds,
      isActive: agentResult.rows[0].is_active,
    };

    // Find tasks for this agent
    const targets = await findAgentTasks(agentId, 5);

    if (targets.length === 0) {
      return res.json({
        success: true,
        message: 'No tasks found for this agent',
        tasksExecuted: 0,
      });
    }

    const results = [];

    // Execute tasks for each target
    for (const target of targets) {
      try {
        // Create or update task record
        const task = await createOrUpdateAgentTask(
          agentId,
          target.id,
          target.policy_number ? 'policy' : target.role_interest ? 'recruit_lead' : target.email ? 'contact' : 'client_lead'
        );

        // Execute the AI agent task
        const executionResult = await executeAgentTask(agent, task, target);

        if (executionResult.success) {
          // Log the activity
          await logAgentActivity(
            agentId,
            target.id,
            task.target_type,
            executionResult.action?.type || 'message_generated',
            true,
            executionResult.message
          );

          // Mark task as completed
          await completeAgentTask(task.id, executionResult);

          results.push({
            targetId: target.id,
            targetName: target.name,
            success: true,
            message: executionResult.message,
            action: executionResult.action,
          });
        } else {
          await failAgentTask(task.id, executionResult.message);
          results.push({
            targetId: target.id,
            targetName: target.name,
            success: false,
            error: executionResult.message,
          });
        }
      } catch (taskError) {
        console.error('Task execution error:', taskError);
        results.push({
          targetId: target.id,
          targetName: target.name,
          success: false,
          error: 'Task execution failed',
        });
      }
    }

    res.json({
      success: true,
      agentName: agent.name,
      tasksExecuted: results.length,
      results: results,
    });
  } catch (error) {
    console.error('Execute agent error:', error);
    res.status(500).json({ error: 'Failed to execute agent tasks' });
  }
};

// Get agent activity log
export const getAgentActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM agent_activity_log
       WHERE agent_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [agentId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM agent_activity_log WHERE agent_id = $1',
      [agentId]
    );

    res.json({
      activities: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Get agent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch agent activity' });
  }
};

// Get agent metrics/stats
export const getAgentMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { period = '30' } = req.query; // days

    // Get task statistics
    const tasksResult = await pool.query(
      `SELECT
         COUNT(*) as total_tasks,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_tasks,
         AVG(attempt_count) as avg_attempts
       FROM agent_tasks
       WHERE agent_id = $1
       AND created_at >= NOW() - INTERVAL '${period} days'`,
      [agentId]
    );

    // Get activity statistics
    const activityResult = await pool.query(
      `SELECT
         action,
         COUNT(*) as count,
         SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success_count
       FROM agent_activity_log
       WHERE agent_id = $1
       AND created_at >= NOW() - INTERVAL '${period} days'
       GROUP BY action`,
      [agentId]
    );

    // Get recent activity
    const recentResult = await pool.query(
      `SELECT * FROM agent_activity_log
       WHERE agent_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [agentId]
    );

    res.json({
      period: `${period} days`,
      tasks: tasksResult.rows[0],
      activityByType: activityResult.rows,
      recentActivity: recentResult.rows,
    });
  } catch (error) {
    console.error('Get agent metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch agent metrics' });
  }
};

// Create automation workflow
export const createAutomation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, trigger, actions, isActive = true } = req.body;

    const result = await pool.query(
      `INSERT INTO automation_workflows (name, trigger, actions, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, trigger, JSON.stringify(actions), isActive]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
};

// Get all automations
export const getAutomations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM automation_workflows ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get automations error:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
};

// Update automation
export const updateAutomation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { automationId } = req.params;
    const { name, trigger, actions, isActive } = req.body;

    const result = await pool.query(
      `UPDATE automation_workflows
       SET name = COALESCE($1, name),
           trigger = COALESCE($2, trigger),
           actions = COALESCE($3, actions),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, trigger, actions ? JSON.stringify(actions) : null, isActive, automationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
};

// Delete automation
export const deleteAutomation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { automationId } = req.params;

    const result = await pool.query(
      'DELETE FROM automation_workflows WHERE id = $1 RETURNING *',
      [automationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json({ success: true, message: 'Automation deleted' });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
};
