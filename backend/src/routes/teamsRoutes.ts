import express from 'express';
import { getTeams, createTeam, addTeamMember, getAgents, getAgentById } from '../controllers/teamsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTeams);
router.post('/', createTeam);
router.put('/:id/members', addTeamMember);

// Agent routes
router.get('/agents', getAgents);
router.get('/agents/:id', getAgentById);

export default router;
