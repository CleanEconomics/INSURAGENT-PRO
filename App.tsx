

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Contacts from './components/Contacts';
import Recruiting from './components/Recruiting';
import Commissions from './components/Commissions';
import Training from './components/Training';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import Leads from './components/Leads';
import Leaderboard from './components/Leaderboard';
import Team from './components/Team';
import KnowledgeHub from './components/KnowledgeHub';
import AiAgents from './components/AiAgents';
import Service from './components/Service';
import Analytics from './components/Analytics';
import Copilot from './components/Copilot';
import CommandPalette from './components/CommandPalette';
import Tasks from './components/Tasks';
import EmailInbox from './components/EmailInbox';
import { Page, ClientLead, RecruitLead, Opportunity, AgentCandidate, Team as TeamType, Agent, PipelineStage, RecruitingStage, LineOfBusiness, ActivityType, LeadStatus, AgentWithStats, TrainingModule, TrainingCategory, KnowledgeResource, KnowledgeCategory as KnowledgeCategoryEnum, ResourceType, Appointment, Contact, Message, AiAgent, Automation, TriggerType, ActionType, RescindedResponse, DncEntry, ServiceTicket, ServiceTicketCategory, ServiceTicketPriority, ServiceTicketStatus, Task } from './types';
import AgentDetailView from './components/AgentDetailView';
import AiAgentConfigurationModal from './components/AiAgentConfigurationModal';
import AutomationBuilderModal from './components/AutomationBuilderModal';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { leadsApi, contactsApi, tasksApi, appointmentsApi, teamsApi, opportunitiesApi, automationsApi, serviceApi, aiAgentsApi } from './services/api';


const leaderboardData = [
    { id: 'agent3', agentName: 'David Lee', avatarUrl: 'https://picsum.photos/seed/dlee/40/40', policiesSold: 25, revenue: 61500 },
    { id: 'agent1', agentName: 'John Smith', avatarUrl: 'https://picsum.photos/seed/john/40/40', policiesSold: 22, revenue: 56200 },
    { id: 'agent5', agentName: 'Ben Carter', avatarUrl: 'https://picsum.photos/seed/bcarter/40/40', policiesSold: 21, revenue: 53100 },
    { id: 'agent2', agentName: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/maria/40/40', policiesSold: 18, revenue: 48900 },
    { id: 'agent4', agentName: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/agent/40/40', policiesSold: 15, revenue: 42300 },
    { id: 'agent6', agentName: 'Alicia Keys', avatarUrl: 'https://picsum.photos/seed/akeys/40/40', policiesSold: 12, revenue: 31300 },
];


// MOCK DATA CENTRALIZATION
const mockClientLeadsData: ClientLead[] = [
  { id: 'cl1', name: 'Olivia Martinez', avatarUrl: 'https://picsum.photos/seed/omartinez/40/40', email: 'o.martinez@example.com', phone: '555-0107', status: LeadStatus.New, source: 'Web Form', assignedTo: 'Jane Doe', createdAt: '2024-07-29', activities: [ { id: 'act-cl1-1', type: ActivityType.StatusChange, content: 'Lead created.', user: 'System', timestamp: '2024-07-29T10:00:00Z' } ], score: 30, priority: 'Low' },
  { id: 'cl2', name: 'Liam Wilson', avatarUrl: 'https://picsum.photos/seed/lwilson/40/40', email: 'l.wilson@example.com', phone: '555-0108', status: LeadStatus.Contacted, source: 'Referral', assignedTo: 'Jane Doe', createdAt: '2024-07-28', activities: [ { id: 'act-cl2-1', type: ActivityType.StatusChange, content: 'Status changed to Contacted.', user: 'Jane Doe', timestamp: '2024-07-28T14:32:00Z' } ], score: 70, priority: 'High' },
  { id: 'cl3', name: 'Ava Garcia', avatarUrl: 'https://picsum.photos/seed/agarcia/40/40', email: 'a.garcia@example.com', phone: '555-0109', status: LeadStatus.Working, source: 'Facebook Ad', assignedTo: 'John Smith', createdAt: '2024-07-27', activities: [ { id: 'act-cl3-1', type: ActivityType.StatusChange, content: 'Status changed to Working.', user: 'John Smith', timestamp: '2024-07-28T11:00:00Z' } ], score: 40, priority: 'Medium' },
  { id: 'cl4', name: 'Noah Rodriguez', avatarUrl: 'https://picsum.photos/seed/nrod/40/40', email: 'n.rodriguez@example.com', phone: '555-0110', status: LeadStatus.New, source: 'Web Form', assignedTo: 'Jane Doe', createdAt: '2024-07-29', activities: [ { id: 'act-cl4-1', type: ActivityType.StatusChange, content: 'Lead created.', user: 'System', timestamp: '2024-07-29T11:30:00Z' } ], score: 30, priority: 'Low' },
  { id: 'cl5', name: 'Isabella Chen', avatarUrl: 'https://picsum.photos/seed/ichen/40/40', email: 'i.chen@example.com', phone: '555-0111', status: LeadStatus.Unqualified, source: 'Cold Call', assignedTo: 'John Smith', createdAt: '2024-07-26', activities: [ { id: 'act-cl5-1', type: ActivityType.StatusChange, content: 'Status changed to Unqualified.', user: 'John Smith', timestamp: '2024-07-26T16:05:00Z' } ], score: 5, priority: 'Low' },
];

const mockRecruitLeadsData: RecruitLead[] = [
  { id: 'rl1', name: 'Sophia Brown', avatarUrl: 'https://picsum.photos/seed/sbrown/40/40', email: 's.brown@example.com', phone: '555-0112', status: LeadStatus.New, source: 'LinkedIn', roleInterest: 'P&C Producer', createdAt: '2024-07-29', activities: [ { id: 'act-rl1-1', type: ActivityType.StatusChange, content: 'Recruit lead created.', user: 'System', timestamp: '2024-07-29T13:00:00Z' } ], score: 70, priority: 'Medium' },
  { id: 'rl2', name: 'Jackson Miller', avatarUrl: 'https://picsum.photos/seed/jmiller/40/40', email: 'j.miller@example.com', phone: '555-0113', status: LeadStatus.Contacted, source: 'Indeed', roleInterest: 'Life & Health Agent', createdAt: '2024-07-28', activities: [ { id: 'act-rl2-1', type: ActivityType.StatusChange, content: 'Status changed to Contacted.', user: 'Jane Doe', timestamp: '2024-07-29T09:45:00Z' } ], score: 55, priority: 'Low' },
  { id: 'rl3', name: 'Emma Davis', avatarUrl: 'https://picsum.photos/seed/edavis/40/40', email: 'e.davis@example.com', phone: '555-0114', status: LeadStatus.Working, source: 'Referral', roleInterest: 'Account Manager', createdAt: '2024-07-25', activities: [ { id: 'act-rl3-1', type: ActivityType.StatusChange, content: 'Status changed to Working.', user: 'Jane Doe', timestamp: '2024-07-27T10:20:00Z' } ], score: 100, priority: 'High' },
];

const mockContactsData: Contact[] = [
  { id: '1', name: 'Michael Chen', avatarUrl: 'https://picsum.photos/seed/mchen/40/40', email: 'm.chen@example.com', phone: '555-0101', tags: ['High Value', 'Life'] },
  { id: '2', name: 'Samantha Blue', avatarUrl: 'https://picsum.photos/seed/sblue/40/40', email: 's.blue@example.com', phone: '555-0102', tags: ['Referral'] },
  { id: '3', name: 'David Lee', avatarUrl: 'https://picsum.photos/seed/dlee/40/40', email: 'd.lee@example.com', phone: '555-0103', tags: ['P&C'] },
  { id: '4', name: 'Emily White', avatarUrl: 'https://picsum.photos/seed/ewhite/40/40', email: 'e.white@example.com', phone: '555-0104', tags: ['P&C', 'Auto'] },
  { id: '5', name: 'James Green', avatarUrl: 'https://picsum.photos/seed/jgreen/40/40', email: 'j.green@example.com', phone: '555-0105', tags: ['Life', 'Annuity'] },
  { id: '6', name: 'Jessica Taylor', avatarUrl: 'https://picsum.photos/seed/jtaylor/40/40', email: 'j.taylor@example.com', phone: '555-0106', tags: ['New Lead'] },
];

const mockAppointmentsData: Appointment[] = [
  // August 2024
  { id: 'app1', title: 'Review with Michael Chen', contactName: 'Michael Chen', start: new Date(2024, 7, 5, 10, 0), end: new Date(2024, 7, 5, 11, 0), type: 'Meeting' },
  { id: 'app2', title: 'Follow-up call with Samantha Blue', contactName: 'Samantha Blue', start: new Date(2024, 7, 5, 14, 30), end: new Date(2024, 7, 5, 15, 0), type: 'Call' },
  { id: 'app3', title: 'Quote Presentation for David Lee', contactName: 'David Lee', start: new Date(2024, 7, 8, 11, 0), end: new Date(2024, 7, 8, 12, 0), type: 'Meeting' },
  { id: 'app4', title: 'Team Standup', contactName: 'Internal', start: new Date(2024, 7, 12, 9, 0), end: new Date(2024, 7, 12, 9, 15), type: 'Meeting' },
  { id: 'app5', title: 'Finalize application for Emily White', contactName: 'Emily White', start: new Date(2024, 7, 15, 16, 0), end: new Date(2024, 7, 15, 16, 30), type: 'Follow-up' },
  { id: 'app6', title: 'Lunch with Referral Partner', contactName: 'James Green', start: new Date(2024, 7, 21, 12, 30), end: new Date(2024, 7, 21, 13, 30), type: 'Meeting' },
  // July 2024
  { id: 'app7', title: 'Q3 Planning Session', contactName: 'Internal', start: new Date(2024, 6, 29, 10, 0), end: new Date(2024, 6, 29, 12, 0), type: 'Meeting' },
  // September 2024
  { id: 'app8', title: 'New Agent Onboarding', contactName: 'Internal', start: new Date(2024, 8, 2, 9, 0), end: new Date(2024, 8, 2, 11, 0), type: 'Meeting' },
  { id: 'app9', title: 'Follow-up with P&C leads', contactName: 'Multiple', start: new Date(2024, 8, 10, 14, 0), end: new Date(2024, 8, 10, 15, 0), type: 'Follow-up' },
];

const mockOpportunitiesData: Opportunity[] = [
  { id: 'opp1', contact: {id: 'c1', name: 'Michael Chen', avatarUrl: 'https://picsum.photos/seed/mchen/40/40', email: '', phone: '', tags: []}, stage: PipelineStage.NewLead, value: 5000, product: 'Term Life', lineOfBusiness: LineOfBusiness.LifeAndHealth, closeDate: '2024-08-15', assignedToId: 'agent4' },
  { id: 'opp2', contact: {id: 'c2', name: 'Samantha Blue', avatarUrl: 'https://picsum.photos/seed/sblue/40/40', email: '', phone: '', tags: []}, stage: PipelineStage.AppointmentSet, value: 7500, product: 'Whole Life', lineOfBusiness: LineOfBusiness.LifeAndHealth, closeDate: '2024-08-20', assignedToId: 'agent2' },
  { id: 'opp3', contact: {id: 'c3', name: 'David Lee', avatarUrl: 'https://picsum.photos/seed/dlee/40/40', email: '', phone: '', tags: []}, stage: PipelineStage.Quoted, value: 2500, product: 'Auto Insurance', lineOfBusiness: LineOfBusiness.PC, closeDate: '2024-08-10', assignedToId: 'agent3' },
  { id: 'opp4', contact: {id: 'c4', name: 'Emily White', avatarUrl: 'https://picsum.photos/seed/ewhite/40/40', email: '', phone: '', tags: []}, stage: PipelineStage.NewLead, value: 3200, product: 'Homeowners', lineOfBusiness: LineOfBusiness.PC, closeDate: '2024-09-01', assignedToId: 'agent3' },
  { id: 'opp5', contact: {id: 'c5', name: 'James Green', avatarUrl: 'https://picsum.photos/seed/jgreen/40/40', email: '', phone: '', tags: []}, stage: PipelineStage.Contacted, value: 12000, product: 'Annuity', lineOfBusiness: LineOfBusiness.LifeAndHealth, closeDate: '2024-08-25', assignedToId: 'agent4' },
];

const mockCandidatesData: AgentCandidate[] = [
  { id: 'cand1', name: 'Alicia Keys', avatarUrl: 'https://picsum.photos/seed/akeys/40/40', stage: RecruitingStage.Prospecting, recruiter: 'Jane Doe', role: 'P&C Producer', lastContactDate: '2024-07-25' },
  { id: 'cand2', name: 'Ben Carter', avatarUrl: 'https://picsum.photos/seed/bcarter/40/40', stage: RecruitingStage.Qualifying, recruiter: 'Jane Doe', role: 'Life & Health Agent', lastContactDate: '2024-07-28' },
  { id: 'cand3', name: 'Chloe Davis', avatarUrl: 'https://picsum.photos/seed/cdavis/40/40', stage: RecruitingStage.Engagement, recruiter: 'Jane Doe', role: 'Account Manager', lastContactDate: '2024-07-27' },
  { id: 'cand4', name: 'Daniel Evans', avatarUrl: 'https://picsum.photos/seed/devans/40/40', stage: RecruitingStage.Presenting, recruiter: 'Jane Doe', role: 'P&C Producer', lastContactDate: '2024-07-26' },
  { id: 'cand5', name: 'Eva Foster', avatarUrl: 'https://picsum.photos/seed/efoster/40/40', stage: RecruitingStage.Closing, recruiter: 'Jane Doe', role: 'Life & Health Agent', lastContactDate: '2024-07-20' },
  { id: 'cand6', name: 'Frank Green', avatarUrl: 'https://picsum.photos/seed/fgreen/40/40', stage: RecruitingStage.Retention, recruiter: 'Jane Doe', role: 'P&C Producer', lastContactDate: '2024-06-15' },
  { id: 'cand7', name: 'Grace Hall', avatarUrl: 'https://picsum.photos/seed/ghall/40/40', stage: RecruitingStage.Declined, recruiter: 'Jane Doe', role: 'Account Manager', lastContactDate: '2024-07-29' },
];

const mockAgentsData: Agent[] = [
    { id: 'agent1', name: 'John Smith', avatarUrl: 'https://picsum.photos/seed/john/40/40', role: 'Sales Manager' },
    { id: 'agent2', name: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/maria/40/40', role: 'Agent/Producer', teamId: 'team1' },
    { id: 'agent3', name: 'David Lee', avatarUrl: 'https://picsum.photos/seed/dlee/40/40', role: 'Agent/Producer', teamId: 'team1' },
    { id: 'agent4', name: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/agent/40/40', role: 'Sales Manager' },
    { id: 'agent5', name: 'Ben Carter', avatarUrl: 'https://picsum.photos/seed/bcarter/40/40', role: 'Agent/Producer', teamId: 'team2' },
    { id: 'agent6', name: 'Alicia Keys', avatarUrl: 'https://picsum.photos/seed/akeys/40/40', role: 'Agent/Producer', teamId: 'team2' },
];

const getMockTasksData = (agents: Agent[], contacts: Contact[]): Task[] => {
    const janeDoeId = agents.find(a => a.name === 'Jane Doe')?.id || 'agent4';
    const johnSmithId = agents.find(a => a.name === 'John Smith')?.id || 'agent1';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
        { id: 't1', title: 'Follow up with Michael Chen about life insurance quote', description: 'He seemed interested but wanted to discuss with his spouse.', dueDate: today.toISOString().split('T')[0], status: 'To-do', priority: 'High', contactId: '1', assigneeId: janeDoeId },
        { id: 't2', title: 'Prepare presentation for David Lee (P&C renewal)', dueDate: tomorrow.toISOString().split('T')[0], status: 'In Progress', priority: 'High', contactId: '3', assigneeId: johnSmithId },
        { id: 't3', title: 'Call back web lead Emily White', description: 'Submitted form on website yesterday.', dueDate: today.toISOString().split('T')[0], status: 'To-do', priority: 'Medium', contactId: '4', assigneeId: janeDoeId },
        { id: 't4', title: 'Review Q3 sales team performance', dueDate: nextWeek.toISOString().split('T')[0], status: 'To-do', priority: 'Medium', assigneeId: janeDoeId },
        { id: 't5', title: 'Complete annual compliance training', dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0], status: 'Completed', priority: 'Low', assigneeId: janeDoeId },
        { id: 't6', title: 'Schedule renewal review with James Green', dueDate: yesterday.toISOString().split('T')[0], status: 'To-do', priority: 'High', contactId: '5', assigneeId: johnSmithId },
        { id: 't7', title: 'Onboard new agent Alicia Keys', dueDate: tomorrow.toISOString().split('T')[0], status: 'In Progress', priority: 'Medium', assigneeId: janeDoeId, contactId: undefined },
    ];
};


const mockTeamsData: TeamType[] = [
    { id: 'team1', name: 'P&C Powerhouse', managerId: 'agent1', memberIds: ['agent2', 'agent3'] },
    { id: 'team2', name: 'Life & Health Legends', managerId: 'agent4', memberIds: ['agent5', 'agent6'] },
];

const mockTrainingModulesData: TrainingModule[] = [
  { id: 't1', title: 'Mastering the Sales Call', category: TrainingCategory.Sales, duration: '45 min', thumbnailUrl: 'https://picsum.photos/seed/sales1/400/225', type: 'Video', required: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Learn advanced techniques for controlling the conversation and closing more deals over the phone.' },
  { id: 't2', title: 'Understanding Term Life Insurance', category: TrainingCategory.Product, duration: '1 hour', thumbnailUrl: 'https://picsum.photos/seed/prod1/400/225', type: 'Video', required: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'A deep dive into Term Life policies, their benefits, and how to position them to clients.' },
  { id: 't3', title: 'TCPA & DNC Compliance Guide', category: TrainingCategory.Compliance, duration: '30 min', thumbnailUrl: 'https://picsum.photos/seed/comp1/400/225', type: 'Document', required: true, description: 'Stay compliant with federal regulations. This guide covers all you need to know about TCPA and the Do Not Call list.' },
  { id: 't4', title: 'Overcoming Objections', category: TrainingCategory.Sales, duration: '1.5 hours', thumbnailUrl: 'https://picsum.photos/seed/sales2/400/225', type: 'Video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Turn "no" into "yes" with these proven strategies for handling common client objections.' },
  { id: 't5', title: 'Deep Dive into Annuities', category: TrainingCategory.Product, duration: '2 hours', thumbnailUrl: 'https://picsum.photos/seed/prod2/400/225', type: 'Video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Explore the different types of annuities and learn how to identify the right clients for these products.' },
  { id: 't6', title: 'E&O Best Practices', category: TrainingCategory.Compliance, duration: '45 min', thumbnailUrl: 'https://picsum.photos/seed/comp2/400/225', type: 'Document', description: 'Protect yourself and the agency from liability by following these Errors & Omissions best practices.' },
];

const mockKnowledgeResourcesData: KnowledgeResource[] = [
  { id: 'res1', title: 'Q3 Sales Kick-off Presentation', description: 'Slides from the quarterly sales kick-off meeting, covering new targets and strategies.', category: KnowledgeCategoryEnum.Presentations, type: ResourceType.PDF, url: '#', author: 'Jane Doe', lastUpdated: '2024-07-15' },
  { id: 'res2', title: 'Guide to TCPA Compliance', description: 'A comprehensive guide to ensure all outreach activities are compliant with the Telephone Consumer Protection Act.', category: KnowledgeCategoryEnum.Compliance, type: ResourceType.PDF, url: '#', author: 'Compliance Dept.', lastUpdated: '2024-06-30' },
  { id: 'res3', title: 'State License Renewal Walkthrough (CA)', description: 'Step-by-step video guide on renewing your California insurance license through the NIPR.', category: KnowledgeCategoryEnum.Licensing, type: ResourceType.Video, url: '#', author: 'John Smith', lastUpdated: '2024-05-20' },
  { id: 'res4', title: '5 Tips for Overcoming Price Objections', description: 'An article with proven techniques and scripts for handling common price-related objections from prospects.', category: KnowledgeCategoryEnum.Sales, type: ResourceType.Article, url: '#', author: 'Maria Garcia', lastUpdated: '2024-07-22' },
  { id: 'res5', title: 'Term Life vs. Whole Life Comparison', description: 'A detailed spreadsheet comparing the features, benefits, and costs of Term Life and Whole Life policies.', category: KnowledgeCategoryEnum.Product, type: ResourceType.Spreadsheet, url: '#', author: 'Product Team', lastUpdated: '2024-07-01' },
];

const mockAiAgentsData: AiAgent[] = [
    { 
        id: 'agent-1', 
        name: 'Appointment Setter Bot', 
        description: 'Engages new leads via SMS to book an initial consultation on your calendar.', 
        isActive: true, 
        metrics: [{ name: 'Appointments Booked (Month)', value: '28' }],
        systemPrompt: 'You are an AI assistant for an insurance agency. Your goal is to proactively contact new leads, answer their initial questions, and persuade them to book an appointment. Be friendly but persistent. Do not give insurance advice.',
        tone: 'Friendly',
        taskThresholds: { maxFollowUps: 3 }
    },
    { 
        id: 'agent-2', 
        name: 'Renewal Specialist Bot', 
        description: 'Contacts clients 90 days before policy renewal to schedule a review.', 
        isActive: false, 
        metrics: [{ name: 'Policies Renewed (Quarter)', value: '112' }],
        systemPrompt: 'You are an AI assistant for an insurance agency. Your task is to contact existing clients whose policies are up for renewal. Your tone should be formal and professional. Your goal is to schedule a policy review meeting.',
        tone: 'Formal',
        taskThresholds: { maxFollowUps: 2 }
    },
    { 
        id: 'agent-3', 
        name: 'Client Onboarding Assistant', 
        description: 'Sends a welcome email series and document requests to new clients.', 
        isActive: true, 
        metrics: [{ name: 'Clients Onboarded (Month)', value: '7' }],
        systemPrompt: 'You are an AI assistant for an insurance agency. You are responsible for welcoming new clients. Send them a welcome message, explain the next steps, and request any necessary initial documents. Be helpful and clear.',
        tone: 'Friendly',
        taskThresholds: { maxFollowUps: 1 }
    },
];

const mockAutomationsData: Automation[] = [
    { id: 'auto-1', name: 'New Lead Follow-up Sequence', trigger: TriggerType.NewLeadCreated, isActive: true, actions: [
        { id: 'a1-1', type: ActionType.Wait, details: '5 minutes' },
        { id: 'a1-2', type: ActionType.SendSMS, details: 'Hi {{lead.name}}, this is Jane from InsurAgent Pro. Thanks for your interest! Are you free for a quick chat this week?' },
        { id: 'a1-3', type: ActionType.AddTag, details: 'Contacted' },
        { id: 'a1-4', type: ActionType.AssignToAgent, details: 'Jane Doe' },
    ]},
    { id: 'auto-2', name: 'Post-Appointment Nurture', trigger: TriggerType.AppointmentBooked, isActive: false, actions: [
        { id: 'a2-1', type: ActionType.SendEmail, details: 'Subject: Your Appointment is Confirmed!\n\nHi {{lead.name}},\n\nThis is a confirmation that your appointment is booked for {{appointment.date}}. We look forward to speaking with you!\n\nBest,\nJane' },
        { id: 'a2-2', type: ActionType.Wait, details: '1 day' },
        { id: 'a2-3', type: ActionType.SendEmail, details: 'Subject: Following up on our meeting\n\nHi {{lead.name}},\n\nIt was great speaking with you. Let me know if you have any questions.\n\nBest,\nJane' },
    ]}
];

const mockRescindedResponsesData: RescindedResponse[] = [
    { id: 'resp-1', timestamp: '2024-07-30T14:20:00Z', leadName: 'Potential Scammer', reason: 'Detected harmful content (Hate Speech).', originalContent: 'I have a very controversial question about your services.' }
];

const mockDncListData: DncEntry[] = [
    { id: 'dnc1', contactName: 'Aggressive Alex', contactInfo: '(555) 867-5309', dateAdded: '2024-07-30T10:15:00Z' },
    { id: 'dnc2', contactName: 'Uninterested Ursula', contactInfo: 'ursula.u@example.com', dateAdded: '2024-07-29T18:45:00Z' },
    { id: 'dnc3', contactName: 'Spam Sally', contactInfo: '(555) 555-5555', dateAdded: '2024-07-28T11:00:00Z' },
];

const getMockServiceTicketsData = (contacts: Contact[], agents: Agent[]): ServiceTicket[] => [
    { id: 'st1', ticketNumber: 'T202408-001', contact: contacts[0], subject: 'Question about my life insurance policy premium', category: ServiceTicketCategory.Billing, status: ServiceTicketStatus.Open, priority: ServiceTicketPriority.High, assignedToId: agents[3].id, createdAt: '2024-07-30T10:00:00Z', lastUpdatedAt: '2024-07-30T10:00:00Z', messages: [{id: 'stm1-1', sender: 'Client', content: "Hi, I noticed my premium for policy PL1001 went up this month. Can you please explain why?", timestamp: '2024-07-30T10:00:00Z'}]},
    { id: 'st2', ticketNumber: 'T202408-002', contact: contacts[2], subject: 'Need a Certificate of Insurance for my business', category: ServiceTicketCategory.COIRequest, status: ServiceTicketStatus.InProgress, priority: ServiceTicketPriority.Medium, assignedToId: agents[2].id, createdAt: '2024-07-29T14:30:00Z', lastUpdatedAt: '2024-07-30T09:15:00Z', messages: [{id: 'stm2-1', sender: 'Client', content: "I need a COI for 'David's Designs LLC' sent to corporate@example.com.", timestamp: '2024-07-29T14:30:00Z'}, {id: 'stm2-2', sender: 'Agent', agentName: agents[2].name, agentAvatarUrl: agents[2].avatarUrl, content: 'I am working on this and will have it sent over shortly.', timestamp: '2024-07-30T09:15:00Z'}]},
    { id: 'st3', ticketNumber: 'T202408-003', contact: contacts[3], subject: 'FNOL - Auto Accident', category: ServiceTicketCategory.ClaimFNOL, status: ServiceTicketStatus.Open, priority: ServiceTicketPriority.Urgent, assignedToId: agents[1].id, createdAt: '2024-07-30T11:00:00Z', lastUpdatedAt: '2024-07-30T11:00:00Z', messages: [{id: 'stm3-1', sender: 'Client', content: 'I was just in a minor car accident. Please call me back ASAP at 555-0104.', timestamp: '2024-07-30T11:00:00Z'}]},
    { id: 'st4', ticketNumber: 'T202407-004', contact: contacts[4], subject: 'Add new vehicle to auto policy', category: ServiceTicketCategory.PolicyChange, status: ServiceTicketStatus.Closed, priority: ServiceTicketPriority.Medium, assignedToId: agents[3].id, createdAt: '2024-07-28T16:00:00Z', lastUpdatedAt: '2024-07-29T12:00:00Z', messages: [{id: 'stm4-1', sender: 'Client', content: 'Need to add my new car.', timestamp: '2024-07-28T16:00:00Z'}, {id: 'stm4-2', sender: 'Agent', agentName: agents[3].name, agentAvatarUrl: agents[3].avatarUrl, content: 'All set! Your new ID cards are attached.', timestamp: '2024-07-29T12:00:00Z'}]},
    { id: 'st5', ticketNumber: 'T202407-005', contact: contacts[1], subject: 'Update mailing address', category: ServiceTicketCategory.PolicyChange, status: ServiceTicketStatus.PendingClient, priority: ServiceTicketPriority.Low, assignedToId: agents[2].id, createdAt: '2024-07-27T09:00:00Z', lastUpdatedAt: '2024-07-27T09:30:00Z', messages: [{id: 'stm5-1', sender: 'Client', content: 'My address has changed.', timestamp: '2024-07-27T09:00:00Z'}, {id: 'stm5-2', sender: 'Agent', agentName: agents[2].name, agentAvatarUrl: agents[2].avatarUrl, content: 'Can you please provide the new address?', timestamp: '2024-07-27T09:30:00Z'}]}
];

const App: React.FC = () => {
  console.log('App component rendering...');
  const { isAuthenticated, loading } = useAuth();
  console.log('Auth state:', { isAuthenticated, loading });

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Centralized State - START WITH EMPTY ARRAYS, LOAD FROM BACKEND
  const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);
  const [recruitLeads, setRecruitLeads] = useState<RecruitLead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [candidates, setCandidates] = useState<AgentCandidate[]>(mockCandidatesData); // Keep mock for now (no API yet)
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(mockTrainingModulesData); // Keep mock (no API)
  const [knowledgeResources, setKnowledgeResources] = useState<KnowledgeResource[]>(mockKnowledgeResourcesData); // Keep mock (no API)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiAgents, setAiAgents] = useState<AiAgent[]>([]); // NOW LOADS FROM BACKEND (Phase 4)
  const [automations, setAutomations] = useState<Automation[]>([]); // NOW LOADS FROM BACKEND (Phase 3)
  const [rescindedResponses, setRescindedResponses] = useState<RescindedResponse[]>(mockRescindedResponsesData); // Keep mock
  const [dncList, setDncList] = useState<DncEntry[]>(mockDncListData); // Keep mock
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([]); // Empty, Phase 4
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void; }; } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStats | null>(null);
  const [selectedAiAgent, setSelectedAiAgent] = useState<AiAgent | null>(null);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  // ALL HOOKS INCLUDING useMemo, useEffect, useCallback MUST BE BEFORE CONDITIONAL RETURNS
  const agentsWithStats: AgentWithStats[] = useMemo(() => {
    return agents.map(agent => {
        const assignedLeadsCount = clientLeads.filter(lead => lead.assignedTo === agent.name && lead.status !== LeadStatus.Converted).length;
        const agentOpportunities = opportunities.filter(opp => opp.assignedToId === agent.id);
        const wonOpps = agentOpportunities.filter(opp => opp.stage === PipelineStage.Won).length;
        const lostOpps = agentOpportunities.filter(opp => opp.stage === PipelineStage.Lost).length;
        const totalClosed = wonOpps + lostOpps;
        const closeRate = totalClosed > 0 ? Math.round((wonOpps / totalClosed) * 100) : 0;
        const recruitsOnboardedCount = candidates.filter(c => c.recruiter === agent.name).length;
        const leaderboardStats = leaderboardData.find(entry => entry.id === agent.id);

        return {
            ...agent,
            assignedLeads: assignedLeadsCount,
            closeRate: closeRate,
            recruitsOnboarded: recruitsOnboardedCount,
            policiesSold: leaderboardStats?.policiesSold || 0,
            revenue: leaderboardStats?.revenue || 0,
        };
    });
  }, [agents, clientLeads, opportunities, candidates]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
      if (toast) {
          const timer = setTimeout(() => setToast(null), 4000);
          return () => clearTimeout(timer);
      }
  }, [toast]);

  // Load data from backend after authentication
  useEffect(() => {
    if (isAuthenticated && !dataLoading) {
      setDataLoading(true);
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      console.log('Loading data from backend...');

      // Phase 1, 3 & 4: Load all data from backend
      const [
        clientLeadsRes,
        recruitLeadsRes,
        contactsRes,
        tasksRes,
        appointmentsRes,
        teamsRes,
        opportunitiesRes,
        automationsRes,
        serviceTicketsRes,
        aiAgentsRes
      ] = await Promise.all([
        leadsApi.getClientLeads().catch(err => { console.error('Failed to load client leads:', err); return { data: [] }; }),
        leadsApi.getRecruitLeads().catch(err => { console.error('Failed to load recruit leads:', err); return { data: [] }; }),
        contactsApi.getAll().catch(err => { console.error('Failed to load contacts:', err); return { data: [] }; }),
        tasksApi.getAll().catch(err => { console.error('Failed to load tasks:', err); return { data: [] }; }),
        appointmentsApi.getAll().catch(err => { console.error('Failed to load appointments:', err); return { data: [] }; }),
        teamsApi.getAll().catch(err => { console.error('Failed to load teams:', err); return { data: [] }; }),
        opportunitiesApi.getAll().catch(err => { console.error('Failed to load opportunities:', err); return { data: [] }; }),
        automationsApi.getAll().catch(err => { console.error('Failed to load automations:', err); return { data: [] }; }),
        serviceApi.getTickets().catch(err => { console.error('Failed to load service tickets:', err); return { data: [] }; }),
        aiAgentsApi.getAll().catch(err => { console.error('Failed to load AI agents:', err); return { data: [] }; }),
      ]);

      // Set state with loaded data
      if (clientLeadsRes.data) setClientLeads(clientLeadsRes.data);
      if (recruitLeadsRes.data) setRecruitLeads(recruitLeadsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (appointmentsRes.data) {
        // Convert date strings to Date objects for appointments
        const appts = appointmentsRes.data.map((apt: any) => ({
          ...apt,
          start: new Date(apt.start),
          end: new Date(apt.end),
        }));
        setAppointments(appts);
      }
      if (teamsRes.data) setTeams(teamsRes.data);
      if (opportunitiesRes.data) setOpportunities(opportunitiesRes.data);
      if (automationsRes.data) setAutomations(automationsRes.data);
      if (serviceTicketsRes.data) setServiceTickets(serviceTicketsRes.data);
      if (aiAgentsRes.data) setAiAgents(aiAgentsRes.data);

      // Load agents separately (from teams API)
      try {
        const agentsRes = await teamsApi.getAgents();
        if (agentsRes.data) setAgents(agentsRes.data);
      } catch (err) {
        console.error('Failed to load agents:', err);
      }

      console.log('Data loaded successfully!');
      setDataLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setDataLoading(false);
      setToast({ message: 'Failed to load some data. Please refresh the page.' });
    }
  };

  // NOW conditional returns are safe (all hooks called above)
  if (loading || dataLoading) {
    return <LoadingSpinner fullPage message={loading ? "Loading application..." : "Loading your data..."} />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // AI Copilot Handlers
  const handleSearchKnowledgeHub = (query: string): KnowledgeResource[] | string => {
    const results = knowledgeResources.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
    );
    return results.length > 0 ? results : `No results found in the Knowledge Hub for "${query}".`;
  };

  const handleCreateClientLead = async (details: { name: string, email: string, phone?: string, source?: string }): Promise<{ success: boolean, message: string, leadId?: string }> => {
    try {
      const newLead: Partial<ClientLead> = {
        name: details.name,
        avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(details.name)}/40/40`,
        email: details.email,
        phone: details.phone || 'N/A',
        status: LeadStatus.New,
        source: details.source || 'AI Copilot',
        assignedTo: 'Jane Doe', // Current user
        activities: [{ id: 'act1', type: ActivityType.StatusChange, content: 'Lead created by AI Copilot.', user: 'AI Copilot', timestamp: new Date().toISOString() }],
        score: 30,
        priority: 'Low',
      };
      const response = await leadsApi.createClientLead(newLead);
      // Reload leads to get fresh data
      const leadsRes = await leadsApi.getClientLeads();
      if (leadsRes.data) setClientLeads(leadsRes.data);
      return { success: true, message: `Successfully created client lead for ${details.name}.`, leadId: response.data.id };
    } catch (error) {
      console.error('Failed to create client lead:', error);
      return { success: false, message: 'Failed to create client lead. Please try again.' };
    }
  };

  const handleUpdateClientLead = (details: { leadName: string, newStatus?: LeadStatus, newPhone?: string, newEmail?: string }): { success: boolean, message: string } => {
      let leadFound = false;
      let updateMessages: string[] = [];
      setClientLeads(prev => prev.map(lead => {
          if (lead.name.toLowerCase() === details.leadName.toLowerCase()) {
              leadFound = true;
              if (details.newStatus) { lead.status = details.newStatus; updateMessages.push(`status to ${details.newStatus}`); }
              if (details.newPhone) { lead.phone = details.newPhone; updateMessages.push(`phone to ${details.newPhone}`); }
              if (details.newEmail) { lead.email = details.newEmail; updateMessages.push(`email to ${details.newEmail}`); }
          }
          return lead;
      }));

      if (leadFound) {
          return { success: true, message: `Updated ${details.leadName}: set ${updateMessages.join(', ')}.` };
      } else {
          return { success: false, message: `Could not find a client lead named ${details.leadName}.` };
      }
  };
  
  const handleCreateRecruitLead = (details: { name: string, email: string, phone?: string, source?: string, roleInterest: string }): { success: boolean, message: string, leadId?: string } => {
    const newId = `rl${Date.now()}`;
    const newLead: RecruitLead = {
        id: newId,
        name: details.name,
        avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(details.name)}/40/40`,
        email: details.email,
        phone: details.phone || 'N/A',
        status: LeadStatus.New,
        source: details.source || 'AI Copilot',
        roleInterest: details.roleInterest,
        createdAt: new Date().toISOString(),
        activities: [{ id: 'act1', type: ActivityType.StatusChange, content: 'Recruit lead created by AI Copilot.', user: 'AI Copilot', timestamp: new Date().toISOString() }],
        score: 45,
        priority: 'Medium',
    };
    setRecruitLeads(prev => [newLead, ...prev]);
    return { success: true, message: `Successfully created recruit lead for ${details.name}.`, leadId: newId };
  };

  const handleUpdateRecruitLead = (details: { leadName: string, newStatus?: LeadStatus, newPhone?: string, newEmail?: string }): { success: boolean, message: string } => {
      let leadFound = false;
      let updateMessages: string[] = [];
      setRecruitLeads(prev => prev.map(lead => {
          if (lead.name.toLowerCase() === details.leadName.toLowerCase()) {
              leadFound = true;
              if (details.newStatus) { lead.status = details.newStatus; updateMessages.push(`status to ${details.newStatus}`); }
              if (details.newPhone) { lead.phone = details.newPhone; updateMessages.push(`phone to ${details.newPhone}`); }
              if (details.newEmail) { lead.email = details.newEmail; updateMessages.push(`email to ${details.newEmail}`); }
          }
          return lead;
      }));

      if (leadFound) {
          return { success: true, message: `Updated ${details.leadName}: set ${updateMessages.join(', ')}.` };
      } else {
          return { success: false, message: `Could not find a recruit lead named ${details.leadName}.` };
      }
  };

  const handleScheduleAppointment = (details: { leadName: string, title: string, startDateTimeISO: string, durationMinutes: number }): { success: boolean, message: string, appointmentId?: string } => {
      const startDate = new Date(details.startDateTimeISO);
      const endDate = new Date(startDate.getTime() + details.durationMinutes * 60000);
      const newId = `app${Date.now()}`;

      const newAppointment: Appointment = {
          id: newId,
          title: details.title,
          contactName: details.leadName,
          start: startDate,
          end: endDate,
          type: 'Meeting',
      };
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.start.getTime() - b.start.getTime()));
      
      const zoomLink = "https://zoom.us/j/1234567890"; // Hardcoded as requested
      return { success: true, message: `Appointment scheduled for ${details.leadName}. A Zoom link has been sent: ${zoomLink}`, appointmentId: newId };
  };


  const handleGoogleCalendarConnect = () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => { setIsGoogleCalendarConnected(true); resolve(); }, 1500);
    });
  };
  
  // FIX: Added missing 'handleDisconnectGoogleCalendar' function to resolve reference error.
  const handleGoogleCalendarDisconnect = () => { setIsGoogleCalendarConnected(false); };

  // Handlers for state updates - NOW WITH BACKEND API CALLS
  const handleUpdateLead = async (updatedLead: ClientLead | RecruitLead) => {
    try {
      if ('assignedTo' in updatedLead) {
        // Client Lead
        await leadsApi.updateClientLead(updatedLead.id, updatedLead);
        setClientLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      } else {
        // Recruit Lead
        await leadsApi.updateRecruitLead(updatedLead.id, updatedLead);
        setRecruitLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      setToast({ message: 'Failed to update lead. Please try again.' });
    }
  };
  
  const handleAddBulkLeads = async (newLeads: { clients: ClientLead[], recruits: RecruitLead[] }) => {
    try {
      // Create all client leads
      for (const lead of newLeads.clients) {
        await leadsApi.createClientLead(lead);
      }
      // Create all recruit leads
      for (const lead of newLeads.recruits) {
        await leadsApi.createRecruitLead(lead);
      }
      // Reload data to get fresh from backend
      await loadAllData();
      setToast({ message: `✅ Successfully imported ${newLeads.clients.length + newLeads.recruits.length} leads!` });
    } catch (error) {
      console.error('Failed to import leads:', error);
      setToast({ message: 'Failed to import some leads. Please try again.' });
    }
  };

  const handleConvertClientLead = (leadToConvert: ClientLead, opportunityDetails: { value: number; product: string; }) => {
    setClientLeads(prev => prev.map(lead => lead.id === leadToConvert.id ? { ...lead, status: LeadStatus.Converted } : lead));
    
    const newOpportunity: Opportunity = {
        id: `opp${opportunities.length + 1}`,
        contact: { id: `contact-${leadToConvert.id}`, name: leadToConvert.name, avatarUrl: leadToConvert.avatarUrl, email: leadToConvert.email, phone: leadToConvert.phone, tags: [] },
        stage: PipelineStage.Contacted,
        value: opportunityDetails.value,
        product: opportunityDetails.product,
        lineOfBusiness: opportunityDetails.product.toLowerCase().includes('auto') || opportunityDetails.product.toLowerCase().includes('home') ? LineOfBusiness.PC : LineOfBusiness.LifeAndHealth,
        closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        assignedToId: agents.find(a => a.name === leadToConvert.assignedTo)?.id || 'agent4', // Match assignee or default
    };
    setOpportunities(prev => [newOpportunity, ...prev]);

    setToast({ message: "Lead converted to Opportunity!", action: { label: "View in Pipeline", onClick: () => setActivePage(Page.Pipeline) } });
  };

  const handleConvertRecruitLead = (leadToConvert: RecruitLead) => {
    setRecruitLeads(prev => prev.map(lead => lead.id === leadToConvert.id ? { ...lead, status: LeadStatus.Converted } : lead));

    const newCandidate: AgentCandidate = {
      id: `cand${candidates.length + 1}`,
      name: leadToConvert.name,
      avatarUrl: leadToConvert.avatarUrl,
      stage: RecruitingStage.Qualifying, // Start them in the new pipeline
      recruiter: 'Jane Doe', // This would be the current user
      role: leadToConvert.roleInterest,
      lastContactDate: new Date().toISOString().split('T')[0],
    };
    setCandidates(prev => [newCandidate, ...prev]);

    setToast({ message: "Recruit converted to Candidate!", action: { label: "View in Recruiting", onClick: () => setActivePage(Page.Recruiting) } });
  };

  const handleAddAppointment = (newAppointment: Omit<Appointment, 'id'>) => {
    const appointmentWithId: Appointment = {
        ...newAppointment,
        id: `app${appointments.length + 1}`,
    };
    setAppointments(prev => [...prev, appointmentWithId].sort((a,b) => a.start.getTime() - b.start.getTime()));
    setToast({ message: '✅ Appointment created successfully!' });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setToast({ message: '✅ Task updated!' });
  };

  const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
      const newTask: Task = {
          ...newTaskData,
          id: `task-${Date.now()}`,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setToast({ message: '✅ Task created successfully!' });
  };

    const handleSendMessage = (lead: ClientLead | RecruitLead, type: 'SMS' | 'Email', content: string, subject?: string) => {
    // 1. Create new Activity
    const newActivity = {
      id: `act-${lead.id}-${lead.activities.length + 1}`,
      type: type === 'Email' ? ActivityType.Email : ActivityType.Call, // Using Call for SMS
      content: type === 'Email' ? `Email Sent: "${subject}"` : `SMS Sent: "${content.substring(0, 30)}..."`,
      user: 'Jane Doe',
      timestamp: new Date().toISOString(),
    };
    const updatedLead = { ...lead, activities: [newActivity, ...lead.activities] };
    handleUpdateLead(updatedLead);

    // 2. Create new Message for log
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      leadAvatarUrl: lead.avatarUrl,
      type,
      content,
      subject,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [newMessage, ...prev]);
    
    // 3. Show Toast
    setToast({ message: `✅ ${type} sent successfully to ${lead.name}!` });
    
    // 4. Simulate reply
    setTimeout(() => {
        const replyContent = type === 'SMS' 
            ? 'Thanks for reaching out! When is a good time to talk?'
            : 'Thank you for the email. I have received it and will get back to you shortly.\n\nBest,\n' + lead.name;
        
        const replyMessage: Message = {
             id: `msg-${Date.now() + 1}`,
             leadId: lead.id,
             leadName: lead.name,
             leadAvatarUrl: lead.avatarUrl,
             type,
             content: replyContent,
             subject: subject ? `Re: ${subject}`: undefined,
             direction: 'incoming',
             timestamp: new Date().toISOString(),
             read: false,
        };
        setMessages(prev => [replyMessage, ...prev]);
        setToast({ message: `📬 New reply from ${lead.name}!` });
    }, 15000); // 15-second delay for reply
};

  const handleSaveAiAgentConfig = (updatedAgent: AiAgent) => {
    setAiAgents(prev => prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent));
    setSelectedAiAgent(null);
  };
  
  const handleOpenAutomationModal = (automation: Automation | null) => {
    setEditingAutomation(automation);
    setIsAutomationModalOpen(true);
  };

  const handleSaveAutomation = async (automationToSave: Automation) => {
    try {
      const exists = automations.some(a => a.id === automationToSave.id);
      if (exists) {
        // Update existing automation
        await automationsApi.update(automationToSave.id, automationToSave);
        setAutomations(prev => prev.map(a => a.id === automationToSave.id ? automationToSave : a));
        setToast({ message: '✅ Automation updated successfully!' });
      } else {
        // Create new automation
        const response = await automationsApi.create(automationToSave);
        setAutomations(prev => [...prev, response.data]);
        setToast({ message: '✅ Automation created successfully!' });
      }
      setIsAutomationModalOpen(false);
    } catch (error) {
      console.error('Failed to save automation:', error);
      setToast({ message: 'Failed to save automation. Please try again.' });
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      await automationsApi.delete(automationId);
      setAutomations(prev => prev.filter(a => a.id !== automationId));
      setToast({ message: '✅ Automation deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete automation:', error);
      setToast({ message: 'Failed to delete automation. Please try again.' });
    }
  };

  const handleCreateTicket = async (newTicketData: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'lastUpdatedAt' | 'messages'>) => {
    try {
      const response = await serviceApi.createTicket(newTicketData);
      setServiceTickets(prev => [response.data, ...prev]);
      setToast({ message: `✅ Ticket ${response.data.ticketNumber} created successfully!` });
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setToast({ message: 'Failed to create ticket. Please try again.' });
    }
  };

  const handleUpdateTicket = async (updatedTicket: ServiceTicket) => {
    try {
      await serviceApi.updateTicket(updatedTicket.id, updatedTicket);
      setServiceTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...updatedTicket, lastUpdatedAt: new Date().toISOString() } : t));
      setToast({ message: '✅ Ticket updated successfully!' });
    } catch (error) {
      console.error('Failed to update ticket:', error);
      setToast({ message: 'Failed to update ticket. Please try again.' });
    }
  };

  // Teams CRUD handlers with backend API integration
  const handleCreateTeam = async (newTeamData: Omit<TeamType, 'id'>) => {
    try {
      const response = await teamsApi.create(newTeamData);
      setTeams(prev => [...prev, response.data]);
      setToast({ message: '✅ Team created successfully!' });
      return response.data;
    } catch (error) {
      console.error('Failed to create team:', error);
      setToast({ message: 'Failed to create team. Please try again.' });
      return null;
    }
  };

  const handleUpdateTeam = async (id: string, updatedTeamData: Partial<TeamType>) => {
    try {
      const response = await teamsApi.update(id, updatedTeamData);
      setTeams(prev => prev.map(t => t.id === id ? response.data : t));
      setToast({ message: '✅ Team updated successfully!' });
    } catch (error) {
      console.error('Failed to update team:', error);
      setToast({ message: 'Failed to update team. Please try again.' });
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await teamsApi.delete(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      setToast({ message: '✅ Team deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete team:', error);
      setToast({ message: 'Failed to delete team. Please try again.' });
    }
  };

  // Opportunities CRUD handlers with backend API integration
  const handleCreateOpportunity = async (newOpportunityData: Omit<Opportunity, 'id'>) => {
    try {
      const response = await opportunitiesApi.create(newOpportunityData);
      setOpportunities(prev => [...prev, response.data]);
      setToast({ message: '✅ Opportunity created successfully!' });
      return response.data;
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      setToast({ message: 'Failed to create opportunity. Please try again.' });
      return null;
    }
  };

  const handleUpdateOpportunity = async (id: string, updatedOpportunityData: Partial<Opportunity>) => {
    try {
      const response = await opportunitiesApi.update(id, updatedOpportunityData);
      setOpportunities(prev => prev.map(o => o.id === id ? response.data : o));
      setToast({ message: '✅ Opportunity updated successfully!' });
    } catch (error) {
      console.error('Failed to update opportunity:', error);
      setToast({ message: 'Failed to update opportunity. Please try again.' });
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      await opportunitiesApi.delete(id);
      setOpportunities(prev => prev.filter(o => o.id !== id));
      setToast({ message: '✅ Opportunity deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      setToast({ message: 'Failed to delete opportunity. Please try again.' });
    }
  };

  // PHASE 2: Contact handlers with backend API integration
  const handleAddContact = async (newContact: Omit<Contact, 'id'>) => {
    try {
      const response = await contactsApi.create(newContact);
      setContacts(prev => [...prev, response.data]);
      setToast({ message: '✅ Contact added successfully!' });
    } catch (error) {
      console.error('Failed to add contact:', error);
      setToast({ message: 'Failed to add contact. Please try again.' });
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      await contactsApi.update(updatedContact.id, updatedContact);
      setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
      setToast({ message: '✅ Contact updated successfully!' });
    } catch (error) {
      console.error('Failed to update contact:', error);
      setToast({ message: 'Failed to update contact. Please try again.' });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await contactsApi.delete(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setToast({ message: '✅ Contact deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      setToast({ message: 'Failed to delete contact. Please try again.' });
    }
  };

  const handleBulkDeleteContacts = async (contactIds: string[]) => {
    try {
      // Delete all contacts in parallel
      await Promise.all(contactIds.map(id => contactsApi.delete(id)));
      setContacts(prev => prev.filter(c => !contactIds.includes(c.id)));
      setToast({ message: `✅ ${contactIds.length} contacts deleted successfully!` });
    } catch (error) {
      console.error('Failed to delete contacts:', error);
      setToast({ message: 'Failed to delete some contacts. Please try again.' });
    }
  };


  const renderContent = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard agentsWithStats={agentsWithStats} setSelectedAgent={setSelectedAgent} tasks={tasks} setActivePage={setActivePage} />;
      case Page.Leads:
        return <Leads 
                clientLeads={clientLeads}
                recruitLeads={recruitLeads}
                onUpdateLead={handleUpdateLead}
                onConvertClientLead={handleConvertClientLead}
                onConvertRecruitLead={handleConvertRecruitLead}
                onAddBulkLeads={handleAddBulkLeads}
                onSendMessage={(lead, type, content, subject) => handleSendMessage(lead, type, content, subject)}
                setToast={setToast}
               />;
      case Page.Pipeline:
        return <Pipeline opportunities={opportunities} setOpportunities={setOpportunities} />;
      case Page.Contacts:
        return <Contacts
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onUpdateContact={handleUpdateContact}
                  onDeleteContact={handleDeleteContact}
                  onBulkDelete={handleBulkDeleteContacts}
                />;
      case Page.Team:
        return <Team 
                  teams={teams} setTeams={setTeams}
                  agentsWithStats={agentsWithStats} 
                  setAgents={setAgents}
                  setSelectedAgent={setSelectedAgent}
               />;
      case Page.Recruiting:
        return <Recruiting candidates={candidates} setCandidates={setCandidates} />;
      case Page.Commissions:
        return <Commissions />;
      case Page.Leaderboard:
        return <Leaderboard agentsWithStats={agentsWithStats} setSelectedAgent={setSelectedAgent} />;
      case Page.Training:
        return <Training trainingModules={trainingModules} setTrainingModules={setTrainingModules} />;
      case Page.KnowledgeHub:
        return <KnowledgeHub knowledgeResources={knowledgeResources} setKnowledgeResources={setKnowledgeResources} />;
      case Page.Marketing:
        return <Marketing 
                    messages={messages} 
                    setMessages={setMessages}
                    onSendMessage={handleSendMessage}
                    allLeads={[...clientLeads, ...recruitLeads]}
                />;
      case Page.Analytics:
        return <Analytics
                  opportunities={opportunities}
                  clientLeads={clientLeads}
                  agentsWithStats={agentsWithStats}
                  teams={teams}
                />;
      case Page.Calendar:
        return <Calendar 
                    isGoogleCalendarConnected={isGoogleCalendarConnected} 
                    setActivePage={setActivePage}
                    appointments={appointments}
                    contacts={contacts}
                    onAddAppointment={handleAddAppointment}
                />;
      case Page.Inbox:
        return <EmailInbox />;
      case Page.Tasks:
        return <Tasks 
                  tasks={tasks}
                  agents={agents}
                  contacts={contacts}
                  onUpdateTask={handleUpdateTask}
                  onCreateTask={handleCreateTask}
                  setToast={setToast}
               />;
      case Page.AiAgents:
        return <AiAgents 
                  agents={aiAgents} setAgents={setAiAgents} 
                  automations={automations} setAutomations={setAutomations}
                  rescindedResponses={rescindedResponses}
                  dncList={dncList}
                  onConfigureAgent={setSelectedAiAgent}
                  onEditAutomation={handleOpenAutomationModal}
                  onDeleteAutomation={handleDeleteAutomation}
                />;
      case Page.Service:
        return <Service
                  tickets={serviceTickets}
                  agents={agents}
                  contacts={contacts}
                  onCreateTicket={handleCreateTicket}
                  onUpdateTicket={handleUpdateTicket}
                />;
      case Page.Settings:
        return <Settings 
                 isGoogleCalendarConnected={isGoogleCalendarConnected}
                 onConnectGoogleCalendar={handleGoogleCalendarConnect}
                 onDisconnectGoogleCalendar={handleGoogleCalendarDisconnect}
               />;
      default:
        return <div className="p-8"><h1 className="text-2xl">Coming Soon</h1><p>The {activePage} page is under construction.</p></div>;
    }
  };

  const Toast = () => {
    if (!toast) return null;
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-4 z-50">
            <span>{toast.message}</span>
            {toast.action && (
                <button onClick={toast.action.onClick} className="font-bold underline hover:text-secondary-light">
                    {toast.action.label}
                </button>
            )}
        </div>
    );
  };


  return (
    <div className="flex h-screen bg-background font-sans text-textPrimary">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header 
          activePage={activePage} 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <Copilot
        activePage={activePage}
        handleSearchKnowledgeHub={handleSearchKnowledgeHub}
        handleCreateClientLead={handleCreateClientLead}
        handleUpdateClientLead={handleUpdateClientLead}
        handleCreateRecruitLead={handleCreateRecruitLead}
        handleUpdateRecruitLead={handleUpdateRecruitLead}
        handleScheduleAppointment={handleScheduleAppointment}
        knowledgeResources={knowledgeResources}
        clientLeads={clientLeads}
        recruitLeads={recruitLeads}
      />
      <Toast />
      {selectedAgent && (
        <AgentDetailView
            agent={selectedAgent}
            opportunities={opportunities}
            clientLeads={clientLeads}
            onClose={() => setSelectedAgent(null)}
        />
      )}
      {selectedAiAgent && (
        <AiAgentConfigurationModal
            agent={selectedAiAgent}
            onSave={handleSaveAiAgentConfig}
            onClose={() => setSelectedAiAgent(null)}
        />
      )}
       {isAutomationModalOpen && (
        <AutomationBuilderModal
            automationToEdit={editingAutomation}
            onSave={handleSaveAutomation}
            onClose={() => setIsAutomationModalOpen(false)}
        />
      )}
      {isCommandPaletteOpen && (
        <CommandPalette 
          onClose={() => setIsCommandPaletteOpen(false)} 
          setActivePage={setActivePage}
          contacts={[...clientLeads, ...recruitLeads]}
        />
      )}
    </div>
  );
};

export default App;
