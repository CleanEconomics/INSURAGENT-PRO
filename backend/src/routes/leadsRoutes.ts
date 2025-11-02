import express from 'express';
import {
  getClientLeads,
  createClientLead,
  updateClientLead,
  convertClientLead,
  getRecruitLeads,
  createRecruitLead,
  updateRecruitLead,
  convertRecruitLead,
  addLeadActivity,
  bulkImportLeads,
} from '../controllers/leadsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Client Leads
router.get('/client-leads', getClientLeads);
router.post('/client-leads', createClientLead);
router.put('/client-leads/:id', updateClientLead);
router.post('/client-leads/:id/convert', convertClientLead);
router.post('/client-leads/:id/activities', addLeadActivity);

// Recruit Leads
router.get('/recruit-leads', getRecruitLeads);
router.post('/recruit-leads', createRecruitLead);
router.put('/recruit-leads/:id', updateRecruitLead);
router.post('/recruit-leads/:id/convert', convertRecruitLead);

// Bulk Import
router.post('/bulk-import', bulkImportLeads);

export default router;
