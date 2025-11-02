import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { getAiCopilotResponse, getAiFunctionResponse, getAiLeadMapping } from '../services/geminiService.js';
import pool from '../db/database.js';
import {
  searchKnowledgeHub as searchKnowledge,
  buildCopilotContext,
  logTrainingDataUsage,
} from '../services/copilotKnowledgeService.js';

export const chat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { history, context } = req.body;
    const userId = req.user!.id;
    const userName = req.user!.name;

    // Build enhanced context from training data
    const userMessage = history[history.length - 1]?.parts?.[0]?.text || '';
    const trainingContext = await buildCopilotContext(userId, userMessage);

    // Combine context with training data
    const enhancedContext = context
      ? `${context}\n\n${trainingContext}`
      : trainingContext;

    // Get initial AI response with enhanced context
    const aiResponse = await getAiCopilotResponse(history, enhancedContext);

    // If there are function calls, execute them
    if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
      const functionResults = [];

      for (const call of aiResponse.functionCalls) {
        const result = await executeFunctionCall(call, userId, userName);
        functionResults.push({
          name: call.name,
          response: result,
        });
      }

      // Get final AI response with function results
      const finalResponse = await getAiFunctionResponse(
        [...history, { role: 'model', parts: [{ functionCall: aiResponse.functionCalls[0] }] }],
        functionResults.map((r) => ({
          functionResponse: {
            name: r.name,
            response: r.response,
          },
        }))
      );

      return res.json(finalResponse);
    }

    // Return text response
    res.json(aiResponse);
  } catch (error) {
    console.error('Copilot chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
};

export const mapLeads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { headers } = req.body;

    const mapping = await getAiLeadMapping(headers);
    res.json(mapping);
  } catch (error) {
    console.error('Lead mapping error:', error);
    res.status(500).json({ error: 'Failed to map lead fields' });
  }
};

// Execute function calls from AI
async function executeFunctionCall(call: any, userId: string, userName: string) {
  const { name, args } = call;

  try {
    switch (name) {
      case 'searchKnowledgeHub':
        return await searchKnowledgeHubFunction(args.query, userId);

      case 'createClientLead':
        return await createClientLead(args, userId);

      case 'updateClientLead':
        return await updateClientLead(args, userId, userName);

      case 'createRecruitLead':
        return await createRecruitLead(args);

      case 'updateRecruitLead':
        return await updateRecruitLead(args, userId, userName);

      case 'scheduleAppointment':
        return await scheduleAppointment(args, userId);

      case 'draftEmail':
        return await draftEmail(args);

      case 'createTask':
        return await createTask(args, userId);

      case 'createOpportunity':
        return await createOpportunity(args, userId);

      case 'getContactByName':
        return await getContactByName(args.name, userId);

      case 'getLeadByName':
        return await getLeadByName(args.name, args.leadType, userId);

      case 'createContact':
        return await createContact(args, userId);

      case 'addNoteToLead':
        return await addNoteToLead(args, userId, userName);

      case 'sendSMS':
        return await sendSMS(args, userId, userName);

      case 'sendEmail':
        return await sendEmailFunc(args, userId, userName);

      case 'getUpcomingAppointments':
        return await getUpcomingAppointments(userId, args.days || 7);

      case 'getTasks':
        return await getTasksFunc(userId, args.status, args.priority);

      default:
        return { error: 'Unknown function' };
    }
  } catch (error) {
    console.error(`Function ${name} error:`, error);
    return { error: `Failed to execute ${name}` };
  }
}

// Function implementations
async function searchKnowledgeHubFunction(query: string, userId: string) {
  // Search using integrated knowledge service
  const results = await searchKnowledge(userId, query, 10);

  // Log usage for training data items
  for (const result of results) {
    if (result.sourceType === 'drive_file') {
      try {
        await logTrainingDataUsage(userId, result.id, { query, timestamp: new Date() });
      } catch (error) {
        console.error('Failed to log training data usage:', error);
      }
    }
  }

  return {
    results: results.map(r => ({
      title: r.title,
      content: r.content,
      source: r.source,
      link: r.webViewLink,
      category: r.category,
      tags: r.tags,
      relevance: r.relevanceScore,
    })),
  };
}

async function createClientLead(args: any, userId: string) {
  const { name, email, phone, source } = args;
  const result = await pool.query(
    `INSERT INTO client_leads (name, email, phone, source, assigned_to_id, status, avatar_url, score, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      name,
      email,
      phone,
      source || 'AI Copilot',
      userId,
      'New',
      `https://picsum.photos/seed/${email || name}/40/40`,
      30,
      'Medium',
    ]
  );
  return { lead: result.rows[0] };
}

async function updateClientLead(args: any, userId: string, userName: string) {
  const { leadId, status, notes } = args;

  if (status) {
    await pool.query(
      `UPDATE client_leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, leadId]
    );
  }

  if (notes) {
    await pool.query(
      `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Note', notes, userId, userName, 'client_lead', leadId]
    );
  }

  return { success: true, message: 'Lead updated successfully' };
}

async function createRecruitLead(args: any) {
  const { name, email, phone, roleInterest } = args;
  const result = await pool.query(
    `INSERT INTO recruit_leads (name, email, phone, role_interest, status, avatar_url, score, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      name,
      email,
      phone,
      roleInterest,
      'New',
      `https://picsum.photos/seed/${email || name}/40/40`,
      30,
      'Medium',
    ]
  );
  return { lead: result.rows[0] };
}

async function updateRecruitLead(args: any, userId: string, userName: string) {
  const { leadId, status } = args;
  await pool.query(
    `UPDATE recruit_leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [status, leadId]
  );
  return { success: true, message: 'Recruit lead updated' };
}

async function scheduleAppointment(args: any, userId: string) {
  const { title, contactName, startTime, endTime, type } = args;
  const result = await pool.query(
    `INSERT INTO appointments (title, contact_name, start_time, end_time, type, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, contactName, startTime, endTime, type || 'Meeting', userId]
  );
  return { appointment: result.rows[0] };
}

async function draftEmail(args: any) {
  const { recipient, subject, purpose, tone } = args;

  // This is handled by AI directly - just return the args
  return {
    recipient,
    subject: subject || `Re: ${purpose}`,
    body: `This email will be drafted by the AI based on the purpose: ${purpose}`,
  };
}

async function createTask(args: any, userId: string) {
  const { title, description, dueDate, priority, contactId } = args;
  const result = await pool.query(
    `INSERT INTO tasks (title, description, due_date, status, priority, contact_id, assignee_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description, dueDate, 'To-do', priority || 'Medium', contactId, userId]
  );
  return { task: result.rows[0], success: true, message: `Task "${title}" created successfully` };
}

async function createOpportunity(args: any, userId: string) {
  const { contactId, value, product, lineOfBusiness, closeDate } = args;
  const result = await pool.query(
    `INSERT INTO opportunities (contact_id, stage, value, product, line_of_business, close_date, assigned_to_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [contactId, 'New Lead', value, product, lineOfBusiness || 'Life & Health', closeDate, userId]
  );
  return { opportunity: result.rows[0], success: true, message: `Opportunity for ${product} created` };
}

async function getContactByName(name: string, userId: string) {
  const result = await pool.query(
    `SELECT * FROM contacts
     WHERE name ILIKE $1 AND user_id = $2
     LIMIT 5`,
    [`%${name}%`, userId]
  );
  if (result.rows.length === 0) {
    return { error: `No contacts found matching "${name}"` };
  }
  return { contacts: result.rows };
}

async function getLeadByName(name: string, leadType: string, userId: string) {
  const table = leadType === 'recruit' ? 'recruit_leads' : 'client_leads';
  const result = await pool.query(
    `SELECT * FROM ${table}
     WHERE name ILIKE $1 AND assigned_to_id = $2
     LIMIT 5`,
    [`%${name}%`, userId]
  );
  if (result.rows.length === 0) {
    return { error: `No ${leadType} leads found matching "${name}"` };
  }
  return { leads: result.rows };
}

async function createContact(args: any, userId: string) {
  const { name, email, phone, company, tags } = args;
  const result = await pool.query(
    `INSERT INTO contacts (name, email, phone, company, tags, user_id, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      email,
      phone,
      company,
      tags || [],
      userId,
      `https://picsum.photos/seed/${email || name}/40/40`
    ]
  );
  return { contact: result.rows[0], success: true, message: `Contact ${name} created` };
}

async function addNoteToLead(args: any, userId: string, userName: string) {
  const { leadId, leadType, note } = args;
  const relatedType = leadType === 'recruit' ? 'recruit_lead' : 'client_lead';

  await pool.query(
    `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['Note', note, userId, userName, relatedType, leadId]
  );

  return { success: true, message: 'Note added successfully' };
}

async function sendSMS(args: any, userId: string, userName: string) {
  const { recipientId, recipientType, message } = args;

  // Log the SMS in messages table
  await pool.query(
    `INSERT INTO messages (lead_id, lead_type, type, content, direction, user_id, timestamp, read)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
    [recipientId, recipientType, 'SMS', message, 'outgoing', userId, true]
  );

  // Add activity log
  await pool.query(
    `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['SMS', `SMS sent: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, userId, userName, recipientType, recipientId]
  );

  return {
    success: true,
    message: 'SMS sent successfully. Note: This is a simulated send in development mode.'
  };
}

async function sendEmailFunc(args: any, userId: string, userName: string) {
  const { recipientId, recipientType, subject, body } = args;

  // Log the email in messages table
  await pool.query(
    `INSERT INTO messages (lead_id, lead_type, type, content, subject, direction, user_id, timestamp, read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
    [recipientId, recipientType, 'Email', body, subject, 'outgoing', userId, true]
  );

  // Add activity log
  await pool.query(
    `INSERT INTO activities (type, content, user_id, user_name, related_to_type, related_to_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['Email', `Email sent: "${subject}"`, userId, userName, recipientType, recipientId]
  );

  return {
    success: true,
    message: 'Email sent successfully. Note: This is a simulated send in development mode.'
  };
}

async function getUpcomingAppointments(userId: string, days: number) {
  const result = await pool.query(
    `SELECT * FROM appointments
     WHERE user_id = $1 AND start_time >= NOW() AND start_time <= NOW() + INTERVAL '${days} days'
     ORDER BY start_time ASC
     LIMIT 20`,
    [userId]
  );

  return {
    appointments: result.rows,
    count: result.rows.length,
    message: `Found ${result.rows.length} upcoming appointments in the next ${days} days`
  };
}

async function getTasksFunc(userId: string, status?: string, priority?: string) {
  let query = 'SELECT * FROM tasks WHERE assignee_id = $1';
  const params: any[] = [userId];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (priority) {
    params.push(priority);
    query += ` AND priority = $${params.length}`;
  }

  query += ' ORDER BY due_date ASC LIMIT 50';

  const result = await pool.query(query, params);

  return {
    tasks: result.rows,
    count: result.rows.length,
    message: `Found ${result.rows.length} tasks`
  };
}
