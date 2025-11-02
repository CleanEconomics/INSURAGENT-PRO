import * as cron from 'node-cron';
import pool from '../db/database.js';
import { watchCalendar } from '../services/calendarService.js';
import { watchMailbox } from '../services/gmailService.js';
import { createOAuth2Client, setCredentials } from '../services/googleDriveService.js';

/**
 * Webhook Renewal Cron Job
 *
 * Google Calendar and Gmail watch notifications expire after a certain period.
 * This cron job automatically renews watch subscriptions before they expire.
 *
 * Runs every 6 hours to check for expiring webhooks and renew them.
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || `${process.env.BACKEND_URL}/api/webhooks`;
const RENEWAL_THRESHOLD_HOURS = 24; // Renew if expiring within 24 hours

/**
 * Renew expiring webhooks for all users
 */
async function renewExpiringWebhooks() {
  console.log('[WebhookRenewal] Starting webhook renewal check...');

  try {
    // Calculate the threshold timestamp (now + 24 hours)
    const thresholdTime = new Date(Date.now() + RENEWAL_THRESHOLD_HOURS * 60 * 60 * 1000);

    // Find all webhooks expiring within the threshold
    const expiringWebhooks = await pool.query(
      `SELECT * FROM google_webhooks
       WHERE expires_at < $1
       AND status = 'active'
       ORDER BY expires_at ASC`,
      [thresholdTime]
    );

    console.log(`[WebhookRenewal] Found ${expiringWebhooks.rows.length} expiring webhooks`);

    for (const webhook of expiringWebhooks.rows) {
      try {
        await renewWebhook(webhook);
      } catch (error) {
        console.error(`[WebhookRenewal] Failed to renew webhook ${webhook.id}:`, error);
      }
    }

    console.log('[WebhookRenewal] Webhook renewal check complete');
  } catch (error) {
    console.error('[WebhookRenewal] Error during webhook renewal:', error);
  }
}

/**
 * Renew a specific webhook
 */
async function renewWebhook(webhook: any) {
  console.log(`[WebhookRenewal] Renewing webhook ${webhook.id} for user ${webhook.user_id}`);

  // Get user's Google credentials
  const userResult = await pool.query(
    'SELECT google_access_token, google_refresh_token FROM users WHERE id = $1',
    [webhook.user_id]
  );

  if (userResult.rows.length === 0) {
    console.error(`[WebhookRenewal] User ${webhook.user_id} not found`);
    return;
  }

  const user = userResult.rows[0];

  if (!user.google_access_token) {
    console.error(`[WebhookRenewal] User ${webhook.user_id} has no Google access token`);
    return;
  }

  // Create OAuth2 client and set credentials
  const oauth2Client = createOAuth2Client();
  setCredentials(oauth2Client, user.google_access_token, user.google_refresh_token);

  let newWebhook;

  try {
    if (webhook.resource_type === 'calendar') {
      // Renew calendar webhook
      newWebhook = await watchCalendar(
        oauth2Client,
        `${WEBHOOK_URL}/calendar`,
        webhook.calendar_id || 'primary'
      );
    } else if (webhook.resource_type === 'gmail') {
      // Renew Gmail webhook
      newWebhook = await watchMailbox(oauth2Client, `${WEBHOOK_URL}/gmail`);
    } else {
      console.error(`[WebhookRenewal] Unknown resource type: ${webhook.resource_type}`);
      return;
    }

    // Update webhook in database
    if (webhook.resource_type === 'calendar') {
      // Calendar webhook has channelId and resourceId
      const calWebhook = newWebhook as { id: string; channelId: string; resourceId: string; expiration: string };
      await pool.query(
        `UPDATE google_webhooks
         SET channel_id = $1,
             resource_id = $2,
             expires_at = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          calWebhook.channelId,
          calWebhook.resourceId,
          new Date(parseInt(calWebhook.expiration)),
          webhook.id
        ]
      );
    } else {
      // Gmail webhook has historyId
      const gmailWebhook = newWebhook as { historyId: string; expiration: string };
      await pool.query(
        `UPDATE google_webhooks
         SET expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [
          new Date(parseInt(gmailWebhook.expiration)),
          webhook.id
        ]
      );
    }

    console.log(`[WebhookRenewal] Successfully renewed webhook ${webhook.id}`);
  } catch (error) {
    console.error(`[WebhookRenewal] Error renewing webhook ${webhook.id}:`, error);

    // Mark webhook as failed
    await pool.query(
      `UPDATE google_webhooks
       SET status = 'failed',
           updated_at = NOW()
       WHERE id = $1`,
      [webhook.id]
    );
  }
}

/**
 * Start the webhook renewal cron job
 * Runs every 6 hours: 0 at-sign-slash-6 asterisk asterisk asterisk (cron expression)
 */
export function startWebhookRenewalJob() {
  // Run every 6 hours at minute 0
  const job = cron.schedule('0 */6 * * *', () => {
    renewExpiringWebhooks();
  });

  console.log('[WebhookRenewal] Cron job started - runs every 6 hours');

  // Run once immediately on startup to catch any expired webhooks
  renewExpiringWebhooks();

  return job;
}

/**
 * Stop the webhook renewal cron job
 */
export function stopWebhookRenewalJob(job: cron.ScheduledTask) {
  job.stop();
  console.log('[WebhookRenewal] Cron job stopped');
}
