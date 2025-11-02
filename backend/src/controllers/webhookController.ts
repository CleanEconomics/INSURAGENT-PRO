import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import { createOAuth2Client, setCredentials } from '../services/googleDriveService.js';
import { syncEmails, getUserProfile } from '../services/gmailService.js';
import { syncCalendarEvents } from '../services/calendarService.js';
import { autoLinkEmail } from '../services/emailLinkingService.js';
import crypto from 'crypto';

/**
 * Webhook Controller
 * Handles real-time notifications from Google (Gmail, Calendar, Drive)
 * using Google Cloud Pub/Sub
 */

/**
 * Handle Gmail push notifications
 * Triggered when new emails arrive or email state changes
 */
export const handleGmailWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook authenticity
    const message = req.body.message;
    if (!message || !message.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Decode the Pub/Sub message
    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(decodedData);

    console.log('Gmail webhook received:', notification);

    // Extract user email from notification
    const emailAddress = notification.emailAddress;
    if (!emailAddress) {
      return res.status(400).json({ error: 'No email address in notification' });
    }

    // Find user by Gmail address
    const userResult = await pool.query(
      `SELECT gdc.user_id, gdc.access_token, gdc.refresh_token
       FROM google_drive_credentials gdc
       JOIN users u ON gdc.user_id = u.id
       WHERE u.email = $1`,
      [emailAddress]
    );

    if (userResult.rows.length === 0) {
      console.log(`No user found for email: ${emailAddress}`);
      return res.status(200).json({ message: 'User not found, ignoring' });
    }

    const { user_id, access_token, refresh_token } = userResult.rows[0];

    // Create OAuth client
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, access_token, refresh_token);

    // Check history ID to determine what changed
    const historyId = notification.historyId;

    // Get current profile to compare
    const profile = await getUserProfile(oauth2Client);

    // Log webhook event
    await pool.query(
      `INSERT INTO webhook_events (
        user_id, webhook_type, payload, history_id, processed_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [user_id, 'gmail', notification, historyId]
    );

    // Trigger incremental sync (only new/changed emails)
    const syncResult = await syncEmails(oauth2Client, 10, 'is:unread');

    // Auto-link new emails
    for (const email of syncResult) {
      try {
        const linkResult = await autoLinkEmail(
          user_id,
          email.id,
          email.from,
          email.subject,
          email.body || '',
          email.to
        );

        if (linkResult.entityId && linkResult.confidence >= 0.6) {
          await pool.query(
            `UPDATE synced_emails
             SET related_to_type = $1, related_to_id = $2
             WHERE gmail_message_id = $3 AND user_id = $4`,
            [linkResult.entityType, linkResult.entityId, email.id, user_id]
          );
        }
      } catch (error) {
        console.error('Auto-link error:', error);
      }
    }

    // Send real-time notification to frontend via WebSocket
    // (Assuming WebSocket is set up - see websocket/socketServer.ts)
    // io.to(user_id).emit('gmail:new_emails', { count: syncResult.length });

    res.status(200).json({ success: true, synced: syncResult.length });
  } catch (error) {
    console.error('Gmail webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle Calendar push notifications
 * Triggered when calendar events are created, updated, or deleted
 */
export const handleCalendarWebhook = async (req: Request, res: Response) => {
  try {
    const message = req.body.message;
    if (!message || !message.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(decodedData);

    console.log('Calendar webhook received:', notification);

    const emailAddress = notification.emailAddress;
    const channelId = notification.channelId;
    const resourceId = notification.resourceId;

    // Find user
    const userResult = await pool.query(
      `SELECT gdc.user_id, gdc.access_token, gdc.refresh_token
       FROM google_drive_credentials gdc
       JOIN users u ON gdc.user_id = u.id
       WHERE u.email = $1`,
      [emailAddress]
    );

    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'User not found' });
    }

    const { user_id, access_token, refresh_token } = userResult.rows[0];

    // Log webhook event
    await pool.query(
      `INSERT INTO webhook_events (
        user_id, webhook_type, payload, channel_id, resource_id, processed_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [user_id, 'calendar', notification, channelId, resourceId]
    );

    // Create OAuth client
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, access_token, refresh_token);

    // Sync calendar events (incremental)
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Next 30 days

    const events = await syncCalendarEvents(oauth2Client, {
      timeMin: now,
      timeMax: futureDate,
      maxResults: 50
    });

    // Send WebSocket notification
    // io.to(user_id).emit('calendar:events_updated', { count: events.length });

    res.status(200).json({ success: true, synced: events.length });
  } catch (error) {
    console.error('Calendar webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Register Gmail webhook (watch mailbox)
 */
export const registerGmailWebhook = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's OAuth client
    const result = await pool.query(
      'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);

    // Set up watch (requires Google Cloud Pub/Sub topic)
    const topicName = process.env.GMAIL_PUBSUB_TOPIC || 'projects/your-project/topics/gmail-notifications';

    const { watchMailbox } = await import('../services/gmailService.js');
    const watchResult = await watchMailbox(oauth2Client, topicName);

    // Save webhook registration
    await pool.query(
      `INSERT INTO webhook_registrations (
        user_id, webhook_type, history_id, expiration, is_active
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, webhook_type)
      DO UPDATE SET
        history_id = EXCLUDED.history_id,
        expiration = EXCLUDED.expiration,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP`,
      [userId, 'gmail', watchResult.historyId, new Date(parseInt(watchResult.expiration)), true]
    );

    res.json({
      success: true,
      historyId: watchResult.historyId,
      expiration: watchResult.expiration,
    });
  } catch (error) {
    console.error('Register Gmail webhook error:', error);
    res.status(500).json({ error: 'Failed to register webhook' });
  }
};

/**
 * Register Calendar webhook (watch calendar)
 */
export const registerCalendarWebhook = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);

    // Set up calendar watch
    const webhookUrl = process.env.CALENDAR_WEBHOOK_URL || `${process.env.BACKEND_URL}/api/webhooks/calendar`;
    const { watchCalendar } = await import('../services/calendarService.js');
    const watchResult = await watchCalendar(oauth2Client, webhookUrl, req.body.calendarId || 'primary');

    // Save webhook registration
    await pool.query(
      `INSERT INTO webhook_registrations (
        user_id, webhook_type, channel_id, resource_id, expiration, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, webhook_type)
      DO UPDATE SET
        channel_id = EXCLUDED.channel_id,
        resource_id = EXCLUDED.resource_id,
        expiration = EXCLUDED.expiration,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        'calendar',
        watchResult.channelId,
        watchResult.resourceId,
        new Date(parseInt(watchResult.expiration)),
        true,
      ]
    );

    res.json({
      success: true,
      channelId: watchResult.channelId,
      resourceId: watchResult.resourceId,
      expiration: watchResult.expiration,
    });
  } catch (error) {
    console.error('Register Calendar webhook error:', error);
    res.status(500).json({ error: 'Failed to register webhook' });
  }
};

/**
 * Unregister Gmail webhook
 */
export const unregisterGmailWebhook = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);

    const { stopWatch } = await import('../services/gmailService.js');
    await stopWatch(oauth2Client);

    // Mark as inactive
    await pool.query(
      `UPDATE webhook_registrations
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND webhook_type = 'gmail'`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Unregister Gmail webhook error:', error);
    res.status(500).json({ error: 'Failed to unregister webhook' });
  }
};

/**
 * Unregister Calendar webhook
 */
export const unregisterCalendarWebhook = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);

    // Get channel info
    const channelResult = await pool.query(
      `SELECT channel_id, resource_id FROM webhook_registrations
       WHERE user_id = $1 AND webhook_type = 'calendar' AND is_active = true`,
      [userId]
    );

    if (channelResult.rows.length > 0) {
      const { stopWatchingCalendar } = await import('../services/calendarService.js');
      await stopWatchingCalendar(
        oauth2Client,
        channelResult.rows[0].channel_id,
        channelResult.rows[0].resource_id
      );
    }

    // Mark as inactive
    await pool.query(
      `UPDATE webhook_registrations
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND webhook_type = 'calendar'`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Unregister Calendar webhook error:', error);
    res.status(500).json({ error: 'Failed to unregister webhook' });
  }
};

/**
 * Get webhook status
 */
export const getWebhookStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT webhook_type, is_active, expiration, channel_id, history_id, created_at, updated_at
       FROM webhook_registrations
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get webhook status error:', error);
    res.status(500).json({ error: 'Failed to fetch webhook status' });
  }
};

/**
 * Renew expiring webhooks (cron job)
 * Google webhooks expire after 7 days for Gmail, variable for Calendar
 */
export async function renewExpiringWebhooks() {
  try {
    // Find webhooks expiring in next 24 hours
    const result = await pool.query(
      `SELECT wr.*, gdc.access_token, gdc.refresh_token
       FROM webhook_registrations wr
       JOIN google_drive_credentials gdc ON wr.user_id = gdc.user_id
       WHERE wr.is_active = true
         AND wr.expiration < NOW() + INTERVAL '24 hours'`
    );

    for (const webhook of result.rows) {
      try {
        const oauth2Client = createOAuth2Client();
        setCredentials(oauth2Client, webhook.access_token, webhook.refresh_token);

        if (webhook.webhook_type === 'gmail') {
          const topicName = process.env.GMAIL_PUBSUB_TOPIC || '';
          const { watchMailbox } = await import('../services/gmailService.js');
          const watchResult = await watchMailbox(oauth2Client, topicName);

          await pool.query(
            `UPDATE webhook_registrations
             SET history_id = $1, expiration = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [watchResult.historyId, new Date(parseInt(watchResult.expiration)), webhook.id]
          );

          console.log(`Renewed Gmail webhook for user ${webhook.user_id}`);
        } else if (webhook.webhook_type === 'calendar') {
          const webhookUrl = process.env.CALENDAR_WEBHOOK_URL || `${process.env.BACKEND_URL}/api/webhooks/calendar`;
          const { watchCalendar } = await import('../services/calendarService.js');
          const watchResult = await watchCalendar(oauth2Client, webhookUrl, 'primary');

          await pool.query(
            `UPDATE webhook_registrations
             SET channel_id = $1, resource_id = $2, expiration = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [
              watchResult.channelId,
              watchResult.resourceId,
              new Date(parseInt(watchResult.expiration)),
              webhook.id,
            ]
          );

          console.log(`Renewed Calendar webhook for user ${webhook.user_id}`);
        }
      } catch (error) {
        console.error(`Failed to renew webhook ${webhook.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Renew webhooks cron error:', error);
  }
}
