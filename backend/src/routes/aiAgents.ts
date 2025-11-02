import express from 'express';
import {
  getAgents,
  getAgent,
  updateAgent,
  executeAgent,
  getAgentActivity,
  getAgentMetrics,
  createAutomation,
  getAutomations,
  updateAutomation,
  deleteAutomation,
} from '../controllers/aiAgentsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// AI Agents
router.get('/agents', getAgents);
router.get('/agents/:agentId', getAgent);
router.patch('/agents/:agentId', updateAgent);
router.post('/agents/:agentId/execute', executeAgent);
router.get('/agents/:agentId/activity', getAgentActivity);
router.get('/agents/:agentId/metrics', getAgentMetrics);

// Automation Workflows
router.get('/automations', getAutomations);
router.post('/automations', createAutomation);
router.patch('/automations/:automationId', updateAutomation);
router.delete('/automations/:automationId', deleteAutomation);

export default router;
