# InsurAgent Pro - POC Test Call Script

## Pre-Call Checklist

### Environment Setup
- [ ] Both frontend and backend .env files configured with valid credentials
- [ ] Supabase project created and accessible
- [ ] Database schema deployed (run `RUN_THIS_SQL_IN_SUPABASE.sql`)
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] No console errors in browser
- [ ] Successfully logged in to the application

### Demo Data Prepared
- [ ] At least 5 client leads in the system
- [ ] At least 2 recruit leads in the system
- [ ] At least 3 contacts with complete information
- [ ] At least 2 tasks (1 overdue, 1 upcoming)
- [ ] At least 2 calendar appointments
- [ ] At least 1 opportunity in each pipeline stage
- [ ] At least 1 service ticket created
- [ ] At least 1 automation configured

---

## POC Demonstration Flow (30-45 minutes)

### 1. Introduction & Login (2 minutes)

**Script:** 
> "Welcome to InsurAgent Pro, the all-in-one insurance agency management platform. Let me show you how we've revolutionized insurance agency operations with AI-powered automation and comprehensive CRM functionality."

**Actions:**
1. Open browser to `http://localhost:3000`
2. Show the modern login page
3. Log in using email/password OR Google OAuth
4. Highlight the instant loading and session management

**Key Points:**
- Modern, responsive UI
- Secure authentication with Supabase
- Persistent sessions
- Google OAuth option available

---

### 2. Dashboard Overview (3 minutes)

**Script:**
> "The dashboard gives you a bird's-eye view of your agency's performance. Everything you need is right here."

**Actions:**
1. Point out key metrics at the top
2. Show the task list with overdue and upcoming tasks
3. Demonstrate the team performance cards
4. Show recent activity feed
5. Click on a team member to show the agent detail view

**Key Points:**
- Real-time performance metrics
- At-a-glance task management
- Team performance tracking
- Quick access to agent details

---

### 3. Lead Management (5 minutes)

**Script:**
> "Lead management is the heart of any insurance agency. We've made it incredibly easy to manage both client leads and recruiting leads in one place."

**Actions:**
1. Navigate to Leads page
2. Show the two tabs: Client Leads and Recruit Leads
3. Demonstrate filtering by status (New, Contacted, Working, etc.)
4. Click on a lead to show the detail drawer
5. Show the activity timeline
6. Demonstrate sending an SMS or Email directly from the lead view
7. Show the lead scoring (Priority: High/Medium/Low)
8. Convert a lead to an opportunity

**Key Points:**
- Unified lead management
- Built-in communication (SMS & Email)
- Lead scoring and prioritization
- Activity tracking
- One-click conversion to opportunities

---

### 4. Pipeline Management (4 minutes)

**Script:**
> "Our visual pipeline makes it easy to track opportunities from first contact to closed-won. Drag and drop to update stages."

**Actions:**
1. Navigate to Pipeline page
2. Show all pipeline stages (New Lead → Won/Lost)
3. Drag an opportunity from one stage to another
4. Show the value calculation at the bottom of each column
5. Click on an opportunity to show details
6. Filter by Line of Business (P&C vs Life & Health)
7. Show the forecasted close dates

**Key Points:**
- Visual Kanban-style pipeline
- Drag-and-drop stage updates
- Real-time value calculations
- Filtering by product line
- Forecasting capabilities

---

### 5. Contact Management (3 minutes)

**Script:**
> "All your contacts in one place, with powerful search and tagging capabilities."

**Actions:**
1. Navigate to Contacts page
2. Search for a contact by name
3. Show contact details with tags
4. Create a new contact using the + button
5. Demonstrate bulk operations (select multiple, add tags)
6. Show contact import capability (CSV)

**Key Points:**
- Centralized contact database
- Powerful search and filtering
- Tagging system for organization
- Bulk operations
- CSV import for migration

---

### 6. AI Copilot (5 minutes)

**Script:**
> "This is where things get really exciting. Our AI Copilot is your 24/7 assistant, powered by Google Gemini."

**Actions:**
1. Open the Copilot sidebar (bottom right)
2. Ask: "How many leads do I have in the Working status?"
3. Ask: "Create a new client lead named John Smith with email john@example.com"
4. Ask: "Search the Knowledge Hub for TCPA compliance"
5. Ask: "Schedule an appointment with Michael Chen for tomorrow at 2pm"
6. Show how the Copilot provides step-by-step assistance

**Key Points:**
- Natural language interface
- Can create and update leads
- Can schedule appointments
- Searches knowledge base
- Context-aware responses
- Powered by Google Gemini AI

---

### 7. Automation & AI Agents (5 minutes)

**Script:**
> "Automation is what sets InsurAgent Pro apart. Let me show you how we can automate your entire workflow."

**Actions:**
1. Navigate to AI Agents page
2. Show the three pre-configured AI Agents:
   - Appointment Setter Bot
   - Renewal Specialist Bot
   - Client Onboarding Assistant
3. Click "Configure" on the Appointment Setter Bot
4. Show the system prompt customization
5. Show the tone settings (Friendly vs Formal)
6. Navigate to the Automations tab
7. Show the "New Lead Follow-up Sequence" automation
8. Click "Edit" to show the automation builder
9. Demonstrate trigger types (New Lead, Appointment Booked, etc.)
10. Show action types (Send SMS, Send Email, Wait, Add Tag, etc.)
11. Show template variables ({{lead.name}}, {{appointment.date}})

**Key Points:**
- Pre-built AI agents ready to deploy
- Customizable system prompts
- Visual automation builder
- Multiple trigger types
- 8 different action types
- Template variable support
- Active/Inactive toggle

---

### 8. Calendar & Task Management (4 minutes)

**Script:**
> "Stay organized with integrated calendar and task management, with optional Google Calendar sync."

**Actions:**
1. Navigate to Calendar page
2. Show the month view with color-coded appointments
3. Switch to week view and day view
4. Create a new appointment with Google Meet link
5. Show the Google Calendar sync button (if configured)
6. Navigate to Tasks page
7. Filter by status (To-do, In Progress, Completed)
8. Create a new task assigned to a team member
9. Mark a task as complete

**Key Points:**
- Multiple calendar views
- Google Calendar integration
- Automatic Google Meet links
- Task assignment and tracking
- Due date reminders
- Contact linking

---

### 9. Service Tickets (3 minutes)

**Script:**
> "Handle client service requests efficiently with our ticketing system."

**Actions:**
1. Navigate to Service page
2. Show different ticket categories (Billing, Claims, Policy Change, etc.)
3. Show priority levels (Urgent, High, Medium, Low)
4. Click on an urgent ticket (e.g., FNOL - Auto Accident)
5. Show the ticket details and conversation thread
6. Add a response to the ticket
7. Change ticket status from Open to In Progress
8. Show filtering by status and priority

**Key Points:**
- Organized ticket categorization
- Priority-based queue
- Conversation threading
- Status tracking
- Agent assignment
- SLA management

---

### 10. Team & Recruiting (3 minutes)

**Script:**
> "Manage your sales teams and recruit new agents all in one platform."

**Actions:**
1. Navigate to Team page
2. Show team structure with managers and members
3. Click on a team to expand details
4. Show team performance metrics
5. Navigate to Recruiting page
6. Show the recruiting pipeline (Prospecting → Retention)
7. Drag a candidate from one stage to another
8. Show candidate details with role interest

**Key Points:**
- Hierarchical team structure
- Team performance tracking
- Recruiting pipeline visualization
- Candidate stage management
- Role-based organization

---

### 11. Analytics & Reporting (3 minutes)

**Script:**
> "Data-driven decision making with comprehensive analytics."

**Actions:**
1. Navigate to Analytics page
2. Show the revenue chart over time
3. Show conversion funnel visualization
4. Show lead source performance
5. Show agent performance comparison
6. Point out the export capabilities

**Key Points:**
- Real-time analytics
- Multiple visualization types
- Conversion tracking
- Source attribution
- Agent performance metrics
- Exportable reports

---

### 12. Settings & Integrations (2 minutes)

**Script:**
> "Easy configuration and powerful integrations."

**Actions:**
1. Navigate to Settings page
2. Show the Google Calendar integration toggle
3. Show notification preferences
4. Show user profile settings
5. Show the integrations available (Twilio, Gmail, Google Drive)

**Key Points:**
- Simple configuration
- Google Workspace integration
- Notification customization
- API integrations ready

---

### 13. Command Palette (1 minute)

**Script:**
> "For power users, we have a command palette for instant navigation."

**Actions:**
1. Press Cmd+K (Mac) or Ctrl+K (Windows)
2. Type "leads" to show lead search
3. Type "create" to show quick create options
4. Type a contact name to jump directly to their profile

**Key Points:**
- Keyboard shortcuts
- Quick navigation
- Search across all entities
- Power user feature

---

## Closing & Q&A (5 minutes)

**Script:**
> "InsurAgent Pro brings everything you need to run a modern insurance agency into one powerful platform. We've automated the busy work so you can focus on selling and building relationships."

**Key Features to Reiterate:**
- ✅ Complete CRM for insurance agencies
- ✅ AI-powered automation and chatbot
- ✅ Visual pipeline management
- ✅ Integrated communication (SMS & Email)
- ✅ Service ticket management
- ✅ Team and recruiting tools
- ✅ Google Workspace integration
- ✅ Real-time analytics
- ✅ Mobile responsive
- ✅ Secure authentication

**Technical Highlights:**
- Built with React 19 and TypeScript
- Supabase backend (PostgreSQL + Auth)
- Google Gemini AI integration
- Real-time WebSocket updates
- RESTful API architecture
- Production-ready codebase

---

## Backup Scenarios (If Time Permits)

### Marketing & Campaigns
1. Navigate to Marketing page
2. Show email/SMS inbox with threaded conversations
3. Demonstrate bulk messaging capabilities
4. Show campaign templates

### Training & Knowledge Hub
1. Navigate to Training page
2. Show training modules by category
3. Navigate to Knowledge Hub
4. Show resource library with search

### Commissions
1. Navigate to Commissions page
2. Show commission statements
3. Show payment history
4. Show commission calculations

---

## Troubleshooting Common Issues

### Issue: "Missing Supabase environment variables"
**Solution:** Ensure .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Issue: Backend API calls failing
**Solution:** Check backend/.env has correct SUPABASE_URL and SUPABASE_SERVICE_KEY

### Issue: AI Copilot not responding
**Solution:** Verify GEMINI_API_KEY is set in backend/.env

### Issue: Google Calendar not connecting
**Solution:** Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured

### Issue: No data showing after login
**Solution:** Run the SQL schema in Supabase and seed some demo data

---

## Post-Demo Action Items

### For the Client:
- [ ] Provide Supabase project URL and keys
- [ ] Provide Google OAuth credentials (if needed)
- [ ] Provide Twilio credentials (if SMS needed)
- [ ] Provide Gemini API key
- [ ] Confirm deployment environment (AWS, Vercel, etc.)
- [ ] Review and approve data migration plan

### For Development:
- [ ] Set up production environment
- [ ] Configure production database
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and logging
- [ ] Set up backup procedures
- [ ] Perform security audit
- [ ] Conduct load testing
- [ ] Create user training materials

---

## Success Metrics

After the POC, measure:
- ✅ All major features demonstrated successfully
- ✅ No critical bugs encountered
- ✅ Performance acceptable (page loads < 2 seconds)
- ✅ Client understands the value proposition
- ✅ Technical questions answered satisfactorily
- ✅ Clear next steps established

---

**Good luck with your POC! You've got this! 🚀**

