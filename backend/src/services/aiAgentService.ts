import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import pool from '../db/database.js';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface AIAgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  tone: string;
  taskThresholds: {
    maxFollowUps: number;
  };
  isActive: boolean;
}

export interface AgentTask {
  id: string;
  agentId: string;
  targetId: string;
  targetType: 'client_lead' | 'recruit_lead' | 'contact' | 'policy';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  attemptCount: number;
  lastAttemptAt?: Date;
  context: any;
  result?: any;
}

/**
 * Execute an AI agent task
 */
export async function executeAgentTask(
  agent: AIAgentConfig,
  task: AgentTask,
  targetData: any
): Promise<{ success: boolean; message: string; action?: any }> {
  try {
    const model = (genAI as any).getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `${agent.systemPrompt}

Tone: ${agent.tone}
Context: You are contacting ${targetData.name} (${targetData.email || targetData.phone}).

Previous attempt count: ${task.attemptCount}
Maximum follow-ups allowed: ${agent.taskThresholds.maxFollowUps}

Based on this context, generate an appropriate message to send to this person.
Keep it ${agent.tone.toLowerCase()} and professional. Be concise.`,
    });

    const prompt = buildPromptForAgent(agent, task, targetData);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Determine action based on agent type
    const action = determineAgentAction(agent, targetData);

    return {
      success: true,
      message: responseText,
      action: action,
    };
  } catch (error) {
    console.error('AI Agent execution error:', error);
    return {
      success: false,
      message: 'Failed to execute AI agent task',
    };
  }
}

function buildPromptForAgent(
  agent: AIAgentConfig,
  task: AgentTask,
  targetData: any
): string {
  const isRecruitLead = targetData.lead_type === 'recruit_lead' || targetData.role_interest;

  // Appointment Setter Bot
  if (agent.name.includes('Appointment Setter')) {
    if (task.attemptCount === 0) {
      if (isRecruitLead) {
        return `Generate a friendly initial outreach message to ${targetData.name} about a career opportunity as ${targetData.role_interest || 'an insurance agent'}. They expressed interest in joining our team. Include a question about their availability for a brief call to discuss the opportunity.`;
      } else {
        return `Generate a friendly initial outreach message to ${targetData.name} to book a consultation call. They expressed interest in our insurance services. Include a question about their availability.`;
      }
    } else {
      if (isRecruitLead) {
        return `Generate a follow-up message to ${targetData.name} about the ${targetData.role_interest || 'insurance agent'} position. This is follow-up #${task.attemptCount}. Be persistent but respectful. Mention the benefits of the opportunity and ask again about scheduling time to chat.`;
      } else {
        return `Generate a follow-up message to ${targetData.name}. This is follow-up #${task.attemptCount}. Be persistent but respectful. Reference that we haven't heard back yet and ask again about scheduling time to chat.`;
      }
    }
  }

  // Renewal Specialist Bot
  if (agent.name.includes('Renewal Specialist')) {
    return `Generate a professional message to ${targetData.name} about their upcoming policy renewal (Policy #${targetData.policyNumber || 'XXXXX'}). The policy is up for renewal soon. Offer to schedule a policy review meeting to discuss their coverage and any changes needed.`;
  }

  // Client Onboarding Assistant
  if (agent.name.includes('Onboarding')) {
    if (task.attemptCount === 0) {
      return `Generate a warm welcome message for new client ${targetData.name}. Explain the next steps in the onboarding process and what documents they'll need to provide. Be helpful and reassuring.`;
    } else {
      return `Generate a gentle reminder message to ${targetData.name} about the documents we need for their onboarding. This is reminder #${task.attemptCount}. Be patient and offer to help if they have questions.`;
    }
  }

  // Default prompt
  return `Generate an appropriate message for ${targetData.name} based on your role and instructions.`;
}

function determineAgentAction(agent: AIAgentConfig, targetData: any): any {
  // Appointment Setter - send SMS
  if (agent.name.includes('Appointment Setter')) {
    return {
      type: 'send_sms',
      recipient: targetData.phone,
      recipientId: targetData.id,
    };
  }

  // Renewal Specialist - send Email
  if (agent.name.includes('Renewal Specialist')) {
    return {
      type: 'send_email',
      recipient: targetData.email,
      recipientId: targetData.id,
    };
  }

  // Onboarding - send Email
  if (agent.name.includes('Onboarding')) {
    return {
      type: 'send_email',
      recipient: targetData.email,
      recipientId: targetData.id,
    };
  }

  return { type: 'none' };
}

/**
 * Find tasks for an AI agent to execute
 */
export async function findAgentTasks(agentId: string, limit: number = 10): Promise<any[]> {
  // Appointment Setter Bot - find new client AND recruit leads
  if (agentId === 'agent-1') {
    // Get client leads
    const clientLeads = await pool.query(
      `SELECT cl.*, 'client_lead' as lead_type FROM client_leads cl
       LEFT JOIN agent_tasks at ON at.target_id = cl.id AND at.agent_id = $1
       WHERE cl.status = 'New'
       AND (at.id IS NULL OR (at.status != 'completed' AND at.attempt_count < 3))
       ORDER BY cl.created_at DESC
       LIMIT $2`,
      [agentId, Math.ceil(limit / 2)]
    );

    // Get recruit leads
    const recruitLeads = await pool.query(
      `SELECT rl.*, 'recruit_lead' as lead_type FROM recruit_leads rl
       LEFT JOIN agent_tasks at ON at.target_id = rl.id AND at.agent_id = $1
       WHERE rl.status = 'New'
       AND (at.id IS NULL OR (at.status != 'completed' AND at.attempt_count < 3))
       ORDER BY rl.created_at DESC
       LIMIT $2`,
      [agentId, Math.ceil(limit / 2)]
    );

    // Combine both types and shuffle for variety
    const combined = [...clientLeads.rows, ...recruitLeads.rows];
    return combined.sort(() => Math.random() - 0.5).slice(0, limit);
  }

  // Renewal Specialist Bot - find policies expiring in 90 days
  if (agentId === 'agent-2') {
    const result = await pool.query(
      `SELECT p.*, c.name, c.email, c.phone FROM policies p
       JOIN contacts c ON p.contact_id = c.id
       LEFT JOIN agent_tasks at ON at.target_id = p.id AND at.agent_id = $1
       WHERE p.renewal_date <= NOW() + INTERVAL '90 days'
       AND p.renewal_date >= NOW()
       AND (at.id IS NULL OR (at.status != 'completed' AND at.attempt_count < 2))
       ORDER BY p.renewal_date ASC
       LIMIT $2`,
      [agentId, limit]
    );
    return result.rows;
  }

  // Client Onboarding Assistant - find new contacts without complete onboarding
  if (agentId === 'agent-3') {
    const result = await pool.query(
      `SELECT c.* FROM contacts c
       LEFT JOIN agent_tasks at ON at.target_id = c.id AND at.agent_id = $1
       WHERE c.created_at >= NOW() - INTERVAL '7 days'
       AND (at.id IS NULL OR (at.status != 'completed' AND at.attempt_count < 1))
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [agentId, limit]
    );
    return result.rows;
  }

  return [];
}

/**
 * Create or update agent task
 */
export async function createOrUpdateAgentTask(
  agentId: string,
  targetId: string,
  targetType: string
): Promise<any> {
  // Check if task exists
  const existing = await pool.query(
    `SELECT * FROM agent_tasks WHERE agent_id = $1 AND target_id = $2`,
    [agentId, targetId]
  );

  if (existing.rows.length > 0) {
    // Update existing task
    const result = await pool.query(
      `UPDATE agent_tasks
       SET attempt_count = attempt_count + 1,
           last_attempt_at = NOW(),
           status = 'in_progress'
       WHERE agent_id = $1 AND target_id = $2
       RETURNING *`,
      [agentId, targetId]
    );
    return result.rows[0];
  } else {
    // Create new task
    const result = await pool.query(
      `INSERT INTO agent_tasks (agent_id, target_id, target_type, status, attempt_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [agentId, targetId, targetType, 'pending', 0]
    );
    return result.rows[0];
  }
}

/**
 * Mark task as completed
 */
export async function completeAgentTask(taskId: string, result: any): Promise<void> {
  await pool.query(
    `UPDATE agent_tasks
     SET status = 'completed',
         result = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [JSON.stringify(result), taskId]
  );
}

/**
 * Mark task as failed
 */
export async function failAgentTask(taskId: string, error: string): Promise<void> {
  await pool.query(
    `UPDATE agent_tasks
     SET status = 'failed',
         result = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [JSON.stringify({ error }), taskId]
  );
}

/**
 * Log agent activity
 */
export async function logAgentActivity(
  agentId: string,
  targetId: string,
  targetType: string,
  action: string,
  success: boolean,
  message: string
): Promise<void> {
  await pool.query(
    `INSERT INTO agent_activity_log (agent_id, target_id, target_type, action, success, message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [agentId, targetId, targetType, action, success, message]
  );
}
