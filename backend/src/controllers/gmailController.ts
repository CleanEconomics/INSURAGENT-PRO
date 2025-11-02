import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  syncEmails,
  getEmailById,
  getThread,
  sendEmail,
  replyToEmail,
  forwardEmail,
  searchEmails,
  markAsRead,
  markAsUnread,
  archiveEmail,
  trashEmail,
  getUserProfile,
} from '../services/gmailService.js';
import { createOAuth2Client, setCredentials } from '../services/googleDriveService.js';

/**
 * Get user's OAuth client
 */
async function getUserOAuthClient(userId: string) {
  const result = await pool.query(
    'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Google account not connected');
  }

  const oauth2Client = createOAuth2Client();
  setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);
  return oauth2Client;
}

/**
 * Sync emails from Gmail
 */
export const syncGmailEmails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { maxResults = 50, query } = req.query;

    const oauth2Client = await getUserOAuthClient(userId);

    // Start sync
    const syncStart = new Date();
    await pool.query(
      `INSERT INTO google_sync_history (user_id, sync_type, sync_direction, status, started_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'gmail', 'pull', 'in_progress', syncStart]
    );

    // Fetch emails from Gmail
    const emails = await syncEmails(oauth2Client, Number(maxResults), query as string);

    // Save to database
    let syncedCount = 0;
    let failedCount = 0;

    for (const email of emails) {
      try {
        // Save email
        const emailResult = await pool.query(
          `INSERT INTO synced_emails (
            user_id, gmail_message_id, gmail_thread_id, subject, from_email, from_name,
            to_emails, cc_emails, message_date, snippet, body_text, body_html,
            label_ids, has_attachments, attachment_count, is_read
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (user_id, gmail_message_id)
          DO UPDATE SET
            subject = EXCLUDED.subject,
            snippet = EXCLUDED.snippet,
            label_ids = EXCLUDED.label_ids,
            is_read = EXCLUDED.is_read,
            synced_at = CURRENT_TIMESTAMP
          RETURNING id`,
          [
            userId,
            email.id,
            email.threadId,
            email.subject,
            email.from.match(/<(.+)>/)?.[1] || email.from,
            email.from.match(/(.+) </)?.[1] || null,
            email.to,
            email.cc || [],
            new Date(email.date),
            email.snippet,
            email.body,
            email.bodyHtml,
            email.labelIds || [],
            email.attachments && email.attachments.length > 0,
            email.attachments?.length || 0,
            !email.labelIds?.includes('UNREAD'),
          ]
        );

        // Save attachments if any
        if (email.attachments && email.attachments.length > 0) {
          for (const attachment of email.attachments) {
            await pool.query(
              `INSERT INTO email_attachments (synced_email_id, gmail_attachment_id, filename, mime_type, file_size)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT DO NOTHING`,
              [emailResult.rows[0].id, attachment.attachmentId, attachment.filename, attachment.mimeType, attachment.size]
            );
          }
        }

        // Update or create thread
        await pool.query(
          `INSERT INTO email_threads (user_id, gmail_thread_id, subject, last_message_date, message_count)
           VALUES ($1, $2, $3, $4, 1)
           ON CONFLICT (user_id, gmail_thread_id)
           DO UPDATE SET
             last_message_date = EXCLUDED.last_message_date,
             message_count = email_threads.message_count + 1,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, email.threadId, email.subject, new Date(email.date)]
        );

        syncedCount++;
      } catch (error) {
        console.error('Failed to save email:', error);
        failedCount++;
      }
    }

    // Update sync history
    const syncEnd = new Date();
    await pool.query(
      `UPDATE google_sync_history
       SET status = $1, items_synced = $2, items_failed = $3, completed_at = $4,
           duration_seconds = EXTRACT(EPOCH FROM ($4 - started_at))
       WHERE user_id = $5 AND sync_type = 'gmail' AND started_at = $6`,
      ['success', syncedCount, failedCount, syncEnd, userId, syncStart]
    );

    // Update sync settings
    await pool.query(
      `INSERT INTO google_sync_settings (user_id, gmail_sync_enabled, gmail_last_sync)
       VALUES ($1, true, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET gmail_last_sync = EXCLUDED.gmail_last_sync`,
      [userId, syncEnd]
    );

    res.json({
      success: true,
      synced: syncedCount,
      failed: failedCount,
      total: emails.length,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
};

/**
 * Get synced emails
 */
export const getEmails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 50, offset = 0, unreadOnly, search, relatedTo } = req.query;

    let query = 'SELECT * FROM synced_emails WHERE user_id = $1';
    const params: any[] = [userId];

    if (unreadOnly === 'true') {
      query += ' AND is_read = false';
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (subject ILIKE $${params.length} OR body_text ILIKE $${params.length} OR from_email ILIKE $${params.length})`;
    }

    if (relatedTo) {
      params.push(relatedTo);
      query += ` AND related_to_id = $${params.length}`;
    }

    query += ' ORDER BY message_date DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

/**
 * Get email by ID
 */
export const getEmailDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*,
        (SELECT json_agg(row_to_json(a)) FROM email_attachments a WHERE a.synced_email_id = e.id) as attachments
       FROM synced_emails e
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get email details error:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
};

/**
 * Get email thread
 */
export const getEmailThread = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { threadId } = req.params;

    const result = await pool.query(
      'SELECT * FROM synced_emails WHERE user_id = $1 AND gmail_thread_id = $2 ORDER BY message_date ASC',
      [userId, threadId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get email thread error:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
};

/**
 * Send email
 */
export const sendNewEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { to, subject, body, cc, bcc } = req.body;

    const oauth2Client = await getUserOAuthClient(userId);
    const sent = await sendEmail(oauth2Client, { to, subject, body, cc, bcc });

    // Save to database
    await pool.query(
      `INSERT INTO synced_emails (
        user_id, gmail_message_id, gmail_thread_id, subject, from_email,
        to_emails, cc_emails, bcc_emails, message_date, snippet, body_text,
        label_ids, is_read
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        userId,
        sent.id,
        sent.threadId,
        sent.subject,
        sent.from,
        sent.to,
        sent.cc || [],
        sent.bcc || [],
        new Date(sent.date),
        sent.snippet,
        sent.body,
        sent.labelIds || [],
        true,
      ]
    );

    res.json({ success: true, email: sent });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

/**
 * Reply to email
 */
export const replyToEmailHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { body } = req.body;

    // Get original email
    const emailResult = await pool.query(
      'SELECT * FROM synced_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);

    // Fetch original from Gmail
    const original = await getEmailById(oauth2Client, emailResult.rows[0].gmail_message_id);
    const reply = await replyToEmail(oauth2Client, original, body);

    // Save reply
    await pool.query(
      `INSERT INTO synced_emails (
        user_id, gmail_message_id, gmail_thread_id, subject, from_email,
        to_emails, message_date, snippet, body_text, label_ids, is_read
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        reply.id,
        reply.threadId,
        reply.subject,
        reply.from,
        reply.to,
        new Date(reply.date),
        reply.snippet,
        reply.body,
        reply.labelIds || [],
        true,
      ]
    );

    res.json({ success: true, email: reply });
  } catch (error) {
    console.error('Reply to email error:', error);
    res.status(500).json({ error: 'Failed to reply to email' });
  }
};

/**
 * Link email to CRM entity
 */
export const linkEmailToEntity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { relatedToType, relatedToId } = req.body;

    const result = await pool.query(
      `UPDATE synced_emails
       SET related_to_type = $1, related_to_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [relatedToType, relatedToId, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Link email error:', error);
    res.status(500).json({ error: 'Failed to link email' });
  }
};

/**
 * Mark as read/unread
 */
export const updateReadStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { read } = req.body;

    // Get email
    const emailResult = await pool.query(
      'SELECT gmail_message_id FROM synced_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);

    if (read) {
      await markAsRead(oauth2Client, emailResult.rows[0].gmail_message_id);
    } else {
      await markAsUnread(oauth2Client, emailResult.rows[0].gmail_message_id);
    }

    // Update database
    await pool.query(
      'UPDATE synced_emails SET is_read = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [read, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update read status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/**
 * Archive email
 */
export const archiveEmailHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const emailResult = await pool.query(
      'SELECT gmail_message_id FROM synced_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);
    await archiveEmail(oauth2Client, emailResult.rows[0].gmail_message_id);

    res.json({ success: true });
  } catch (error) {
    console.error('Archive email error:', error);
    res.status(500).json({ error: 'Failed to archive email' });
  }
};

/**
 * Delete email
 */
export const deleteEmailHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const emailResult = await pool.query(
      'SELECT gmail_message_id FROM synced_emails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);
    await trashEmail(oauth2Client, emailResult.rows[0].gmail_message_id);

    // Mark as deleted in database (don't actually delete for audit)
    await pool.query(
      `UPDATE synced_emails
       SET label_ids = array_append(label_ids, 'TRASH'), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
};

/**
 * Get Gmail profile
 */
export const getGmailProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const oauth2Client = await getUserOAuthClient(userId);
    const profile = await getUserProfile(oauth2Client);

    res.json(profile);
  } catch (error) {
    console.error('Get Gmail profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Get sync status
 */
export const getSyncStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT
        gmail_sync_enabled,
        gmail_last_sync,
        (SELECT COUNT(*) FROM synced_emails WHERE user_id = $1) as emails_synced,
        (SELECT COUNT(*) FROM synced_emails WHERE user_id = $1 AND is_read = false) as unread_count
       FROM google_sync_settings
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        gmail_sync_enabled: false,
        gmail_last_sync: null,
        emails_synced: 0,
        unread_count: 0,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
};
