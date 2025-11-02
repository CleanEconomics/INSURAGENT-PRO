# InsurAgent Pro

**The Complete AI-Powered Insurance Agency Management Platform**

Built specifically for insurance agencies to replace 10+ disconnected tools with one modern, intelligent platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (for database & auth)
- Google Gemini API key (for AI features)

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
```

### 2. Configure Environment Variables

The following secrets are already configured in Replit Secrets:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend only)
- `GEMINI_API_KEY` - Google Gemini AI API key
- `JWT_SECRET` - JWT signing secret

A `.env` file has been created to expose these to the frontend via Vite.

### 3. Set Up Database (CRITICAL)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `SUPABASE_COMPLETE_SCHEMA.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Run the SQL to create all 61+ tables

**The app will not work properly until the database schema is set up!**

### 4. Start Development Servers

Both servers are configured to run automatically:
- Frontend: `http://localhost:5000` (Vite + React)
- Backend: `http://localhost:3001` (Express + Node.js)

### 5. Access the Application

Open the Webview preview to see the application running on port 5000.

**Default Login:** Create an account using the Sign Up link on the login page.

---

## ✨ Features

### Core CRM
- **Dashboard** - KPIs, charts, activity feed, team leaderboard
- **Lead Management** - Client leads & recruit leads with scoring
- **Visual Pipeline** - Drag-and-drop Kanban for opportunities
- **Contact Management** - Complete 360° client view
- **Tasks** - Priority-based task management
- **Calendar** - Appointments with Google Calendar sync

### Team & Performance
- **Team Management** - Hierarchy, roles, and assignments
- **Recruiting Pipeline** - 7-stage candidate tracking
- **Commissions** - Track payouts and chargebacks
- **Leaderboard** - Real-time agent rankings
- **Analytics** - Performance dashboards and reports

### Communication & Marketing
- **Email Inbox** - Gmail integration with threading
- **Marketing Campaigns** - Email campaign builder with AI
- **Service Desk** - Ticketing system for client requests
- **Unified Messaging** - SMS/Email from one interface

### AI & Automation
- **AI Copilot** - Natural language CRM control (14 functions)
- **AI Agents** - Pre-configured bots (Appointment Setter, Renewal Specialist, etc.)
- **Automation Builder** - Visual workflow automation
- **Smart Lead Routing** - Automatic assignment and follow-ups

### Training & Knowledge
- **Training Modules** - Video and document-based learning
- **Knowledge Hub** - Searchable resource library
- **Compliance Tracking** - Required training monitoring

---

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for lightning-fast dev server
- **Tailwind CSS** for modern, responsive UI
- **Supabase** for authentication
- **Socket.IO** for real-time updates
- **Recharts** for data visualization

### Backend
- **Node.js + Express** with TypeScript
- **PostgreSQL** via Supabase
- **Google Gemini AI** for intelligent automation
- **WebSocket** server for real-time features
- **Cron jobs** for automation execution

### Database
- **61+ tables** covering all insurance workflows
- **Supabase (PostgreSQL)** with Row Level Security
- **Real-time subscriptions** for live updates
- **Full-text search** for knowledge base

---

## 📦 Technology Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| UI Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| AI | Google Gemini Pro |
| Real-time | Socket.IO |
| SMS | Twilio (optional) |
| Email | SendGrid (optional) |

---

## 📁 Project Structure

```
insuragent-pro/
├── components/           # React components
│   ├── Dashboard.tsx
│   ├── Leads.tsx
│   ├── Pipeline.tsx
│   ├── Contacts.tsx
│   ├── EmailInbox.tsx
│   └── ... (20+ components)
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── services/            # API services
│   ├── api/            # Backend API calls
│   └── geminiService.ts
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── jobs/       # Automation jobs
│   └── package.json
├── types.ts             # TypeScript types
├── App.tsx              # Main app component
├── index.tsx            # Entry point
└── tailwind.config.js   # Tailwind config
```

---

## 🔧 Configuration

### Optional Integrations

To enable all features, add these optional secrets:

- `GOOGLE_CLIENT_ID` - For Google Calendar/Gmail sync
- `GOOGLE_CLIENT_SECRET` - For OAuth flow
- `TWILIO_ACCOUNT_SID` - For SMS messaging
- `TWILIO_AUTH_TOKEN` - For SMS authentication
- `SENDGRID_API_KEY` - For transactional emails

---

## 🎯 Key Differentiators

### 1. Insurance-Specific
Unlike generic CRMs like Salesforce or HubSpot, InsurAgent Pro is built **exclusively for insurance agencies** with:
- Lines of business tracking (Auto, Home, Life, Health, Commercial)
- Policy renewal automation
- Commission calculation
- Agent recruiting pipeline
- Compliance features (TCPA, E&O)

### 2. AI-Powered
- Natural language interface to control the CRM
- AI agents that automate repetitive conversations
- Smart lead scoring and routing
- AI-assisted email drafting

### 3. All-in-One
Replace 10+ tools:
- ❌ Generic CRM + ❌ AMS + ❌ Email + ❌ Calendar + ❌ Tasks + ❌ SMS + ❌ Marketing + ❌ Recruiting + ❌ Commissions + ❌ Training + ❌ Analytics
- ✅ **InsurAgent Pro**

### 4. Modern UX
- Clean, intuitive interface agents love to use
- Mobile-responsive design
- Real-time updates
- Keyboard shortcuts (Cmd/Ctrl+K for command palette)

---

## 🚦 Current Implementation Status

### ✅ Fully Implemented
- [x] Complete authentication system
- [x] All 18 main pages with modern UI
- [x] Dashboard with KPIs and charts
- [x] Lead management (client & recruit)
- [x] Pipeline Kanban board
- [x] Contact management
- [x] Task management
- [x] Calendar with appointments
- [x] Team management
- [x] Recruiting pipeline
- [x] Commissions tracking
- [x] Email inbox UI
- [x] Marketing campaigns UI
- [x] Service ticketing
- [x] AI Copilot interface
- [x] AI Agents configuration
- [x] Automation builder UI
- [x] Training modules
- [x] Knowledge hub
- [x] Analytics dashboards
- [x] Settings page

### 🔄 Needs Backend Connection
- [ ] Real-time WebSocket updates
- [ ] File upload/download
- [ ] Google Calendar sync
- [ ] Gmail integration
- [ ] SMS sending via Twilio
- [ ] Campaign execution
- [ ] Automation job processing
- [ ] PDF report generation

### 📝 Database Setup Required
- [ ] Run SUPABASE_COMPLETE_SCHEMA.sql
- [ ] Seed with test data (optional)
- [ ] Configure Row Level Security policies

---

## 🐛 Troubleshooting

### App Shows Blank Screen
- **Fixed!** Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check browser console for errors
- Verify Supabase credentials are correct

### "Missing Supabase environment variables" Error
- Run `echo $SUPABASE_URL` to verify secrets are set in Replit
- Restart the frontend workflow after adding secrets

### Database Errors
- Ensure you've run `SUPABASE_COMPLETE_SCHEMA.sql` in your Supabase SQL Editor
- Check that all 61+ tables were created successfully

### Gmail/Calendar Not Working
- These require Google OAuth setup
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets
- Configure OAuth redirect URLs in Google Cloud Console

---

## 📚 Documentation

- `replit.md` - Replit-specific setup and status
- `SUPABASE_COMPLETE_SCHEMA.sql` - Complete database schema
- `SETUP_STATUS.md` - Detailed implementation status
- `attached_assets/` - Product overview and complete guide (1649 lines)

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs in browser DevTools
3. Check backend logs in Replit console

---

## 📄 License

Proprietary - All rights reserved

---

## 🎉 Getting Started

1. **Set up the database** (see step 3 above)
2. **Create an account** via the Sign Up link
3. **Explore the demo data** to see all features
4. **Customize** for your insurance agency's needs

**Welcome to InsurAgent Pro - Your insurance agency's new operating system!** 🚀
