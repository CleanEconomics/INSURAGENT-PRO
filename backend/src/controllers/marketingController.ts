import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  sendSMS,
  sendEmail,
  queueMessage,
  getUserQuota,
  getMessagingAnalytics,
} from '../services/messagingService.js';

// Create SMS/Email campaign
export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      type, // 'sms' | 'email'
      subject,
      bodyText,
      bodyHtml,
      targetAudience, // 'all_leads', 'client_leads', 'recruit_leads', 'contacts', 'custom'
      customRecipients, // Array of IDs if custom
      scheduledAt,
    } = req.body;

    // Create campaign record
    const campaign = await pool.query(
      `INSERT INTO marketing_campaigns (
        user_id, name, type, subject, body_text, body_html,
        target_audience, custom_recipients, scheduled_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,
        name,
        type,
        subject,
        bodyText,
        bodyHtml,
        targetAudience,
        customRecipients ? JSON.stringify(customRecipients) : null,
        scheduledAt,
        'draft',
      ]
    );

    res.status(201).json(campaign.rows[0]);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

// Get all campaigns
export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    let query = 'SELECT * FROM marketing_campaigns WHERE user_id = $1';
    const params: any[] = [userId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// Send campaign
export const sendCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { campaignId } = req.params;

    // Get campaign
    const campaignResult = await pool.query(
      'SELECT * FROM marketing_campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Get recipients based on target audience
    let recipients: any[] = [];

    switch (campaign.target_audience) {
      case 'all_leads':
        const allLeads = await pool.query(
          `SELECT id, name, email, phone, 'client_lead' as type FROM client_leads WHERE assigned_to_id = $1
           UNION ALL
           SELECT id, name, email, phone, 'recruit_lead' as type FROM recruit_leads WHERE assigned_to_id = $1`,
          [userId]
        );
        recipients = allLeads.rows;
        break;

      case 'client_leads':
        const clientLeads = await pool.query(
          'SELECT id, name, email, phone FROM client_leads WHERE assigned_to_id = $1',
          [userId]
        );
        recipients = clientLeads.rows.map(r => ({ ...r, type: 'client_lead' }));
        break;

      case 'recruit_leads':
        const recruitLeads = await pool.query(
          'SELECT id, name, email, phone FROM recruit_leads WHERE assigned_to_id = $1',
          [userId]
        );
        recipients = recruitLeads.rows.map(r => ({ ...r, type: 'recruit_lead' }));
        break;

      case 'contacts':
        const contacts = await pool.query(
          'SELECT id, name, email, phone FROM contacts WHERE user_id = $1',
          [userId]
        );
        recipients = contacts.rows.map(r => ({ ...r, type: 'contact' }));
        break;

      case 'custom':
        // Custom recipients from campaign.custom_recipients
        if (campaign.custom_recipients) {
          const ids = campaign.custom_recipients;
          // Get from all sources
          const custom = await pool.query(
            `SELECT id, name, email, phone, 'client_lead' as type FROM client_leads WHERE id = ANY($1)
             UNION ALL
             SELECT id, name, email, phone, 'recruit_lead' as type FROM recruit_leads WHERE id = ANY($1)
             UNION ALL
             SELECT id, name, email, phone, 'contact' as type FROM contacts WHERE id = ANY($1)`,
            [ids]
          );
          recipients = custom.rows;
        }
        break;
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found for campaign' });
    }

    // Queue messages for all recipients
    let queued = 0;
    for (const recipient of recipients) {
      const recipientData = campaign.type === 'sms'
        ? { phone: recipient.phone }
        : { email: recipient.email };

      await queueMessage(
        userId,
        campaign.type,
        recipientData,
        {
          subject: campaign.subject,
          body: campaign.body_text || campaign.body_html,
        },
        {
          relatedToType: recipient.type,
          relatedToId: recipient.id,
          scheduledAt: campaign.scheduled_at,
          priority: 7, // Campaign messages get higher priority
        }
      );
      queued++;
    }

    // Update campaign status
    await pool.query(
      `UPDATE marketing_campaigns
       SET status = $1, sent_at = NOW(), recipient_count = $2, updated_at = NOW()
       WHERE id = $3`,
      ['sending', queued, campaignId]
    );

    res.json({
      success: true,
      campaignId,
      recipientsQueued: queued,
      message: `Campaign queued for ${queued} recipients`,
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
};

// Get campaign stats
export const getCampaignStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { campaignId } = req.params;

    // Get campaign
    const campaignResult = await pool.query(
      'SELECT * FROM marketing_campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Get message stats
    let stats;
    if (campaign.type === 'sms') {
      stats = await pool.query(
        `SELECT
          COUNT(*) as total_sent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(total_cost) as total_cost
         FROM sms_messages
         WHERE created_at >= $1
         AND user_id = $2`,
        [campaign.sent_at || campaign.created_at, userId]
      );
    } else {
      stats = await pool.query(
        `SELECT
          COUNT(*) as total_sent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
          SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
         FROM email_messages
         WHERE created_at >= $1
         AND user_id = $2`,
        [campaign.sent_at || campaign.created_at, userId]
      );
    }

    const statsData = stats.rows[0];

    // Calculate rates
    const deliveryRate = statsData.total_sent > 0
      ? ((statsData.delivered / statsData.total_sent) * 100).toFixed(2)
      : '0.00';

    const openRate = campaign.type === 'email' && statsData.total_sent > 0
      ? ((statsData.opened / statsData.total_sent) * 100).toFixed(2)
      : null;

    const clickRate = campaign.type === 'email' && statsData.total_sent > 0
      ? ((statsData.clicked / statsData.total_sent) * 100).toFixed(2)
      : null;

    res.json({
      campaign: campaign,
      stats: {
        ...statsData,
        delivery_rate: `${deliveryRate}%`,
        open_rate: openRate ? `${openRate}%` : null,
        click_rate: clickRate ? `${clickRate}%` : null,
      },
    });
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign stats' });
  }
};

// Get message templates
export const getTemplates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, category } = req.query;

    let query = 'SELECT * FROM message_templates WHERE user_id = $1 AND is_active = true';
    const params: any[] = [userId];

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY usage_count DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Create message template
export const createTemplate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, subject, body, variables, category } = req.body;

    const result = await pool.query(
      `INSERT INTO message_templates (user_id, name, type, subject, body, variables, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, type, subject, body, variables ? JSON.stringify(variables) : null, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Get messaging analytics
export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { days = 30 } = req.query;

    const analytics = await getMessagingAnalytics(userId, Number(days));
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get user quota
export const getQuota = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const quota = await getUserQuota(userId);
    res.json(quota);
  } catch (error) {
    console.error('Get quota error:', error);
    res.status(500).json({ error: 'Failed to fetch quota' });
  }
};

// Get message threads (conversations)
export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status = 'active' } = req.query;

    const result = await pool.query(
      `SELECT * FROM message_threads
       WHERE user_id = $1 AND status = $2
       ORDER BY last_message_at DESC
       LIMIT 50`,
      [userId, status]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Failed to fetch message threads' });
  }
};

// Get thread messages
export const getThreadMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;

    // Get thread
    const thread = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1 AND user_id = $2',
      [threadId, userId]
    );

    if (thread.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const threadData = thread.rows[0];

    // Get all messages for this thread (both SMS and email)
    const smsMessages = await pool.query(
      `SELECT
        id, 'sms' as message_type, from_number as from_addr, to_number as to_addr,
        message as content, null as subject, direction, status, created_at
       FROM sms_messages
       WHERE (from_number = $1 OR to_number = $1)
       ORDER BY created_at ASC`,
      [threadData.contact_phone]
    );

    const emailMessages = await pool.query(
      `SELECT
        id, 'email' as message_type, from_email as from_addr, to_email as to_addr,
        body_text as content, subject, direction, status, created_at
       FROM email_messages
       WHERE (from_email = $1 OR to_email = $1)
       ORDER BY created_at ASC`,
      [threadData.contact_email]
    );

    // Combine and sort by time
    const allMessages = [...smsMessages.rows, ...emailMessages.rows]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    res.json({
      thread: threadData,
      messages: allMessages,
    });
  } catch (error) {
    console.error('Get thread messages error:', error);
    res.status(500).json({ error: 'Failed to fetch thread messages' });
  }
};

// Send quick message (not part of campaign)
export const sendQuickMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      type, // 'sms' | 'email'
      recipientId,
      recipientType, // 'client_lead' | 'recruit_lead' | 'contact'
      subject,
      message,
    } = req.body;

    // Get recipient details
    let recipient;
    switch (recipientType) {
      case 'client_lead':
        const cl = await pool.query('SELECT * FROM client_leads WHERE id = $1', [recipientId]);
        recipient = cl.rows[0];
        break;
      case 'recruit_lead':
        const rl = await pool.query('SELECT * FROM recruit_leads WHERE id = $1', [recipientId]);
        recipient = rl.rows[0];
        break;
      case 'contact':
        const c = await pool.query('SELECT * FROM contacts WHERE id = $1', [recipientId]);
        recipient = c.rows[0];
        break;
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    let result;
    if (type === 'sms') {
      result = await sendSMS({
        userId,
        toNumber: recipient.phone,
        message,
        relatedToType: recipientType,
        relatedToId: recipientId,
      });
    } else {
      result = await sendEmail({
        userId,
        toEmail: recipient.email,
        subject: subject || 'Message from InsurAgent Pro',
        bodyText: message,
        relatedToType: recipientType,
        relatedToId: recipientId,
      });
    }

    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Send quick message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
