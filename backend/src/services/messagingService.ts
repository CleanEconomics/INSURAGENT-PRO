import pool from '../db/database.js';

export interface SendSMSParams {
  userId: string;
  toNumber: string;
  message: string;
  relatedToType?: string;
  relatedToId?: string;
  sentByAgentId?: string;
}

export interface SendEmailParams {
  userId: string;
  toEmail: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  ccEmails?: string[];
  bccEmails?: string[];
  relatedToType?: string;
  relatedToId?: string;
  sentByAgentId?: string;
}

/**
 * Check if a phone number or email is on the Do Not Contact list
 */
export async function isOnDoNotContactList(
  phone?: string,
  email?: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT id FROM do_not_contact
     WHERE (phone_number = $1 OR email = $2)
     LIMIT 1`,
    [phone, email]
  );
  return result.rows.length > 0;
}

/**
 * Check if user has available SMS quota
 */
export async function hasAvailableSMSQuota(userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT monthly_sms_quota, monthly_sms_used
     FROM messaging_quotas
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Create default quota if doesn't exist
    await pool.query(
      `INSERT INTO messaging_quotas (user_id, monthly_sms_quota, monthly_sms_used, quota_reset_date)
       VALUES ($1, 1000, 0, CURRENT_DATE + INTERVAL '1 month')
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    return true;
  }

  const { monthly_sms_quota, monthly_sms_used } = result.rows[0];
  return monthly_sms_used < monthly_sms_quota;
}

/**
 * Check if user has available email quota
 */
export async function hasAvailableEmailQuota(userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT monthly_email_quota, monthly_email_used
     FROM messaging_quotas
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Create default quota
    await pool.query(
      `INSERT INTO messaging_quotas (user_id, monthly_email_quota, monthly_email_used, quota_reset_date)
       VALUES ($1, 5000, 0, CURRENT_DATE + INTERVAL '1 month')
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    return true;
  }

  const { monthly_email_quota, monthly_email_used } = result.rows[0];
  return monthly_email_used < monthly_email_quota;
}

/**
 * Get user's primary phone number
 */
export async function getUserPhoneNumber(userId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT phone_number FROM user_phone_numbers
     WHERE user_id = $1 AND is_primary = true AND status = 'active'
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Assign a new phone number to the user
    return await assignPhoneNumberToUser(userId);
  }

  return result.rows[0].phone_number;
}

/**
 * Assign a new phone number to a user
 * In production, this would integrate with a telephony provider
 */
async function assignPhoneNumberToUser(userId: string): Promise<string> {
  // Generate a demo phone number
  // In production: call telephony API to provision a real number
  const demoNumber = `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`;

  await pool.query(
    `INSERT INTO user_phone_numbers (user_id, phone_number, status, is_primary)
     VALUES ($1, $2, 'active', true)
     ON CONFLICT (phone_number) DO NOTHING`,
    [userId, demoNumber]
  );

  console.log(`📞 Assigned phone number ${demoNumber} to user ${userId}`);
  return demoNumber;
}

/**
 * Send SMS message
 */
export async function sendSMS(params: SendSMSParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const {
    userId,
    toNumber,
    message,
    relatedToType,
    relatedToId,
    sentByAgentId,
  } = params;

  try {
    // Check Do Not Contact list
    if (await isOnDoNotContactList(toNumber)) {
      return {
        success: false,
        error: 'Recipient is on the Do Not Contact list',
      };
    }

    // Check quota
    if (!(await hasAvailableSMSQuota(userId))) {
      return {
        success: false,
        error: 'Monthly SMS quota exceeded. Please upgrade your plan.',
      };
    }

    // Get user's phone number
    const fromNumber = await getUserPhoneNumber(userId);
    if (!fromNumber) {
      return {
        success: false,
        error: 'No phone number assigned to user',
      };
    }

    // Calculate message details
    const characterCount = message.length;
    const segmentCount = Math.ceil(characterCount / 160);
    const costPerSegment = 0.01;
    const totalCost = segmentCount * costPerSegment;

    // Get user phone number record
    const phoneResult = await pool.query(
      'SELECT id FROM user_phone_numbers WHERE phone_number = $1',
      [fromNumber]
    );

    if (phoneResult.rows.length === 0) {
      return { success: false, error: 'Phone number record not found' };
    }

    const userPhoneNumberId = phoneResult.rows[0].id;

    // Insert message record
    const result = await pool.query(
      `INSERT INTO sms_messages (
        user_phone_number_id,
        from_number,
        to_number,
        message,
        direction,
        status,
        related_to_type,
        related_to_id,
        user_id,
        sent_by_agent_id,
        character_count,
        segment_count,
        cost_per_segment,
        total_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id`,
      [
        userPhoneNumberId,
        fromNumber,
        toNumber,
        message,
        'outbound',
        'sent', // In production: 'pending' until actually sent
        relatedToType,
        relatedToId,
        userId,
        sentByAgentId,
        characterCount,
        segmentCount,
        costPerSegment,
        totalCost,
      ]
    );

    const messageId = result.rows[0].id;

    // Update quota usage
    await pool.query(
      `UPDATE messaging_quotas
       SET monthly_sms_used = monthly_sms_used + $1
       WHERE user_id = $2`,
      [segmentCount, userId]
    );

    await pool.query(
      `UPDATE user_phone_numbers
       SET monthly_sms_used = monthly_sms_used + $1,
           last_used_at = NOW()
       WHERE id = $2`,
      [segmentCount, userPhoneNumberId]
    );

    // In production: Call SMS provider API here
    // Example: await twilioClient.messages.create({ ... })
    console.log(`📱 SMS sent from ${fromNumber} to ${toNumber}: "${message}"`);

    // Simulate delivery (in production, this would be a webhook callback)
    setTimeout(async () => {
      await pool.query(
        `UPDATE sms_messages SET status = 'delivered', delivered_at = NOW() WHERE id = $1`,
        [messageId]
      );
    }, 1000);

    // Update or create message thread
    await updateMessageThread(userId, toNumber, null, message, relatedToType, relatedToId);

    return {
      success: true,
      messageId: messageId,
    };
  } catch (error) {
    console.error('Send SMS error:', error);
    return {
      success: false,
      error: 'Failed to send SMS',
    };
  }
}

/**
 * Send Email message
 */
export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const {
    userId,
    toEmail,
    subject,
    bodyText,
    bodyHtml,
    ccEmails,
    bccEmails,
    relatedToType,
    relatedToId,
    sentByAgentId,
  } = params;

  try {
    // Check Do Not Contact list
    if (await isOnDoNotContactList(undefined, toEmail)) {
      return {
        success: false,
        error: 'Recipient is on the Do Not Contact list',
      };
    }

    // Check quota
    if (!(await hasAvailableEmailQuota(userId))) {
      return {
        success: false,
        error: 'Monthly email quota exceeded. Please upgrade your plan.',
      };
    }

    // Get user's email (from users table)
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const fromEmail = userResult.rows[0].email;

    // Calculate message size
    const bodyContent = bodyHtml || bodyText || '';
    const sizeBytes = Buffer.from(bodyContent).length;

    // Insert message record
    const result = await pool.query(
      `INSERT INTO email_messages (
        user_id,
        from_email,
        to_email,
        cc_emails,
        bcc_emails,
        subject,
        body_text,
        body_html,
        direction,
        status,
        related_to_type,
        related_to_id,
        sent_by_agent_id,
        size_bytes,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING id`,
      [
        userId,
        fromEmail,
        toEmail,
        ccEmails || [],
        bccEmails || [],
        subject,
        bodyText,
        bodyHtml,
        'outbound',
        'sent', // In production: 'pending' until actually sent
        relatedToType,
        relatedToId,
        sentByAgentId,
        sizeBytes,
      ]
    );

    const messageId = result.rows[0].id;

    // Update quota usage
    await pool.query(
      `UPDATE messaging_quotas
       SET monthly_email_used = monthly_email_used + 1
       WHERE user_id = $1`,
      [userId]
    );

    // In production: Call email provider API here
    // Example: await sendgridClient.send({ ... })
    console.log(`📧 Email sent from ${fromEmail} to ${toEmail}: "${subject}"`);

    // Simulate delivery
    setTimeout(async () => {
      await pool.query(
        `UPDATE email_messages SET status = 'delivered', delivered_at = NOW() WHERE id = $1`,
        [messageId]
      );
    }, 1000);

    // Update or create message thread
    await updateMessageThread(userId, null, toEmail, subject, relatedToType, relatedToId);

    return {
      success: true,
      messageId: messageId,
    };
  } catch (error) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: 'Failed to send email',
    };
  }
}

/**
 * Update or create message thread
 */
async function updateMessageThread(
  userId: string,
  contactPhone: string | null,
  contactEmail: string | null,
  lastMessagePreview: string,
  relatedToType?: string,
  relatedToId?: string
): Promise<void> {
  // Try to find existing thread
  const existing = await pool.query(
    `SELECT id FROM message_threads
     WHERE user_id = $1
     AND (contact_phone = $2 OR contact_email = $3)
     LIMIT 1`,
    [userId, contactPhone, contactEmail]
  );

  if (existing.rows.length > 0) {
    // Update existing thread
    await pool.query(
      `UPDATE message_threads
       SET last_message_at = NOW(),
           last_message_preview = $1,
           message_count = message_count + 1,
           updated_at = NOW()
       WHERE id = $2`,
      [lastMessagePreview.substring(0, 100), existing.rows[0].id]
    );
  } else {
    // Create new thread
    await pool.query(
      `INSERT INTO message_threads (
        user_id,
        contact_phone,
        contact_email,
        related_to_type,
        related_to_id,
        last_message_at,
        last_message_preview,
        message_count
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 1)`,
      [userId, contactPhone, contactEmail, relatedToType, relatedToId, lastMessagePreview.substring(0, 100)]
    );
  }
}

/**
 * Get messaging analytics for a user
 */
export async function getMessagingAnalytics(
  userId: string,
  days: number = 30
): Promise<any> {
  const result = await pool.query(
    `SELECT * FROM messaging_analytics
     WHERE user_id = $1
     AND date >= CURRENT_DATE - INTERVAL '${days} days'
     ORDER BY date DESC`,
    [userId]
  );

  // Calculate totals
  const totals = result.rows.reduce(
    (acc, row) => {
      acc.sms_sent += row.sms_sent || 0;
      acc.sms_delivered += row.sms_delivered || 0;
      acc.sms_failed += row.sms_failed || 0;
      acc.emails_sent += row.emails_sent || 0;
      acc.emails_delivered += row.emails_delivered || 0;
      acc.emails_opened += row.emails_opened || 0;
      return acc;
    },
    {
      sms_sent: 0,
      sms_delivered: 0,
      sms_failed: 0,
      emails_sent: 0,
      emails_delivered: 0,
      emails_opened: 0,
    }
  );

  // Calculate rates
  const sms_delivery_rate = totals.sms_sent > 0
    ? ((totals.sms_delivered / totals.sms_sent) * 100).toFixed(2)
    : '0.00';

  const email_open_rate = totals.emails_sent > 0
    ? ((totals.emails_opened / totals.emails_sent) * 100).toFixed(2)
    : '0.00';

  return {
    period: `${days} days`,
    totals,
    rates: {
      sms_delivery_rate: `${sms_delivery_rate}%`,
      email_open_rate: `${email_open_rate}%`,
    },
    daily: result.rows,
  };
}

/**
 * Get user's quota information
 */
export async function getUserQuota(userId: string): Promise<any> {
  const result = await pool.query(
    'SELECT * FROM messaging_quotas WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    // Return default quota
    return {
      tier: 'starter',
      monthly_sms_quota: 1000,
      monthly_sms_used: 0,
      monthly_email_quota: 5000,
      monthly_email_used: 0,
      quota_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    };
  }

  return result.rows[0];
}

/**
 * Queue message for bulk sending
 */
export async function queueMessage(
  userId: string,
  type: 'sms' | 'email',
  recipient: { phone?: string; email?: string },
  content: { subject?: string; body: string },
  options: {
    relatedToType?: string;
    relatedToId?: string;
    scheduledAt?: Date;
    priority?: number;
  } = {}
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO message_queue (
      user_id,
      type,
      to_number,
      to_email,
      subject,
      body,
      related_to_type,
      related_to_id,
      scheduled_at,
      priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id`,
    [
      userId,
      type,
      recipient.phone,
      recipient.email,
      content.subject,
      content.body,
      options.relatedToType,
      options.relatedToId,
      options.scheduledAt,
      options.priority || 5,
    ]
  );

  return result.rows[0].id;
}

/**
 * Process message queue (called by background worker)
 */
export async function processMessageQueue(limit: number = 100): Promise<number> {
  // Get pending messages
  const result = await pool.query(
    `SELECT * FROM message_queue
     WHERE status = 'pending'
     AND (scheduled_at IS NULL OR scheduled_at <= NOW())
     AND attempts < max_attempts
     ORDER BY priority DESC, created_at ASC
     LIMIT $1`,
    [limit]
  );

  let processed = 0;

  for (const message of result.rows) {
    try {
      // Mark as processing
      await pool.query(
        'UPDATE message_queue SET status = $1 WHERE id = $2',
        ['processing', message.id]
      );

      // Send the message
      let sendResult;
      if (message.type === 'sms') {
        sendResult = await sendSMS({
          userId: message.user_id,
          toNumber: message.to_number,
          message: message.body,
          relatedToType: message.related_to_type,
          relatedToId: message.related_to_id,
        });
      } else {
        sendResult = await sendEmail({
          userId: message.user_id,
          toEmail: message.to_email,
          subject: message.subject || '',
          bodyText: message.body,
          relatedToType: message.related_to_type,
          relatedToId: message.related_to_id,
        });
      }

      if (sendResult.success) {
        // Mark as sent
        await pool.query(
          'UPDATE message_queue SET status = $1, processed_at = NOW() WHERE id = $2',
          ['sent', message.id]
        );
        processed++;
      } else {
        // Mark as failed
        await pool.query(
          `UPDATE message_queue
           SET status = $1, attempts = attempts + 1, error_message = $2
           WHERE id = $3`,
          ['failed', sendResult.error, message.id]
        );
      }
    } catch (error) {
      console.error(`Error processing queue message ${message.id}:`, error);
      await pool.query(
        `UPDATE message_queue
         SET status = $1, attempts = attempts + 1, error_message = $2
         WHERE id = $3`,
        ['failed', 'Processing error', message.id]
      );
    }
  }

  return processed;
}
