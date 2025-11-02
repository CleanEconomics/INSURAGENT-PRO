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
