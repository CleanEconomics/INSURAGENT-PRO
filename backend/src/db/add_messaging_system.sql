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
