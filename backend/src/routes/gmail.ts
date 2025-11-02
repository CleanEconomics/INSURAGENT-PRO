import express from 'express';
import {
  syncGmailEmails,
  getEmails,
  getEmailDetails,
  getEmailThread,
  sendNewEmail,
  replyToEmailHandler,
  linkEmailToEntity,
  updateReadStatus,
  archiveEmailHandler,
  deleteEmailHandler,
  getGmailProfile,
  getSyncStatus,
} from '../controllers/gmailController.js';
import { authenticate } from '../middleware/auth.js';
import { gmailLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(gmailLimiter);

// Sync and status
router.post('/sync', syncGmailEmails);
router.get('/status', getSyncStatus);
router.get('/profile', getGmailProfile);

// Email operations
router.get('/emails', getEmails);
router.get('/emails/:id', getEmailDetails);
router.get('/threads/:threadId', getEmailThread);
router.post('/send', sendNewEmail);
router.post('/emails/:id/reply', replyToEmailHandler);

// Email management
router.put('/emails/:id/link', linkEmailToEntity);
router.put('/emails/:id/read', updateReadStatus);
router.post('/emails/:id/archive', archiveEmailHandler);
router.delete('/emails/:id', deleteEmailHandler);

export default router;
