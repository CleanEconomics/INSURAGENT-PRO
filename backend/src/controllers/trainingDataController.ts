import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  createOAuth2Client,
  setCredentials,
  uploadFileFromStream,
  getFileMetadata,
  listFiles,
  deleteFile,
  extractTextContent,
  searchFilesByName,
  createFolder,
} from '../services/googleDriveService.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Get user's Google Drive credentials
 */
async function getUserDriveCredentials(userId: string) {
  const result = await pool.query(
    'SELECT * FROM google_drive_credentials WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

/**
 * Get OAuth2 client with user credentials
 */
async function getAuthenticatedDriveClient(userId: string) {
  const credentials = await getUserDriveCredentials(userId);
  if (!credentials) {
    throw new Error('Google Drive not connected. Please authorize access first.');
  }

  const oauth2Client = createOAuth2Client();
  setCredentials(oauth2Client, credentials.access_token, credentials.refresh_token);
  return oauth2Client;
}

/**
 * Upload file to Google Drive and save reference
 */
export const uploadTrainingFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, tags, description, folderId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const oauth2Client = await getAuthenticatedDriveClient(userId);

    // Upload to Drive
    const driveFile = await uploadFileFromStream(
      oauth2Client,
      req.file.buffer,
      {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        description: description,
        parents: folderId ? [folderId] : undefined,
      }
    );

    // Save file reference
    const fileRef = await pool.query(
      `INSERT INTO drive_file_references
       (user_id, drive_file_id, file_name, mime_type, file_size, web_view_link, web_content_link, thumbnail_link, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        driveFile.id,
        driveFile.name,
        driveFile.mimeType,
        driveFile.size || req.file.size,
        driveFile.webViewLink,
        driveFile.webContentLink,
        driveFile.thumbnailLink,
        description,
      ]
    );

    // Create training data reference if category provided
    if (category) {
      const trainingRef = await pool.query(
        `INSERT INTO training_data_references
         (user_id, drive_file_ref_id, category, tags, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, fileRef.rows[0].id, category, tags || [], description]
      );

      // Extract and cache text content for AI
      try {
        const textContent = await extractTextContent(
          oauth2Client,
          driveFile.id,
          driveFile.mimeType
        );

        await pool.query(
          `INSERT INTO drive_file_content_cache
           (drive_file_ref_id, extracted_text, text_length, extraction_method, cache_valid_until)
           VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
          [fileRef.rows[0].id, textContent, textContent.length, 'direct']
        );
      } catch (error) {
        console.error('Text extraction failed:', error);
      }

      res.status(201).json({
        success: true,
        file: fileRef.rows[0],
        training: trainingRef.rows[0],
        driveFile: driveFile,
      });
    } else {
      res.status(201).json({
        success: true,
        file: fileRef.rows[0],
        driveFile: driveFile,
      });
    }
  } catch (error) {
    console.error('Upload training file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Get all training data references
 */
export const getTrainingData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, active = 'true' } = req.query;

    let query = `
      SELECT
        tdr.*,
        dfr.file_name,
        dfr.mime_type,
        dfr.web_view_link,
        dfr.thumbnail_link,
        dfr.file_size
      FROM training_data_references tdr
      JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
      WHERE tdr.user_id = $1
    `;
    const params: any[] = [userId];

    if (category) {
      params.push(category);
      query += ` AND tdr.category = $${params.length}`;
    }

    if (active === 'true') {
      query += ` AND tdr.is_active = true`;
    }

    query += ' ORDER BY tdr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get training data error:', error);
    res.status(500).json({ error: 'Failed to fetch training data' });
  }
};

/**
 * Get specific training data with cached content
 */
export const getTrainingDataById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        tdr.*,
        dfr.file_name,
        dfr.mime_type,
        dfr.web_view_link,
        dfr.web_content_link,
        dfr.thumbnail_link,
        dfr.file_size,
        dfr.drive_file_id,
        dfc.extracted_text,
        dfc.text_length,
        dfc.extraction_method
      FROM training_data_references tdr
      JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
      LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
      WHERE tdr.id = $1 AND tdr.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training data not found' });
    }

    // Update usage count
    await pool.query(
      'UPDATE training_data_references SET usage_count = usage_count + 1, last_used_at = NOW() WHERE id = $1',
      [id]
    );

    // Log access
    await pool.query(
      `INSERT INTO drive_file_access_log (user_id, drive_file_ref_id, access_type, accessed_by)
       VALUES ($1, $2, $3, $4)`,
      [userId, result.rows[0].drive_file_ref_id, 'view', 'user']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get training data by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch training data' });
  }
};

/**
 * Update training data reference
 */
export const updateTrainingData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { category, tags, description, isActive } = req.body;

    const result = await pool.query(
      `UPDATE training_data_references
       SET category = COALESCE($1, category),
           tags = COALESCE($2, tags),
           description = COALESCE($3, description),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [category, tags, description, isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update training data error:', error);
    res.status(500).json({ error: 'Failed to update training data' });
  }
};

/**
 * Delete training data and optionally the Drive file
 */
export const deleteTrainingData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { deleteDriveFile = false } = req.query;

    // Get training data with file reference
    const result = await pool.query(
      `SELECT tdr.*, dfr.drive_file_id
       FROM training_data_references tdr
       JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
       WHERE tdr.id = $1 AND tdr.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training data not found' });
    }

    const trainingData = result.rows[0];

    // Delete from Drive if requested
    if (deleteDriveFile === 'true') {
      try {
        const oauth2Client = await getAuthenticatedDriveClient(userId);
        await deleteFile(oauth2Client, trainingData.drive_file_id);
      } catch (error) {
        console.error('Failed to delete Drive file:', error);
      }
    }

    // Delete training data reference (cascade will handle related records)
    await pool.query('DELETE FROM training_data_references WHERE id = $1', [id]);

    res.json({ success: true, message: 'Training data deleted' });
  } catch (error) {
    console.error('Delete training data error:', error);
    res.status(500).json({ error: 'Failed to delete training data' });
  }
};

/**
 * Search training data by keywords
 */
export const searchTrainingData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { query: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await pool.query(
      `SELECT
        tdr.*,
        dfr.file_name,
        dfr.mime_type,
        dfr.web_view_link,
        dfr.thumbnail_link,
        dfc.extracted_text
      FROM training_data_references tdr
      JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
      LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
      WHERE tdr.user_id = $1
        AND tdr.is_active = true
        AND (
          dfr.file_name ILIKE $2
          OR tdr.description ILIKE $2
          OR dfc.extracted_text ILIKE $2
          OR $3 = ANY(tdr.tags)
        )
      ORDER BY tdr.usage_count DESC, tdr.created_at DESC
      LIMIT 50`,
      [userId, `%${searchQuery}%`, searchQuery]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search training data error:', error);
    res.status(500).json({ error: 'Failed to search training data' });
  }
};

/**
 * Get Drive files (all user files from Drive)
 */
export const getDriveFiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sync = 'false' } = req.query;

    // If sync requested, fetch from Drive and update DB
    if (sync === 'true') {
      const oauth2Client = await getAuthenticatedDriveClient(userId);
      const driveFiles = await listFiles(oauth2Client);

      // Upsert files into database
      for (const file of driveFiles) {
        await pool.query(
          `INSERT INTO drive_file_references
           (user_id, drive_file_id, file_name, mime_type, file_size, web_view_link, web_content_link, thumbnail_link)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id, drive_file_id)
           DO UPDATE SET
             file_name = EXCLUDED.file_name,
             mime_type = EXCLUDED.mime_type,
             file_size = EXCLUDED.file_size,
             web_view_link = EXCLUDED.web_view_link,
             updated_at = NOW()`,
          [
            userId,
            file.id,
            file.name,
            file.mimeType,
            file.size,
            file.webViewLink,
            file.webContentLink,
            file.thumbnailLink,
          ]
        );
      }
    }

    // Return files from database
    const result = await pool.query(
      'SELECT * FROM drive_file_references WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get Drive files error:', error);
    res.status(500).json({ error: 'Failed to fetch Drive files' });
  }
};

/**
 * Create knowledge base entry from training data
 */
export const createKnowledgeBaseEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { trainingDataRefId, title, content, keywords, relevanceScore, isPublic } = req.body;

    let sourceReference = null;
    let sourceType = 'manual_entry';

    // If linked to training data, get Drive file reference
    if (trainingDataRefId) {
      const trainingData = await pool.query(
        `SELECT dfr.drive_file_id
         FROM training_data_references tdr
         JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
         WHERE tdr.id = $1 AND tdr.user_id = $2`,
        [trainingDataRefId, userId]
      );

      if (trainingData.rows.length > 0) {
        sourceReference = trainingData.rows[0].drive_file_id;
        sourceType = 'drive_file';
      }
    }

    const result = await pool.query(
      `INSERT INTO copilot_knowledge_base
       (user_id, training_data_ref_id, title, content, source_type, source_reference, keywords, relevance_score, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        trainingDataRefId,
        title,
        content,
        sourceType,
        sourceReference,
        keywords || [],
        relevanceScore || 1.0,
        isPublic || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create knowledge base entry error:', error);
    res.status(500).json({ error: 'Failed to create knowledge base entry' });
  }
};

/**
 * Get knowledge base entries
 */
export const getKnowledgeBase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { keyword } = req.query;

    let query = 'SELECT * FROM copilot_knowledge_base WHERE (user_id = $1 OR is_public = true)';
    const params: any[] = [userId];

    if (keyword) {
      params.push(keyword);
      query += ` AND $${params.length} = ANY(keywords)`;
    }

    query += ' ORDER BY relevance_score DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get knowledge base error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
};

/**
 * Create folder for organizing training files
 */
export const createTrainingFolder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { folderName, purpose, parentFolderId } = req.body;

    const oauth2Client = await getAuthenticatedDriveClient(userId);
    const driveFolder = await createFolder(oauth2Client, folderName, parentFolderId);

    const result = await pool.query(
      `INSERT INTO drive_folders (user_id, drive_folder_id, folder_name, parent_folder_id, web_view_link, purpose)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, driveFolder.id, driveFolder.name, parentFolderId, driveFolder.webViewLink, purpose]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create training folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

/**
 * Get training folders
 */
export const getTrainingFolders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT * FROM drive_folders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get training folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

export { upload };
