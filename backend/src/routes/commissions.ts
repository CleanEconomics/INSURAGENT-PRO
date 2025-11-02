import express from 'express';
import {
  getCommissionStatements,
  getCommissionDetails,
  getCommissionSummary,
  createCommissionStatement,
  updateCommissionStatement,
} from '../controllers/commissionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/commissions/statements - Get commission statements
router.get('/statements', getCommissionStatements);

// GET /api/commissions/summary - Get commission summary
router.get('/summary', getCommissionSummary);

// GET /api/commissions/statements/:statementId - Get commission details
router.get('/statements/:statementId', getCommissionDetails);

// POST /api/commissions/statements - Create commission statement (managers only)
router.post('/statements', createCommissionStatement);

// PATCH /api/commissions/statements/:statementId - Update commission statement (managers only)
router.patch('/statements/:statementId', updateCommissionStatement);

export default router;
