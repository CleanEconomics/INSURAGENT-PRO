import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  createOAuth2Client,
  getAuthorizationUrl,
  getTokensFromCode,
} from '../services/googleDriveService.js';

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const oauth2Client = createOAuth2Client();

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    const authUrl = getAuthorizationUrl(oauth2Client, state);

    res.json({
      authUrl,
      message: 'Redirect user to this URL to authorize Google Drive access',
    });
  } catch (error) {
    console.error('Initiate Google auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Google authorization' });
  }
};

/**
 * Handle OAuth callback from Google
 */
export const handleGoogleCallback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Verify state parameter
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
      userId = stateData.userId;

      // Check timestamp to prevent replay attacks (valid for 10 minutes)
      const timestamp = stateData.timestamp;
      if (Date.now() - timestamp > 10 * 60 * 1000) {
        return res.status(400).json({ error: 'Authorization expired. Please try again.' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for tokens
    const oauth2Client = createOAuth2Client();
    const tokens = await getTokensFromCode(oauth2Client, code as string);

    // Save credentials to database
    await pool.query(
      `INSERT INTO google_drive_credentials
       (user_id, access_token, refresh_token, token_type, expiry_date, scope)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = COALESCE(EXCLUDED.refresh_token, google_drive_credentials.refresh_token),
         token_type = EXCLUDED.token_type,
         expiry_date = EXCLUDED.expiry_date,
         scope = EXCLUDED.scope,
         updated_at = NOW()`,
      [
        userId,
        tokens.access_token,
        tokens.refresh_token,
        tokens.token_type || 'Bearer',
        tokens.expiry_date,
        tokens.scope,
      ]
    );

    // Redirect to success page or return success response
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?googleDriveConnected=true`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Failed to complete Google authorization' });
  }
};

/**
 * Check Google Drive connection status
 */
export const checkGoogleDriveStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT id, token_type, expiry_date, scope, created_at, updated_at FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        connected: false,
        message: 'Google Drive not connected',
      });
    }

    const credentials = result.rows[0];
    const isExpired = credentials.expiry_date && credentials.expiry_date < Date.now();

    res.json({
      connected: true,
      expired: isExpired,
      scope: credentials.scope,
      connectedAt: credentials.created_at,
      lastUpdated: credentials.updated_at,
    });
  } catch (error) {
    console.error('Check Google Drive status error:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
};

/**
 * Disconnect Google Drive
 */
export const disconnectGoogleDrive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Delete credentials (cascade will handle related data based on your preference)
    await pool.query('DELETE FROM google_drive_credentials WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Google Drive disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect Google Drive error:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Drive' });
  }
};

/**
 * Refresh access token
 */
export const refreshGoogleToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT refresh_token FROM google_drive_credentials WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].refresh_token) {
      return res.status(400).json({ error: 'No refresh token available. Please reconnect Google Drive.' });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: result.rows[0].refresh_token });

    // Refresh token
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update database with new access token
    await pool.query(
      `UPDATE google_drive_credentials
       SET access_token = $1,
           expiry_date = $2,
           updated_at = NOW()
       WHERE user_id = $3`,
      [credentials.access_token, credentials.expiry_date, userId]
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: credentials.expiry_date,
    });
  } catch (error) {
    console.error('Refresh Google token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};
