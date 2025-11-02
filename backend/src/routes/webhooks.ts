import express from 'express';
import {
  handleGmailWebhook,
  handleCalendarWebhook,
  registerGmailWebhook,
  registerCalendarWebhook,
  unregisterGmailWebhook,
  unregisterCalendarWebhook,
  getWebhookStatus,
} from '../controllers/webhookController.js';
import { authenticate } from '../middleware/auth.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public webhook endpoints (called by Google)
router.post('/gmail', webhookLimiter, handleGmailWebhook);
router.post('/calendar', webhookLimiter, handleCalendarWebhook);

// Protected webhook management endpoints (requires authentication)
router.post('/register/gmail', authenticate, registerGmailWebhook);
router.post('/register/calendar', authenticate, registerCalendarWebhook);
router.delete('/unregister/gmail', authenticate, unregisterGmailWebhook);
router.delete('/unregister/calendar', authenticate, unregisterCalendarWebhook);
router.get('/status', authenticate, getWebhookStatus);

export default router;
