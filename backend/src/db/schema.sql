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
