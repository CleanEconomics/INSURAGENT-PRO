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
