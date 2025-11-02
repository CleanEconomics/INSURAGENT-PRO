import express from 'express';
import { getOpportunities, updateOpportunity } from '../controllers/opportunitiesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getOpportunities);
router.put('/:id', updateOpportunity);

export default router;
