import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleEmail, EmailAttachment } from '../types/index.js';

/**
 * Gmail Service
 * Handles email syncing, sending, and thread management
 */

const gmail = google.gmail({ version: 'v1' });

/**
 * Sync recent emails from Gmail
 */
export async function syncEmails(
  oauth2Client: OAuth2Client,
  maxResults: number = 50,
  query?: string
): Promise<GoogleEmail[]> {
  const response = await gmail.users.messages.list({
    auth: oauth2Client,
    userId: 'me',
    q: query || 'in:inbox OR in:sent',
    maxResults: maxResults,
  });

  const emails: GoogleEmail[] = [];

  if (!response.data.messages) {
    return emails;
  }

  // Fetch full message details for each email
  for (const message of response.data.messages) {
    try {
      const email = await getEmailById(oauth2Client, message.id!);
      emails.push(email);
    } catch (error) {
      console.error(`Failed to fetch email ${message.id}:`, error);
    }
  }

  return emails;
}

/**
 * Get specific email by ID
 */
export async function getEmailById(
  oauth2Client: OAuth2Client,
  messageId: string
): Promise<GoogleEmail> {
  const response = await gmail.users.messages.get({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const message = response.data;
  const headers = message.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

  const email: GoogleEmail = {
    id: message.id!,
    threadId: message.threadId!,
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To').split(',').map(e => e.trim()).filter(Boolean),
    cc: getHeader('Cc').split(',').map(e => e.trim()).filter(Boolean),
    bcc: getHeader('Bcc').split(',').map(e => e.trim()).filter(Boolean),
    date: getHeader('Date'),
    snippet: message.snippet || '',
    labelIds: message.labelIds || [],
    inReplyTo: getHeader('In-Reply-To'),
    references: getHeader('References').split(' ').filter(Boolean),
  };

  // Extract body
  const body = extractBody(message.payload);
  email.body = body.text;
  email.bodyHtml = body.html;

  // Extract attachments
  email.attachments = extractAttachments(message.payload);

  return email;
}

/**
 * Extract email body (text and HTML)
 */
function extractBody(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (payload.body?.data) {
    const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    if (payload.mimeType === 'text/plain') {
      text = decoded;
    } else if (payload.mimeType === 'text/html') {
      html = decoded;
    }
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        const nested = extractBody(part);
        text = text || nested.text;
        html = html || nested.html;
      }
    }
  }

  return { text, html };
}

/**
 * Extract attachments from email
 */
function extractAttachments(payload: any): EmailAttachment[] {
  const attachments: EmailAttachment[] = [];

  const processPart = (part: any) => {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        id: part.partId || part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      });
    }

    if (part.parts) {
      part.parts.forEach(processPart);
    }
  };

  if (payload.parts) {
    payload.parts.forEach(processPart);
  }

  return attachments;
}

/**
 * Get attachment data
 */
export async function getAttachment(
  oauth2Client: OAuth2Client,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const response = await gmail.users.messages.attachments.get({
    auth: oauth2Client,
    userId: 'me',
    messageId: messageId,
    id: attachmentId,
  });

  const data = response.data.data;
  if (!data) {
    throw new Error('Attachment data not found');
  }

  return Buffer.from(data, 'base64');
}

/**
 * Get email thread
 */
export async function getThread(
  oauth2Client: OAuth2Client,
  threadId: string
): Promise<GoogleEmail[]> {
  const response = await gmail.users.threads.get({
    auth: oauth2Client,
    userId: 'me',
    id: threadId,
    format: 'full',
  });

  const emails: GoogleEmail[] = [];

  if (response.data.messages) {
    for (const message of response.data.messages) {
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const body = extractBody(message.payload);

      emails.push({
        id: message.id!,
        threadId: message.threadId!,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To').split(',').map(e => e.trim()).filter(Boolean),
        cc: getHeader('Cc').split(',').map(e => e.trim()).filter(Boolean),
        date: getHeader('Date'),
        snippet: message.snippet || '',
        body: body.text,
        bodyHtml: body.html,
        labelIds: message.labelIds || [],
        attachments: extractAttachments(message.payload),
      });
    }
  }

  return emails;
}

/**
 * Send email
 */
export async function sendEmail(
  oauth2Client: OAuth2Client,
  params: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    threadId?: string;
    inReplyTo?: string;
  }
): Promise<GoogleEmail> {
  const email = [
    `To: ${params.to.join(', ')}`,
    params.cc ? `Cc: ${params.cc.join(', ')}` : '',
    params.bcc ? `Bcc: ${params.bcc.join(', ')}` : '',
    `Subject: ${params.subject}`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : '',
    params.threadId ? `References: ${params.inReplyTo}` : '',
    '',
    params.body,
  ].filter(Boolean).join('\n');

  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    auth: oauth2Client,
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
      threadId: params.threadId,
    },
  });

  return getEmailById(oauth2Client, response.data.id!);
}

/**
 * Reply to email
 */
export async function replyToEmail(
  oauth2Client: OAuth2Client,
  originalEmail: GoogleEmail,
  replyBody: string
): Promise<GoogleEmail> {
  return sendEmail(oauth2Client, {
    to: [originalEmail.from],
    subject: originalEmail.subject.startsWith('Re:')
      ? originalEmail.subject
      : `Re: ${originalEmail.subject}`,
    body: replyBody,
    threadId: originalEmail.threadId,
    inReplyTo: originalEmail.id,
  });
}

/**
 * Forward email
 */
export async function forwardEmail(
  oauth2Client: OAuth2Client,
  originalEmail: GoogleEmail,
  forwardTo: string[],
  additionalMessage?: string
): Promise<GoogleEmail> {
  const forwardBody = [
    additionalMessage || '',
    '',
    '---------- Forwarded message ---------',
    `From: ${originalEmail.from}`,
    `Date: ${originalEmail.date}`,
    `Subject: ${originalEmail.subject}`,
    `To: ${originalEmail.to.join(', ')}`,
    '',
    originalEmail.body || originalEmail.snippet,
  ].join('\n');

  return sendEmail(oauth2Client, {
    to: forwardTo,
    subject: originalEmail.subject.startsWith('Fwd:')
      ? originalEmail.subject
      : `Fwd: ${originalEmail.subject}`,
    body: forwardBody,
  });
}

/**
 * Mark email as read
 */
export async function markAsRead(
  oauth2Client: OAuth2Client,
  messageId: string
): Promise<void> {
  await gmail.users.messages.modify({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
}

/**
 * Mark email as unread
 */
export async function markAsUnread(
  oauth2Client: OAuth2Client,
  messageId: string
): Promise<void> {
  await gmail.users.messages.modify({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: ['UNREAD'],
    },
  });
}

/**
 * Add label to email
 */
export async function addLabel(
  oauth2Client: OAuth2Client,
  messageId: string,
  labelId: string
): Promise<void> {
  await gmail.users.messages.modify({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: [labelId],
    },
  });
}

/**
 * Remove label from email
 */
export async function removeLabel(
  oauth2Client: OAuth2Client,
  messageId: string,
  labelId: string
): Promise<void> {
  await gmail.users.messages.modify({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: [labelId],
    },
  });
}

/**
 * Archive email
 */
export async function archiveEmail(
  oauth2Client: OAuth2Client,
  messageId: string
): Promise<void> {
  await gmail.users.messages.modify({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['INBOX'],
    },
  });
}

/**
 * Trash email
 */
export async function trashEmail(
  oauth2Client: OAuth2Client,
  messageId: string
): Promise<void> {
  await gmail.users.messages.trash({
    auth: oauth2Client,
    userId: 'me',
    id: messageId,
  });
}

/**
 * Search emails
 */
export async function searchEmails(
  oauth2Client: OAuth2Client,
  query: string,
  maxResults: number = 20
): Promise<GoogleEmail[]> {
  return syncEmails(oauth2Client, maxResults, query);
}

/**
 * Get labels
 */
export async function getLabels(oauth2Client: OAuth2Client) {
  const response = await gmail.users.labels.list({
    auth: oauth2Client,
    userId: 'me',
  });

  return response.data.labels || [];
}

/**
 * Create label
 */
export async function createLabel(
  oauth2Client: OAuth2Client,
  name: string,
  labelListVisibility: 'labelShow' | 'labelHide' = 'labelShow',
  messageListVisibility: 'show' | 'hide' = 'show'
) {
  const response = await gmail.users.labels.create({
    auth: oauth2Client,
    userId: 'me',
    requestBody: {
      name,
      labelListVisibility,
      messageListVisibility,
    },
  });

  return response.data;
}

/**
 * Get user profile
 */
export async function getUserProfile(oauth2Client: OAuth2Client) {
  const response = await gmail.users.getProfile({
    auth: oauth2Client,
    userId: 'me',
  });

  return {
    emailAddress: response.data.emailAddress,
    messagesTotal: response.data.messagesTotal,
    threadsTotal: response.data.threadsTotal,
    historyId: response.data.historyId,
  };
}

/**
 * Watch for changes (for real-time sync)
 */
export async function watchMailbox(
  oauth2Client: OAuth2Client,
  topicName: string
): Promise<{ historyId: string; expiration: string }> {
  const response = await gmail.users.watch({
    auth: oauth2Client,
    userId: 'me',
    requestBody: {
      topicName: topicName,
      labelIds: ['INBOX'],
    },
  });

  return {
    historyId: response.data.historyId!,
    expiration: response.data.expiration!,
  };
}

/**
 * Stop watching mailbox
 */
export async function stopWatch(oauth2Client: OAuth2Client): Promise<void> {
  await gmail.users.stop({
    auth: oauth2Client,
    userId: 'me',
  });
}
