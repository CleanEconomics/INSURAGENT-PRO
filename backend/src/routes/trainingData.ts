import express from 'express';
import {
  uploadTrainingFile,
  getTrainingData,
  getTrainingDataById,
  updateTrainingData,
  deleteTrainingData,
  searchTrainingData,
  getDriveFiles,
  createKnowledgeBaseEntry,
  getKnowledgeBase,
  createTrainingFolder,
  getTrainingFolders,
  upload,
} from '../controllers/trainingDataController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Training data routes
router.post('/upload', upload.single('file'), uploadTrainingFile);
router.get('/', getTrainingData);
router.get('/search', searchTrainingData);
router.get('/:id', getTrainingDataById);
router.put('/:id', updateTrainingData);
router.delete('/:id', deleteTrainingData);

// Drive files
router.get('/drive/files', getDriveFiles);

// Knowledge base
router.post('/knowledge-base', createKnowledgeBaseEntry);
router.get('/knowledge-base', getKnowledgeBase);

// Folders
router.post('/folders', createTrainingFolder);
router.get('/folders', getTrainingFolders);

export default router;
