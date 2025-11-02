import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addTicketMessage,
} from '../controllers/serviceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.post('/tickets', createTicket);
router.put('/tickets/:id', updateTicket);
router.post('/tickets/:id/messages', addTicketMessage);

export default router;
