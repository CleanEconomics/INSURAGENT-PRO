import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAppointments);
router.post('/', createAppointment);

export default router;
