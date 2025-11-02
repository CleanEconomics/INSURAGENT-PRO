import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google Drive Service
 * Handles file uploads, downloads, and management in Google Drive
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  thumbnailLink?: string;
}

export interface DriveFileMetadata {
  name: string;
  mimeType: string;
  description?: string;
  parents?: string[];
}

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Create OAuth2 client for Google Drive API
 */
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
  );
}

/**
 * Generate authorization URL for OAuth flow
 */
export function getAuthorizationUrl(oauth2Client: OAuth2Client, state?: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: state,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(oauth2Client: OAuth2Client, code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Set credentials for OAuth2 client
 */
export function setCredentials(oauth2Client: OAuth2Client, accessToken: string, refreshToken?: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

/**
 * Upload a file to Google Drive
 */
export async function uploadFileToDrive(
  oauth2Client: OAuth2Client,
  fileBuffer: Buffer,
  metadata: DriveFileMetadata
): Promise<GoogleDriveFile> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const media = {
    mimeType: metadata.mimeType,
    body: fileBuffer,
  };

  const response = await drive.files.create({
    requestBody: {
      name: metadata.name,
      mimeType: metadata.mimeType,
      description: metadata.description,
      parents: metadata.parents,
    },
    media: media,
    fields: 'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,thumbnailLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
    size: response.data.size || undefined,
    thumbnailLink: response.data.thumbnailLink || undefined,
  };
}

/**
 * Upload file from stream
 */
export async function uploadFileFromStream(
  oauth2Client: OAuth2Client,
  stream: any,
  metadata: DriveFileMetadata
): Promise<GoogleDriveFile> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const media = {
    mimeType: metadata.mimeType,
    body: stream,
  };

  const response = await drive.files.create({
    requestBody: {
      name: metadata.name,
      mimeType: metadata.mimeType,
      description: metadata.description,
      parents: metadata.parents,
    },
    media: media,
    fields: 'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,thumbnailLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
    size: response.data.size || undefined,
    thumbnailLink: response.data.thumbnailLink || undefined,
  };
}

/**
 * Get file metadata from Google Drive
 */
export async function getFileMetadata(
  oauth2Client: OAuth2Client,
  fileId: string
): Promise<GoogleDriveFile> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.get({
    fileId: fileId,
    fields: 'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,thumbnailLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
    size: response.data.size || undefined,
    thumbnailLink: response.data.thumbnailLink || undefined,
  };
}

/**
 * Download file content from Google Drive
 */
export async function downloadFile(
  oauth2Client: OAuth2Client,
  fileId: string
): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

/**
 * Download file as text (for documents)
 */
export async function downloadFileAsText(
  oauth2Client: OAuth2Client,
  fileId: string
): Promise<string> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'text' }
  );

  return response.data as string;
}

/**
 * Export Google Docs/Sheets/Slides to specific format
 */
export async function exportFile(
  oauth2Client: OAuth2Client,
  fileId: string,
  mimeType: string
): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.export(
    { fileId: fileId, mimeType: mimeType },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

/**
 * List files in Drive (with optional query)
 */
export async function listFiles(
  oauth2Client: OAuth2Client,
  query?: string,
  pageSize: number = 100
): Promise<GoogleDriveFile[]> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    q: query,
    pageSize: pageSize,
    fields: 'files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,thumbnailLink)',
    orderBy: 'modifiedTime desc',
  });

  return (response.data.files || []).map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    webViewLink: file.webViewLink || undefined,
    webContentLink: file.webContentLink || undefined,
    createdTime: file.createdTime!,
    modifiedTime: file.modifiedTime!,
    size: file.size || undefined,
    thumbnailLink: file.thumbnailLink || undefined,
  }));
}

/**
 * Search files by name
 */
export async function searchFilesByName(
  oauth2Client: OAuth2Client,
  fileName: string
): Promise<GoogleDriveFile[]> {
  const query = `name contains '${fileName}' and trashed=false`;
  return listFiles(oauth2Client, query);
}

/**
 * Search files by MIME type
 */
export async function searchFilesByType(
  oauth2Client: OAuth2Client,
  mimeType: string
): Promise<GoogleDriveFile[]> {
  const query = `mimeType='${mimeType}' and trashed=false`;
  return listFiles(oauth2Client, query);
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFile(
  oauth2Client: OAuth2Client,
  fileId: string
): Promise<void> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  await drive.files.delete({ fileId: fileId });
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  oauth2Client: OAuth2Client,
  fileId: string,
  metadata: Partial<DriveFileMetadata>
): Promise<GoogleDriveFile> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.update({
    fileId: fileId,
    requestBody: {
      name: metadata.name,
      description: metadata.description,
    },
    fields: 'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,thumbnailLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
    size: response.data.size || undefined,
    thumbnailLink: response.data.thumbnailLink || undefined,
  };
}

/**
 * Create a folder in Google Drive
 */
export async function createFolder(
  oauth2Client: OAuth2Client,
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : undefined,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id,name,mimeType,webViewLink,createdTime,modifiedTime',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    webViewLink: response.data.webViewLink || undefined,
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
  };
}

/**
 * Share file with specific user or make public
 */
export async function shareFile(
  oauth2Client: OAuth2Client,
  fileId: string,
  email?: string,
  role: 'reader' | 'writer' | 'commenter' = 'reader',
  type: 'user' | 'anyone' = 'user'
): Promise<void> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      type: type,
      role: role,
      emailAddress: email,
    },
  });
}

/**
 * Get file permissions
 */
export async function getFilePermissions(
  oauth2Client: OAuth2Client,
  fileId: string
): Promise<any[]> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.permissions.list({
    fileId: fileId,
    fields: 'permissions(id,type,role,emailAddress)',
  });

  return response.data.permissions || [];
}

/**
 * Extract text content from various file types for AI processing
 */
export async function extractTextContent(
  oauth2Client: OAuth2Client,
  fileId: string,
  mimeType: string
): Promise<string> {
  // Google Docs - export as plain text
  if (mimeType === 'application/vnd.google-apps.document') {
    return await exportFile(oauth2Client, fileId, 'text/plain').then(buf => buf.toString('utf-8'));
  }

  // Google Sheets - export as CSV
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    return await exportFile(oauth2Client, fileId, 'text/csv').then(buf => buf.toString('utf-8'));
  }

  // Plain text files
  if (mimeType.startsWith('text/')) {
    return await downloadFileAsText(oauth2Client, fileId);
  }

  // PDF files - return as base64 (for future OCR integration)
  if (mimeType === 'application/pdf') {
    const buffer = await downloadFile(oauth2Client, fileId);
    return `[PDF Content - ${buffer.length} bytes - OCR not yet implemented]`;
  }

  // For other types, return file info
  const metadata = await getFileMetadata(oauth2Client, fileId);
  return `[File: ${metadata.name} (${mimeType}) - Content extraction not supported]`;
}
