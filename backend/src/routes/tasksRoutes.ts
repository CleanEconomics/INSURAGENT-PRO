import express from 'express';
import { getTasks, createTask, updateTask } from '../controllers/tasksController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);

export default router;
