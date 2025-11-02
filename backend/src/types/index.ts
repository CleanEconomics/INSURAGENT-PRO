import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export enum UserRole {
  AgentProducer = 'Agent/Producer',
  SalesManager = 'Sales Manager',
  CSRAccountManager = 'CSR/Account Manager',
  Admin = 'Admin',
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Working = 'Working',
  Unqualified = 'Unqualified',
  Converted = 'Converted',
}

export enum PipelineStage {
  NewLead = 'New Lead',
  Contacted = 'Contacted',
  AppointmentSet = 'Appointment Set',
  Quoted = 'Quoted',
  Issued = 'Issued',
  Won = 'Won',
  Lost = 'Lost',
}

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Note = 'Note',
  StatusChange = 'Status Change',
  Appointment = 'Appointment',
}

// Google Drive Integration Types
export interface GoogleDriveCredentials {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiryDate?: number;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriveFileReference {
  id: string;
  userId: string;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  description?: string;
  folderPath?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface TrainingDataReference {
  id: string;
  userId: string;
  driveFileRefId: string;
  category: TrainingDataCategory;
  tags: string[];
  description?: string;
  excerpt?: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TrainingDataCategory {
  Scripts = 'scripts',
  Templates = 'templates',
  KnowledgeBase = 'knowledge_base',
  Policies = 'policies',
  Procedures = 'procedures',
  FAQs = 'faqs',
}

export interface DriveFileContentCache {
  id: string;
  driveFileRefId: string;
  extractedText: string;
  textLength: number;
  extractionMethod: 'direct' | 'export' | 'ocr';
  extractedAt: Date;
  cacheValidUntil?: Date;
  createdAt: Date;
}

export interface CopilotKnowledgeBase {
  id: string;
  userId: string;
  trainingDataRefId?: string;
  title: string;
  content: string;
  sourceType: 'drive_file' | 'manual_entry' | 'url';
  sourceReference?: string;
  keywords: string[];
  relevanceScore: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriveFolder {
  id: string;
  userId: string;
  driveFolderId: string;
  folderName: string;
  parentFolderId?: string;
  webViewLink?: string;
  purpose?: 'training' | 'templates' | 'documents' | 'shared';
  createdAt: Date;
  updatedAt: Date;
}

export interface DriveFileAccessLog {
  id: string;
  userId: string;
  driveFileRefId: string;
  accessType: 'view' | 'download' | 'ai_query' | 'share';
  accessedBy: 'user' | 'copilot' | 'automation';
  context?: any;
  accessedAt: Date;
}

// Google Gmail Integration Types
export interface GoogleEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  snippet: string;
  body?: string;
  bodyHtml?: string;
  labelIds?: string[];
  attachments?: EmailAttachment[];
  inReplyTo?: string;
  references?: string[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface EmailThread {
  id: string;
  userId: string;
  threadId: string;
  subject: string;
  participants: string[];
  lastMessageDate: Date;
  messageCount: number;
  relatedToType?: 'client_lead' | 'recruit_lead' | 'contact' | 'opportunity';
  relatedToId?: string;
  labels: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncedEmail {
  id: string;
  userId: string;
  gmailMessageId: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  ccEmails?: string[];
  messageDate: Date;
  snippet: string;
  bodyText?: string;
  bodyHtml?: string;
  labelIds: string[];
  relatedToType?: string;
  relatedToId?: string;
  hasAttachments: boolean;
  attachmentCount: number;
  syncedAt: Date;
}

// Google Calendar Integration Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: CalendarAttendee[];
  organizer?: {
    email: string;
    displayName?: string;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: any;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'accepted' | 'declined' | 'tentative';
  optional?: boolean;
}

export interface SyncedCalendarEvent {
  id: string;
  userId: string;
  googleEventId: string;
  calendarId: string;
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  timeZone: string;
  attendees: string[];
  organizerEmail: string;
  status: string;
  eventLink?: string;
  meetingLink?: string;
  relatedToType?: 'client_lead' | 'recruit_lead' | 'contact' | 'appointment';
  relatedToId?: string;
  reminderMinutes?: number[];
  isAllDay: boolean;
  syncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleSyncStatus {
  userId: string;
  gmailLastSync?: Date;
  calendarLastSync?: Date;
  gmailSyncEnabled: boolean;
  calendarSyncEnabled: boolean;
  emailsSynced: number;
  eventsSynced: number;
  lastSyncError?: string;
}
