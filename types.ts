

import { FunctionCall } from '@google/genai';

export enum Page {
  Dashboard = 'Dashboard',
  Leads = 'Leads',
  Pipeline = 'Pipeline',
  Contacts = 'Contacts',
  Team = 'Team',
  Recruiting = 'Recruiting',
  Commissions = 'Commissions',
  Inbox = 'Inbox',
  Calendar = 'Calendar',
  Marketing = 'Marketing',
  Analytics = 'Analytics',
  Service = 'Service',
  Training = 'Training',
  Leaderboard = 'Leaderboard',
  Settings = 'Settings',
  KnowledgeHub = 'Knowledge Hub',
  AiAgents = 'AI Agents',
  Tasks = 'Tasks',
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  tags: string[];
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

export enum LineOfBusiness {
    LifeAndHealth = 'Life & Health',
    PC = 'P&C',
}

export interface Opportunity {
  id: string;
  contact: Contact;
  stage: PipelineStage;
  value: number;
  product: string;
  lineOfBusiness: LineOfBusiness;
  closeDate: string;
  assignedToId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'To-do' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  contactId?: string;
  assigneeId?: string;
  // FIX: Added optional properties to support UI features without breaking the core type.
  reminder?: string;
  contact?: Contact;
}

export enum RecruitingStage {
    Prospecting = 'Prospecting',
    Qualifying = 'Qualifying',
    Engagement = 'Engagement',
    Presenting = 'Presenting',
    Closing = 'Closing',
    Retention = 'Retention',
    Declined = 'Declined',
}

export interface AgentCandidate {
    id: string;
    name: string;
    avatarUrl: string;
    stage: RecruitingStage;
    recruiter: string;
    role: string;
    lastContactDate: string;
}

export interface Commission {
    id: string;
    policyId: string;
    contactName: string;
    avatarUrl: string;
    premium: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'Paid' | 'Pending' | 'Chargeback';
    payoutDate: string;
}

export enum TrainingCategory {
  Sales = 'Sales Skills',
  Product = 'Product Knowledge',
  Compliance = 'Compliance',
}

export interface TrainingModule {
  id: string;
  title: string;
  category: TrainingCategory;
  duration: string;
  thumbnailUrl: string;
  type: 'Video' | 'Document';
  required?: boolean;
  videoUrl?: string;
  description?: string;
}


export interface EmailDraft {
  recipient: string;
  subject: string;
  body: string;
}

export interface CampaignPerformanceData {
  hour: string;
  opens: number;
  clicks: number;
}

export interface LinkPerformanceData {
  url: string;
  clicks: number;
}

export interface ClickMapData {
  x: number; // percentage from left
  y: number; // percentage from top
  clicks: number;
}

export interface CampaignReport {
  performanceOverTime: CampaignPerformanceData[];
  clientBreakdown: {
    desktop: number;
    mobile: number;
  };
  linkPerformance: LinkPerformanceData[];
  clickMap: ClickMapData[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'Active' | 'Draft' | 'Completed' | 'Scheduled';
  sent: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  conversions: number;
  lastModified: string;
  scheduledAt?: string | null;
  report?: CampaignReport;
  aiPrompt?: string;
}

export interface CopilotResponse {
  chatResponse?: string;
  functionCalls?: FunctionCall[];
}

export interface Appointment {
  id: string;
  title: string;
  contactName: string;
  start: Date;
  end: Date;
  type: 'Meeting' | 'Call' | 'Follow-up';
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Working = 'Working',
  Unqualified = 'Unqualified',
  Converted = 'Converted',
}

export enum ActivityType {
    Call = 'Call',
    Email = 'Email',
    Note = 'Note',
    StatusChange = 'Status Change',
    Appointment = 'Appointment',
}

export interface Activity {
    id: string;
    type: ActivityType;
    content: string;
    user: string;
    timestamp: string;
}

export interface ClientLead {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  createdAt: string;
  activities: Activity[];
  score: number;
  priority: 'Low' | 'Medium' | 'High';
}

export interface RecruitLead {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  roleInterest: string;
  createdAt: string;
  activities: Activity[];
  score: number;
  priority: 'Low' | 'Medium' | 'High';
}

export interface LeaderboardEntry {
  id: string;
  agentName: string;
  avatarUrl: string;
  policiesSold: number;
  revenue: number;
}

export interface Agent {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Agent/Producer' | 'Sales Manager' | 'CSR/Account Manager';
  teamId?: string;
}

export interface AgentWithStats extends Agent {
  assignedLeads: number;
  closeRate: number;
  recruitsOnboarded: number;
  policiesSold: number;
  revenue: number;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
}

export enum KnowledgeCategory {
  Presentations = 'Presentations',
  Compliance = 'Compliance & Laws',
  Licensing = 'License Training',
  Sales = 'Sales Tips & Tricks',
  Product = 'Product Info',
}

export enum ResourceType {
    PDF = 'PDF',
    Video = 'Video',
    Article = 'Article',
    Spreadsheet = 'Spreadsheet',
}

export interface KnowledgeResource {
    id: string;
    title: string;
    description: string;
    category: KnowledgeCategory;
    type: ResourceType;
    url: string;
    author: string;
    lastUpdated: string;
}

export interface LeadMapping {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  assignedTo?: string; // ClientLead specific
  roleInterest?: string; // RecruitLead specific
}

export interface AiLeadMappingResponse {
  leadType: 'client' | 'recruit';
  mapping: LeadMapping;
}

export interface Message {
  id: string;
  leadId: string;
  leadName: string;
  leadAvatarUrl: string;
  type: 'SMS' | 'Email';
  content: string;
  subject?: string;
  direction: 'outgoing' | 'incoming';
  timestamp: string;
  read: boolean;
}

export interface AiAgent {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    metrics: {
        name: string;
        value: string;
    }[];
    systemPrompt: string;
    tone: 'Friendly' | 'Formal' | 'Persuasive' | 'Concise';
    taskThresholds: {
        maxFollowUps: number;
    };
}

export enum TriggerType {
    NewLeadCreated = 'New Lead Created',
    AppointmentBooked = 'Appointment Booked',
    StatusChangedToWorking = 'Status Changed to "Working"',
    LeadConverted = 'Lead Converted',
    PolicyRenewalDue = 'Policy Renewal Due',
}

export enum ActionType {
    Wait = 'Wait',
    SendSMS = 'Send SMS',
    SendEmail = 'Send Email',
    AddTag = 'Add Tag',
    AssignToAgent = 'Assign to Agent',
    UpdateLeadStatus = 'Update Lead Status',
    CreateTask = 'Create Task',
    SendWebhook = 'Send Webhook',
}

export interface AutomationCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
}

export interface AutomationAction {
    id: string;
    type: ActionType;
    details: string; // e.g., "5 minutes", "Welcome SMS Template", "Contacted"
    conditions?: AutomationCondition[];
}

export interface Automation {
    id: string;
    name: string;
    trigger: TriggerType;
    actions: AutomationAction[];
    isActive: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RescindedResponse {
    id: string;
    timestamp: string;
    leadName: string;
    reason: string;
    originalContent: string;
}

export interface DncEntry {
    id: string;
    contactName: string;
    contactInfo: string;
    dateAdded: string;
}

// Service Desk Types
export enum ServiceTicketCategory {
    Billing = 'Billing Inquiry',
    ClaimFNOL = 'Claim FNOL',
    PolicyChange = 'Policy Change Request',
    COIRequest = 'COI Request',
    General = 'General Question',
}

export enum ServiceTicketStatus {
    Open = 'Open',
    InProgress = 'In Progress',
    PendingClient = 'Pending Client Response',
    Closed = 'Closed',
}

export enum ServiceTicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent',
}

export interface TicketMessage {
    id: string;
    sender: 'Client' | 'Agent';
    agentName?: string;
    agentAvatarUrl?: string;
    content: string;
    timestamp: string;
    isInternalNote?: boolean;
}

export interface ServiceTicket {
    id: string;
    ticketNumber: string;
    contact: Contact;
    subject: string;
    category: ServiceTicketCategory;
    status: ServiceTicketStatus;
    priority: ServiceTicketPriority;
    assignedToId: string;
    createdAt: string;
    lastUpdatedAt: string;
    messages: TicketMessage[];
}
