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
