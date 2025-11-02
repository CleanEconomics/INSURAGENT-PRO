import express from 'express';
import { chat, mapLeads } from '../controllers/copilotController.js';
import { authenticate } from '../middleware/auth.js';
import { aiCopilotLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);
router.use(aiCopilotLimiter);

router.post('/chat', chat);
router.post('/map-leads', mapLeads);

export default router;
