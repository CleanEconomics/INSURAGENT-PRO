import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  addPolicy,
  updatePolicy,
  deletePolicy,
} from '../controllers/contactsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);

// Policy management
router.post('/:contactId/policies', addPolicy);
router.put('/:contactId/policies/:policyId', updatePolicy);
router.delete('/:contactId/policies/:policyId', deletePolicy);

export default router;
