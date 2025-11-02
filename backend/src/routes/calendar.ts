import express from 'express';
import {
  syncCalendar,
  getEvents,
  getEventDetails,
  createEvent,
  updateEvent,
  deleteEvent,
  findSlots,
  checkAvailability,
  createQuick,
  addMeetLink,
  linkEventToEntity,
  getCalendarSyncStatus,
} from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';
import { calendarLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(calendarLimiter);

// Sync and status
router.post('/sync', syncCalendar);
router.get('/status', getCalendarSyncStatus);

// Event operations
router.get('/events', getEvents);
router.get('/events/:id', getEventDetails);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Quick event creation
router.post('/quick', createQuick);

// Availability and scheduling
router.post('/find-slots', findSlots);
router.post('/check-availability', checkAvailability);

// Event management
router.post('/events/:id/meet', addMeetLink);
router.put('/events/:id/link', linkEventToEntity);

export default router;
