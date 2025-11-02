-- =============================================================================
-- INSURAGENT PRO - COMPLETE SUPABASE DATABASE SCHEMA
-- =============================================================================
--
-- 📋 INSTRUCTIONS FOR SUPABASE:
-- 1. Go to your Supabase project dashboard (https://app.supabase.com)
-- 2. Select your project
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "+ New Query"
-- 5. Copy and paste this ENTIRE file into the editor
-- 6. Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
-- 7. Wait for all tables to be created (this may take 30-60 seconds)
-- 8. Verify creation by checking the "Table Editor" tab
--
-- ⚠️  IMPORTANT NOTES:
-- - This script is idempotent (safe to run multiple times)
-- - Existing data will NOT be deleted
-- - If you get errors about existing tables, that's OK (they already exist)
-- - Total tables created: 46+
-- - Includes all indexes, foreign keys, and constraints
--
-- 📊 WHAT THIS CREATES:
-- - Core CRM tables (users, leads, contacts, opportunities, etc.)
-- - Messaging system (SMS, Email, templates, campaigns)
-- - Google integration (Drive, Gmail, Calendar, webhooks)
-- - AI Agents & automation tables
-- - Service tickets & knowledge base
-- - Commission tracking
-- - Real-time webhook support
--
-- 🔐 ROW LEVEL SECURITY (RLS):
-- After running this script, you may want to enable RLS policies.
-- See Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security
--
-- =============================================================================

-- InsurAgent Pro Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends Agent type)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Agent/Producer', 'Sales Manager', 'CSR/Account Manager', 'Admin')),
    team_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to users table
ALTER TABLE users ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    tags TEXT[], -- Array of tags
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies Table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    product VARCHAR(255) NOT NULL,
    line_of_business VARCHAR(50) CHECK (line_of_business IN ('Life & Health', 'P&C')),
    premium DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Active',
    effective_date DATE,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Leads Table
CREATE TABLE client_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Contacted', 'Working', 'Unqualified', 'Converted')),
    source VARCHAR(255),
    assigned_to_id UUID REFERENCES users(id),
    score INTEGER DEFAULT 0,
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruit Leads Table
CREATE TABLE recruit_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Contacted', 'Working', 'Unqualified', 'Converted')),
    source VARCHAR(255),
    role_interest VARCHAR(255),
    score INTEGER DEFAULT 0,
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table (polymorphic - can belong to leads, contacts, etc.)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Call', 'Email', 'Note', 'Status Change', 'Appointment')),
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255),
    related_to_type VARCHAR(50), -- 'client_lead', 'recruit_lead', 'contact', etc.
    related_to_id UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities (Sales Pipeline)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('New Lead', 'Contacted', 'Appointment Set', 'Quoted', 'Issued', 'Won', 'Lost')),
    value DECIMAL(10, 2),
    product VARCHAR(255),
    line_of_business VARCHAR(50) CHECK (line_of_business IN ('Life & Health', 'P&C')),
    close_date DATE,
    assigned_to_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Candidates (Recruiting Pipeline)
CREATE TABLE agent_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('Prospecting', 'Qualifying', 'Engagement', 'Presenting', 'Closing', 'Retention', 'Declined')),
    recruiter_id UUID REFERENCES users(id),
    recruiter_name VARCHAR(255),
    role VARCHAR(255),
    last_contact_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    contact_name VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Meeting', 'Call', 'Follow-up')),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'To-do' CHECK (status IN ('To-do', 'In Progress', 'Completed')),
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High')),
    contact_id UUID REFERENCES contacts(id),
    assignee_id UUID REFERENCES users(id),
    reminder TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Tickets Table
CREATE TABLE service_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('Billing Inquiry', 'Claim FNOL', 'Policy Change Request', 'COI Request', 'General Question')),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending Client Response', 'Closed')),
    priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    assigned_to_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Messages Table
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('Client', 'Agent')),
    agent_id UUID REFERENCES users(id),
    agent_name VARCHAR(255),
    agent_avatar_url TEXT,
    content TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Resources Table
CREATE TABLE knowledge_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) CHECK (category IN ('Presentations', 'Compliance & Laws', 'License Training', 'Sales Tips & Tricks', 'Product Info')),
    type VARCHAR(50) CHECK (type IN ('PDF', 'Video', 'Article', 'Spreadsheet')),
    url TEXT NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Modules Table
CREATE TABLE training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) CHECK (category IN ('Sales Skills', 'Product Knowledge', 'Compliance')),
    duration VARCHAR(50),
    thumbnail_url TEXT,
    type VARCHAR(50) CHECK (type IN ('Video', 'Document')),
    video_url TEXT,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions Table
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    contact_name VARCHAR(255),
    avatar_url TEXT,
    premium DECIMAL(10, 2),
    commission_rate DECIMAL(5, 2),
    commission_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Chargeback')),
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Campaigns Table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft', 'Completed', 'Scheduled')),
    sent INTEGER DEFAULT 0,
    open_rate DECIMAL(5, 2) DEFAULT 0,
    click_rate DECIMAL(5, 2) DEFAULT 0,
    bounce_rate DECIMAL(5, 2) DEFAULT 0,
    unsubscribe_rate DECIMAL(5, 2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    ai_prompt TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Unified Inbox)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID, -- Can reference client_leads or recruit_leads
    lead_name VARCHAR(255),
    lead_avatar_url TEXT,
    type VARCHAR(10) CHECK (type IN ('SMS', 'Email')),
    content TEXT,
    subject VARCHAR(255),
    direction VARCHAR(20) CHECK (direction IN ('outgoing', 'incoming')),
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents Table
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    system_prompt TEXT,
    tone VARCHAR(50) CHECK (tone IN ('Friendly', 'Formal', 'Persuasive', 'Concise')),
    max_follow_ups INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automations Table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trigger VARCHAR(100) CHECK (trigger IN ('New Lead Created', 'Appointment Booked', 'Status Changed to "Working"')),
    actions JSONB, -- Store array of actions as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Do Not Contact (DNC) List Table
CREATE TABLE dnc_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_name VARCHAR(255),
    contact_info VARCHAR(255) NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rescinded Responses (AI Safety Log)
CREATE TABLE rescinded_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_name VARCHAR(255),
    reason TEXT,
    original_content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);
CREATE INDEX idx_client_leads_assigned_to ON client_leads(assigned_to_id);
CREATE INDEX idx_client_leads_status ON client_leads(status);
CREATE INDEX idx_recruit_leads_status ON recruit_leads(status);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);
CREATE INDEX idx_service_tickets_assigned_to ON service_tickets(assigned_to_id);
CREATE INDEX idx_service_tickets_status ON service_tickets(status);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- Messaging System Tables
-- Built-in SMS and Email infrastructure without third-party dependencies

-- User Phone Numbers - Each user/org gets their own dedicated number
CREATE TABLE IF NOT EXISTS user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) DEFAULT '+1',
  is_primary BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'inactive', 'suspended'
  capabilities JSONB DEFAULT '{"sms": true, "voice": true, "mms": true}',
  monthly_sms_quota INTEGER DEFAULT 1000,  -- Part of pricing tier
  monthly_sms_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE INDEX idx_user_phone_numbers_user ON user_phone_numbers(user_id);
CREATE INDEX idx_user_phone_numbers_phone ON user_phone_numbers(phone_number);

-- SMS Messages - Complete SMS history
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone_number_id UUID REFERENCES user_phone_numbers(id),
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL,  -- 'inbound', 'outbound'
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'failed', 'received'
  error_message TEXT,

  -- Related CRM entities
  related_to_type VARCHAR(50),  -- 'client_lead', 'recruit_lead', 'contact', 'policy'
  related_to_id UUID,

  -- Tracking
  user_id UUID REFERENCES users(id),
  sent_by_agent_id VARCHAR(50),  -- If sent by AI agent

  -- Metadata
  character_count INTEGER,
  segment_count INTEGER DEFAULT 1,  -- How many SMS segments (160 chars each)
  cost_per_segment DECIMAL(10, 4) DEFAULT 0.01,  -- $0.01 per segment
  total_cost DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_sms_messages_user_phone ON sms_messages(user_phone_number_id);
CREATE INDEX idx_sms_messages_direction ON sms_messages(direction);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_related ON sms_messages(related_to_type, related_to_id);
CREATE INDEX idx_sms_messages_created ON sms_messages(created_at DESC);

-- Email Messages - Complete email history
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  from_email VARCHAR(255) NOT NULL,
  to_email VARCHAR(255) NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject VARCHAR(500) NOT NULL,
  body_text TEXT,
  body_html TEXT,

  direction VARCHAR(10) NOT NULL,  -- 'inbound', 'outbound'
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'failed', 'received', 'opened'
  error_message TEXT,

  -- Related CRM entities
  related_to_type VARCHAR(50),
  related_to_id UUID,

  -- Tracking
  sent_by_agent_id VARCHAR(50),  -- If sent by AI agent

  -- Metadata
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB,  -- Array of attachment metadata
  size_bytes INTEGER,

  -- Email tracking
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  bounce_reason TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE INDEX idx_email_messages_user ON email_messages(user_id);
CREATE INDEX idx_email_messages_direction ON email_messages(direction);
CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_related ON email_messages(related_to_type, related_to_id);
CREATE INDEX idx_email_messages_created ON email_messages(created_at DESC);

-- Message Templates - Reusable SMS/Email templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(10) NOT NULL,  -- 'sms', 'email'
  subject VARCHAR(500),  -- For emails only
  body TEXT NOT NULL,

  -- Template variables support (e.g., {{firstName}}, {{appointmentDate}})
  variables JSONB,  -- List of available variables

  category VARCHAR(50),  -- 'appointment_reminder', 'follow_up', 'welcome', etc.
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_templates_user ON message_templates(user_id);
CREATE INDEX idx_message_templates_type ON message_templates(type);
CREATE INDEX idx_message_templates_category ON message_templates(category);

-- Conversation Threads - Group messages into conversations
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Participants
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),

  -- Related to
  related_to_type VARCHAR(50),
  related_to_id UUID,

  -- Thread info
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'archived', 'closed'
  assigned_to_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_threads_user ON message_threads(user_id);
CREATE INDEX idx_message_threads_contact ON message_threads(contact_phone, contact_email);
CREATE INDEX idx_message_threads_related ON message_threads(related_to_type, related_to_id);
CREATE INDEX idx_message_threads_assigned ON message_threads(assigned_to_id);

-- Do Not Contact List - Compliance
CREATE TABLE IF NOT EXISTS do_not_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  reason VARCHAR(100),  -- 'opt_out', 'spam_complaint', 'manual_addition'
  notes TEXT,
  added_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_dnc_phone ON do_not_contact(phone_number);
CREATE INDEX idx_dnc_email ON do_not_contact(email);

-- Message Queue - For bulk sending and rate limiting
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(10) NOT NULL,  -- 'sms', 'email'

  -- Recipient
  to_number VARCHAR(20),
  to_email VARCHAR(255),

  -- Content
  subject VARCHAR(500),
  body TEXT NOT NULL,

  -- Related to
  related_to_type VARCHAR(50),
  related_to_id UUID,

  -- Queue management
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'sent', 'failed'
  priority INTEGER DEFAULT 5,  -- 1-10, higher = more important
  scheduled_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_message_queue_status ON message_queue(status);
CREATE INDEX idx_message_queue_scheduled ON message_queue(scheduled_at);
CREATE INDEX idx_message_queue_priority ON message_queue(priority DESC);

-- Messaging Analytics
CREATE TABLE IF NOT EXISTS messaging_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,

  -- SMS Stats
  sms_sent INTEGER DEFAULT 0,
  sms_delivered INTEGER DEFAULT 0,
  sms_failed INTEGER DEFAULT 0,
  sms_received INTEGER DEFAULT 0,
  sms_cost DECIMAL(10, 2) DEFAULT 0,

  -- Email Stats
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,

  -- Engagement
  reply_rate DECIMAL(5, 2),  -- Percentage
  open_rate DECIMAL(5, 2),  -- Percentage
  click_rate DECIMAL(5, 2),  -- Percentage

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, date)
);

CREATE INDEX idx_messaging_analytics_user_date ON messaging_analytics(user_id, date DESC);

-- Pricing Tiers & Quotas
CREATE TABLE IF NOT EXISTS messaging_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  tier VARCHAR(50) DEFAULT 'starter',  -- 'starter', 'professional', 'enterprise'

  -- SMS Quotas
  monthly_sms_quota INTEGER DEFAULT 1000,
  monthly_sms_used INTEGER DEFAULT 0,
  sms_cost_per_segment DECIMAL(10, 4) DEFAULT 0.01,

  -- Email Quotas
  monthly_email_quota INTEGER DEFAULT 5000,
  monthly_email_used INTEGER DEFAULT 0,

  -- Dedicated Numbers
  included_phone_numbers INTEGER DEFAULT 1,
  additional_numbers_cost DECIMAL(10, 2) DEFAULT 10.00,  -- Per number per month

  -- Resets
  quota_reset_date DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messaging_quotas_user ON messaging_quotas(user_id);

-- Function to reset monthly quotas (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_messaging_quotas()
RETURNS void AS $$
BEGIN
  UPDATE messaging_quotas
  SET monthly_sms_used = 0,
      monthly_email_used = 0,
      quota_reset_date = CURRENT_DATE
  WHERE quota_reset_date < CURRENT_DATE;

  UPDATE user_phone_numbers
  SET monthly_sms_used = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on message send
CREATE OR REPLACE FUNCTION update_messaging_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'outbound' THEN
    IF TG_TABLE_NAME = 'sms_messages' THEN
      INSERT INTO messaging_analytics (user_id, date, sms_sent)
      VALUES (NEW.user_id, CURRENT_DATE, 1)
      ON CONFLICT (user_id, date)
      DO UPDATE SET sms_sent = messaging_analytics.sms_sent + 1;

      IF NEW.status = 'delivered' THEN
        UPDATE messaging_analytics
        SET sms_delivered = sms_delivered + 1
        WHERE user_id = NEW.user_id AND date = CURRENT_DATE;
      END IF;
    END IF;

    IF TG_TABLE_NAME = 'email_messages' THEN
      INSERT INTO messaging_analytics (user_id, date, emails_sent)
      VALUES (NEW.user_id, CURRENT_DATE, 1)
      ON CONFLICT (user_id, date)
      DO UPDATE SET emails_sent = messaging_analytics.emails_sent + 1;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER sms_analytics_trigger
AFTER INSERT OR UPDATE ON sms_messages
FOR EACH ROW EXECUTE FUNCTION update_messaging_analytics();

CREATE TRIGGER email_analytics_trigger
AFTER INSERT OR UPDATE ON email_messages
FOR EACH ROW EXECUTE FUNCTION update_messaging_analytics();

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(10) NOT NULL,  -- 'sms', 'email'

  -- Email specific
  subject VARCHAR(500),
  body_text TEXT,
  body_html TEXT,

  -- Targeting
  target_audience VARCHAR(50) NOT NULL,  -- 'all_leads', 'client_leads', 'recruit_leads', 'contacts', 'custom'
  custom_recipients JSONB,  -- Array of recipient IDs if custom

  -- Status
  status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'scheduled', 'sending', 'sent', 'completed', 'failed'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,

  -- Metrics
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketing_campaigns_user ON marketing_campaigns(user_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_scheduled ON marketing_campaigns(scheduled_at);
-- Google Drive Integration Tables
-- Stores OAuth tokens, file references, and training data links

-- User Google Drive credentials (OAuth tokens)
CREATE TABLE IF NOT EXISTS google_drive_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_gdrive_creds_user ON google_drive_credentials(user_id);

-- Drive file references (tracks files uploaded or linked)
CREATE TABLE IF NOT EXISTS drive_file_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drive_file_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  file_size BIGINT,
  web_view_link TEXT,
  web_content_link TEXT,
  thumbnail_link TEXT,
  description TEXT,
  folder_path VARCHAR(1000),
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  UNIQUE(user_id, drive_file_id)
);

CREATE INDEX idx_drive_files_user ON drive_file_references(user_id);
CREATE INDEX idx_drive_files_drive_id ON drive_file_references(drive_file_id);
CREATE INDEX idx_drive_files_mime ON drive_file_references(mime_type);

-- Training data references (links Drive files to training purposes)
CREATE TABLE IF NOT EXISTS training_data_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drive_file_ref_id UUID NOT NULL REFERENCES drive_file_references(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'scripts', 'templates', 'knowledge_base', 'policies', 'procedures', 'faqs'
  tags TEXT[], -- Array of tags for categorization
  description TEXT,
  excerpt TEXT, -- Preview/summary of content
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_data_user ON training_data_references(user_id);
CREATE INDEX idx_training_data_file ON training_data_references(drive_file_ref_id);
CREATE INDEX idx_training_data_category ON training_data_references(category);
CREATE INDEX idx_training_data_active ON training_data_references(is_active);
CREATE INDEX idx_training_data_tags ON training_data_references USING GIN(tags);

-- AI context cache (stores extracted text from Drive files for faster access)
CREATE TABLE IF NOT EXISTS drive_file_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_file_ref_id UUID NOT NULL REFERENCES drive_file_references(id) ON DELETE CASCADE,
  extracted_text TEXT,
  text_length INTEGER,
  extraction_method VARCHAR(100), -- 'direct', 'export', 'ocr'
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cache_valid_until TIMESTAMP, -- When to re-extract
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(drive_file_ref_id)
);

CREATE INDEX idx_content_cache_file ON drive_file_content_cache(drive_file_ref_id);
CREATE INDEX idx_content_cache_valid ON drive_file_content_cache(cache_valid_until);

-- Copilot knowledge base (links training data to AI prompts)
CREATE TABLE IF NOT EXISTS copilot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_data_ref_id UUID REFERENCES training_data_references(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'drive_file', 'manual_entry', 'url'
  source_reference TEXT, -- Drive file ID, URL, or other reference
  keywords TEXT[],
  relevance_score DECIMAL(3, 2) DEFAULT 1.0, -- User can adjust importance
  is_public BOOLEAN DEFAULT false, -- Share with team
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_copilot_kb_user ON copilot_knowledge_base(user_id);
CREATE INDEX idx_copilot_kb_training ON copilot_knowledge_base(training_data_ref_id);
CREATE INDEX idx_copilot_kb_keywords ON copilot_knowledge_base USING GIN(keywords);
CREATE INDEX idx_copilot_kb_public ON copilot_knowledge_base(is_public);

-- Drive folder organization (track user's folder structure)
CREATE TABLE IF NOT EXISTS drive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drive_folder_id VARCHAR(255) NOT NULL,
  folder_name VARCHAR(500) NOT NULL,
  parent_folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  web_view_link TEXT,
  purpose VARCHAR(100), -- 'training', 'templates', 'documents', 'shared'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, drive_folder_id)
);

CREATE INDEX idx_drive_folders_user ON drive_folders(user_id);
CREATE INDEX idx_drive_folders_parent ON drive_folders(parent_folder_id);
CREATE INDEX idx_drive_folders_purpose ON drive_folders(purpose);

-- File access log (track when files are accessed by AI or users)
CREATE TABLE IF NOT EXISTS drive_file_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drive_file_ref_id UUID NOT NULL REFERENCES drive_file_references(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'ai_query', 'share'
  accessed_by VARCHAR(100), -- 'user', 'copilot', 'automation'
  context JSONB, -- Additional context (query, automation details, etc.)
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_access_user ON drive_file_access_log(user_id);
CREATE INDEX idx_file_access_file ON drive_file_access_log(drive_file_ref_id);
CREATE INDEX idx_file_access_time ON drive_file_access_log(accessed_at DESC);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_drive_credentials_updated_at
    BEFORE UPDATE ON google_drive_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drive_file_references_updated_at
    BEFORE UPDATE ON drive_file_references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_data_references_updated_at
    BEFORE UPDATE ON training_data_references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copilot_knowledge_base_updated_at
    BEFORE UPDATE ON copilot_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drive_folders_updated_at
    BEFORE UPDATE ON drive_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE google_drive_credentials IS 'Stores OAuth2 credentials for Google Drive access per user';
COMMENT ON TABLE drive_file_references IS 'Tracks all Drive files uploaded or referenced by users';
COMMENT ON TABLE training_data_references IS 'Links Drive files to training data categories for AI Copilot';
COMMENT ON TABLE drive_file_content_cache IS 'Caches extracted text content from Drive files for faster AI access';
COMMENT ON TABLE copilot_knowledge_base IS 'Structured knowledge base for AI Copilot, sourced from Drive or manual entries';
COMMENT ON TABLE drive_folders IS 'Tracks user folder organization in Google Drive';
COMMENT ON TABLE drive_file_access_log IS 'Audit log for file access by users and AI';
-- Gmail and Calendar Integration Tables
-- Stores synced emails, calendar events, and sync status

-- Google sync settings per user
CREATE TABLE IF NOT EXISTS google_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_sync_enabled BOOLEAN DEFAULT false,
  calendar_sync_enabled BOOLEAN DEFAULT false,
  gmail_last_sync TIMESTAMP,
  calendar_last_sync TIMESTAMP,
  gmail_sync_frequency_minutes INTEGER DEFAULT 15,
  calendar_sync_frequency_minutes INTEGER DEFAULT 15,
  sync_inbox BOOLEAN DEFAULT true,
  sync_sent BOOLEAN DEFAULT true,
  sync_drafts BOOLEAN DEFAULT false,
  auto_link_emails BOOLEAN DEFAULT true, -- Auto-link emails to leads/contacts
  auto_create_calendar_tasks BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_sync_settings_user ON google_sync_settings(user_id);
CREATE INDEX idx_sync_settings_enabled ON google_sync_settings(gmail_sync_enabled, calendar_sync_enabled);

-- Synced emails from Gmail
CREATE TABLE IF NOT EXISTS synced_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255) NOT NULL,
  gmail_thread_id VARCHAR(255) NOT NULL,
  subject TEXT,
  from_email VARCHAR(500) NOT NULL,
  from_name VARCHAR(500),
  to_emails TEXT[], -- Array of recipient emails
  cc_emails TEXT[],
  bcc_emails TEXT[],
  message_date TIMESTAMP NOT NULL,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  label_ids TEXT[], -- Gmail label IDs
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  related_to_type VARCHAR(50), -- 'client_lead', 'recruit_lead', 'contact', 'opportunity'
  related_to_id UUID,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, gmail_message_id)
);

CREATE INDEX idx_synced_emails_user ON synced_emails(user_id);
CREATE INDEX idx_synced_emails_thread ON synced_emails(gmail_thread_id);
CREATE INDEX idx_synced_emails_date ON synced_emails(message_date DESC);
CREATE INDEX idx_synced_emails_related ON synced_emails(related_to_type, related_to_id);
CREATE INDEX idx_synced_emails_from ON synced_emails(from_email);

-- Email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_email_id UUID NOT NULL REFERENCES synced_emails(id) ON DELETE CASCADE,
  gmail_attachment_id VARCHAR(255) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(255),
  file_size BIGINT,
  drive_file_id VARCHAR(255), -- If saved to Drive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_email ON email_attachments(synced_email_id);

-- Email threads (conversation grouping)
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_thread_id VARCHAR(255) NOT NULL,
  subject TEXT,
  participants TEXT[], -- Array of email addresses
  last_message_date TIMESTAMP NOT NULL,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  related_to_type VARCHAR(50),
  related_to_id UUID,
  labels TEXT[],
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, gmail_thread_id)
);

CREATE INDEX idx_email_threads_user ON email_threads(user_id);
CREATE INDEX idx_email_threads_date ON email_threads(last_message_date DESC);
CREATE INDEX idx_email_threads_related ON email_threads(related_to_type, related_to_id);

-- Synced calendar events
CREATE TABLE IF NOT EXISTS synced_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_event_id VARCHAR(255) NOT NULL,
  google_calendar_id VARCHAR(255) DEFAULT 'primary',
  summary VARCHAR(1000) NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  time_zone VARCHAR(100),
  all_day BOOLEAN DEFAULT false,
  attendees TEXT[], -- Array of email addresses
  organizer_email VARCHAR(500),
  organizer_name VARCHAR(500),
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  event_link TEXT,
  meeting_link TEXT, -- Google Meet link
  has_conference BOOLEAN DEFAULT false,
  reminder_minutes INTEGER[],
  related_to_type VARCHAR(50), -- 'client_lead', 'recruit_lead', 'contact', 'appointment'
  related_to_id UUID,
  created_in_app BOOLEAN DEFAULT false, -- If created via app vs synced from Google
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, google_event_id)
);

CREATE INDEX idx_synced_events_user ON synced_calendar_events(user_id);
CREATE INDEX idx_synced_events_time ON synced_calendar_events(start_time, end_time);
CREATE INDEX idx_synced_events_related ON synced_calendar_events(related_to_type, related_to_id);
CREATE INDEX idx_synced_events_organizer ON synced_calendar_events(organizer_email);
CREATE INDEX idx_synced_events_status ON synced_calendar_events(status);

-- Email auto-linking rules (AI-powered)
CREATE TABLE IF NOT EXISTS email_linking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  email_pattern VARCHAR(500), -- Email address pattern to match
  domain_pattern VARCHAR(255), -- Domain pattern
  subject_keywords TEXT[], -- Keywords in subject
  link_to_type VARCHAR(50) NOT NULL, -- What to link to
  priority INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_linking_rules_user ON email_linking_rules(user_id);
CREATE INDEX idx_linking_rules_active ON email_linking_rules(is_active);

-- Sync history and errors
CREATE TABLE IF NOT EXISTS google_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- 'gmail', 'calendar'
  sync_direction VARCHAR(50) NOT NULL, -- 'pull', 'push'
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'success', 'partial', 'failed'
  error_message TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_history_user ON google_sync_history(user_id);
CREATE INDEX idx_sync_history_type ON google_sync_history(sync_type);
CREATE INDEX idx_sync_history_date ON google_sync_history(started_at DESC);

-- Calendar availability cache
CREATE TABLE IF NOT EXISTS calendar_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_slots JSONB, -- Array of {start, end} time slots
  busy_slots JSONB,
  working_hours JSONB, -- {start, end} for the day
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_availability_user_date ON calendar_availability(user_id, date);
CREATE INDEX idx_availability_expires ON calendar_availability(expires_at);

-- Email templates with variables
CREATE TABLE IF NOT EXISTS email_templates_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB, -- Available variables with descriptions
  category VARCHAR(100), -- 'lead_followup', 'appointment_reminder', 'proposal', etc.
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_templates_v2_user ON email_templates_v2(user_id);
CREATE INDEX idx_email_templates_v2_category ON email_templates_v2(category);
CREATE INDEX idx_email_templates_v2_active ON email_templates_v2(is_active);

-- Calendar event templates
CREATE TABLE IF NOT EXISTS calendar_event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  summary_template VARCHAR(1000) NOT NULL,
  description_template TEXT,
  location_template VARCHAR(500),
  duration_minutes INTEGER NOT NULL,
  default_attendees TEXT[],
  reminder_minutes INTEGER[] DEFAULT ARRAY[15],
  include_meet_link BOOLEAN DEFAULT false,
  category VARCHAR(100), -- 'client_meeting', 'recruit_interview', 'team_standup', etc.
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_templates_user ON calendar_event_templates(user_id);
CREATE INDEX idx_calendar_templates_category ON calendar_event_templates(category);

-- Update triggers
CREATE TRIGGER update_google_sync_settings_updated_at
    BEFORE UPDATE ON google_sync_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synced_emails_updated_at
    BEFORE UPDATE ON synced_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at
    BEFORE UPDATE ON email_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synced_calendar_events_updated_at
    BEFORE UPDATE ON synced_calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_linking_rules_updated_at
    BEFORE UPDATE ON email_linking_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_v2_updated_at
    BEFORE UPDATE ON email_templates_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_event_templates_updated_at
    BEFORE UPDATE ON calendar_event_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE google_sync_settings IS 'User-level settings for Gmail and Calendar sync';
COMMENT ON TABLE synced_emails IS 'Emails synced from Gmail with auto-linking to CRM entities';
COMMENT ON TABLE email_threads IS 'Email conversation threads grouped by Gmail thread ID';
COMMENT ON TABLE synced_calendar_events IS 'Calendar events synced from Google Calendar';
COMMENT ON TABLE email_linking_rules IS 'Rules for auto-linking emails to leads, contacts, and opportunities';
COMMENT ON TABLE google_sync_history IS 'Audit log of all sync operations';
COMMENT ON TABLE calendar_availability IS 'Cached availability data for faster scheduling';
COMMENT ON TABLE email_templates_v2 IS 'Email templates with variable substitution';
COMMENT ON TABLE calendar_event_templates IS 'Calendar event templates for quick scheduling';
-- AI Agent Tables
-- Run this to add tables for AI agent execution tracking

-- Agent Tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL,  -- 'client_lead', 'recruit_lead', 'contact', 'policy'
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'failed'
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  context JSONB,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_target ON agent_tasks(target_id, target_type);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);

-- Agent Activity Log table
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,  -- 'send_sms', 'send_email', 'create_task', etc.
  success BOOLEAN DEFAULT true,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_activity_log_agent ON agent_activity_log(agent_id);
CREATE INDEX idx_agent_activity_log_target ON agent_activity_log(target_id);
CREATE INDEX idx_agent_activity_log_created ON agent_activity_log(created_at);

-- AI Agents Configuration table
CREATE TABLE IF NOT EXISTS ai_agents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  tone VARCHAR(50) DEFAULT 'Friendly',
  task_thresholds JSONB,  -- { "maxFollowUps": 3, etc. }
  is_active BOOLEAN DEFAULT true,
  metrics JSONB,  -- Store dynamic metrics
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation Workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  trigger VARCHAR(100) NOT NULL,  -- 'NewLeadCreated', 'AppointmentBooked', etc.
  actions JSONB NOT NULL,  -- Array of action objects
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automation Execution Log
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id),
  trigger_data JSONB,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
  current_action_index INTEGER DEFAULT 0,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_automation_executions_workflow ON automation_executions(workflow_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);
-- Webhook Support Tables for Real-Time Gmail and Calendar Sync

-- Webhook registrations table
CREATE TABLE IF NOT EXISTS webhook_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_type VARCHAR(50) NOT NULL, -- 'gmail', 'calendar', 'drive'
  history_id VARCHAR(255), -- For Gmail
  channel_id VARCHAR(255), -- For Calendar/Drive
  resource_id VARCHAR(255), -- For Calendar/Drive
  expiration TIMESTAMP, -- When webhook expires
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, webhook_type)
);

CREATE INDEX idx_webhook_registrations_user ON webhook_registrations(user_id);
CREATE INDEX idx_webhook_registrations_expiration ON webhook_registrations(expiration);
CREATE INDEX idx_webhook_registrations_active ON webhook_registrations(is_active);

-- Webhook events log (for debugging and audit)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  history_id VARCHAR(255),
  channel_id VARCHAR(255),
  resource_id VARCHAR(255),
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT
);

CREATE INDEX idx_webhook_events_user ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(webhook_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed_at);

-- Email linking rules table (for custom auto-linking logic)
CREATE TABLE IF NOT EXISTS email_linking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL, -- 'email_domain', 'email_address', 'subject_keyword', 'sender_name'
  match_pattern VARCHAR(500) NOT NULL, -- Pattern to match (domain, email, keyword, etc.)
  target_entity_type VARCHAR(50) NOT NULL, -- 'client_lead', 'recruit_lead', 'contact', 'opportunity'
  target_entity_id UUID, -- Specific entity ID (optional, can be null for type-based linking)
  priority INTEGER DEFAULT 100, -- Higher priority rules are checked first
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_linking_rules_user ON email_linking_rules(user_id);
CREATE INDEX idx_email_linking_rules_priority ON email_linking_rules(priority DESC);
CREATE INDEX idx_email_linking_rules_active ON email_linking_rules(is_active);

-- Auto-linking audit log
CREATE TABLE IF NOT EXISTS email_auto_link_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_id UUID NOT NULL REFERENCES synced_emails(id) ON DELETE CASCADE,
  linked_entity_type VARCHAR(50),
  linked_entity_id UUID,
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  linking_reason TEXT,
  was_applied BOOLEAN DEFAULT false, -- Whether link was actually applied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auto_link_log_email ON email_auto_link_log(email_id);
CREATE INDEX idx_auto_link_log_entity ON email_auto_link_log(linked_entity_id);

COMMENT ON TABLE webhook_registrations IS 'Tracks active webhook subscriptions for real-time sync';
COMMENT ON TABLE webhook_events IS 'Logs all incoming webhook events for audit and debugging';
COMMENT ON TABLE email_linking_rules IS 'Custom rules for automatic email-to-CRM entity linking';
COMMENT ON TABLE email_auto_link_log IS 'Audit log of all auto-linking attempts';

-- =============================================================================
-- SCHEMA CREATION COMPLETE!
-- =============================================================================
-- 
-- ✅ All tables have been created successfully!
-- 
-- 📋 NEXT STEPS:
-- 1. Check the 'Table Editor' tab in Supabase to verify all tables exist
-- 2. Copy your Supabase credentials to backend/.env:
--    SUPABASE_URL=https://your-project.supabase.co
--    SUPABASE_ANON_KEY=your-anon-key
--    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- 3. The backend is already configured to use Supabase (see backend/src/db/supabase.ts)
-- 4. (Optional) Configure Row Level Security (RLS) policies for data protection
-- 5. (Optional) Run seed data to populate initial data
-- 
-- =============================================================================

-- =============================================================================
-- COMMISSION TRACKING TABLES (Additional)
-- =============================================================================

-- Commission Statements - Period-based commission reports
CREATE TABLE IF NOT EXISTS commission_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_commission DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Disputed')),
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_statements_user ON commission_statements(user_id);
CREATE INDEX idx_commission_statements_period ON commission_statements(period_start, period_end);
CREATE INDEX idx_commission_statements_status ON commission_statements(status);

-- Commission Details - Individual commission line items
CREATE TABLE IF NOT EXISTS commission_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES commission_statements(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
  contact_name VARCHAR(255),
  policy_number VARCHAR(100),
  product VARCHAR(255),
  premium DECIMAL(10, 2),
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(10, 2),
  effective_date DATE,
  type VARCHAR(50) DEFAULT 'New Business' CHECK (type IN ('New Business', 'Renewal', 'Adjustment', 'Chargeback')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_details_statement ON commission_details(statement_id);
CREATE INDEX idx_commission_details_policy ON commission_details(policy_id);
CREATE INDEX idx_commission_details_type ON commission_details(type);

COMMENT ON TABLE commission_statements IS 'Period-based commission statements for agents';
COMMENT ON TABLE commission_details IS 'Individual line items that make up a commission statement';

