import express from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  checkGoogleDriveStatus,
  disconnectGoogleDrive,
  refreshGoogleToken,
} from '../controllers/googleAuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Initiate OAuth flow (requires authentication)
router.get('/authorize', authenticate, initiateGoogleAuth);

// OAuth callback (no auth required as it's coming from Google)
router.get('/callback', handleGoogleCallback);

// Connection status (requires authentication)
router.get('/status', authenticate, checkGoogleDriveStatus);

// Disconnect (requires authentication)
router.delete('/disconnect', authenticate, disconnectGoogleDrive);

// Refresh token (requires authentication)
router.post('/refresh', authenticate, refreshGoogleToken);

export default router;
