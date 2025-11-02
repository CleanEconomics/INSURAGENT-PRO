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
