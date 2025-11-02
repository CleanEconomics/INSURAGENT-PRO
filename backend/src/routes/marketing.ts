import express from 'express';
import {
  createCampaign,
  getCampaigns,
  sendCampaign,
  getCampaignStats,
  getTemplates,
  createTemplate,
  getAnalytics,
  getQuota,
  getThreads,
  getThreadMessages,
  sendQuickMessage,
} from '../controllers/marketingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Campaigns
router.post('/campaigns', createCampaign);
router.get('/campaigns', getCampaigns);
router.post('/campaigns/:campaignId/send', sendCampaign);
router.get('/campaigns/:campaignId/stats', getCampaignStats);

// Templates
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);

// Analytics
router.get('/analytics', getAnalytics);

// Quota
router.get('/quota', getQuota);

// Message threads
router.get('/threads', getThreads);
router.get('/threads/:threadId/messages', getThreadMessages);

// Quick messaging
router.post('/messages/send', sendQuickMessage);

export default router;
