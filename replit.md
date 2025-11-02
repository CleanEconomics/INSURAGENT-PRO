# InsurAgent Pro - Replit Setup

## Project Overview
Complete insurance agency management platform with AI-powered CRM, automation, and analytics.

## Current Status  
✅ Frontend running on port 5000 - **FULLY FUNCTIONAL**  
✅ Backend running on port 3001  
✅ Dependencies installed (including lucide-react)  
✅ Environment secrets configured  
✅ .env file created with Vite variables  
✅ Login page with modern gradient UI  
✅ All 19 main pages implemented and working  
✅ Enhanced lead scoring with visual indicators  
✅ Dashboard with conversion funnel & pipeline metrics  
✅ New Policies page for policy management  
✅ Comprehensive documentation (README.md)  
⚠️  Database schema needs to be set up (SUPABASE_COMPLETE_SCHEMA.sql)  
⚠️  Backend integrations need real data connections  

## Recent Enhancements (Latest Session)
1. **Lead Scoring** - Color-coded progress bars (0-100) with automatic clamping
2. **Dashboard Analytics** - Conversion funnel chart + pipeline value by stage
3. **Policies Page** - Complete policy management with renewal tracking
4. **Navigation** - Integrated Policies into sidebar and routing
5. **Documentation** - Comprehensive README with setup guide  

## Required Setup Steps

### 1. Database Setup (CRITICAL - DO THIS FIRST)
**Status:** ❌ Not Done  
**Action Required:**
1. Go to your Supabase project dashboard (https://app.supabase.com)
2. Navigate to SQL Editor
3. Copy the entire contents of `SUPABASE_COMPLETE_SCHEMA.sql`
4. Paste into SQL Editor and run
5. This creates all 61+ tables needed for the application

**Note:** The app will not work properly until this is done!

### 2. Test Data (Optional but Recommended)
After creating the schema, you can seed the database with test data:
```bash
cd backend && node seed-database.mjs
```

## Architecture

### Frontend (Port 5000)
- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- Supabase for auth
- Socket.IO for real-time updates

### Backend (Port 3001)
- Node.js + Express + TypeScript  
- PostgreSQL via Supabase
- Google Gemini AI
- WebSocket server
- Automation job processor

## Environment Variables

### Required (Already Configured)
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `GEMINI_API_KEY` ✅
- `JWT_SECRET` ✅

### Optional (For Full Features)
- `GOOGLE_CLIENT_ID` - For Google Calendar/Gmail sync
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `TWILIO_ACCOUNT_SID` - For SMS functionality  
- `TWILIO_AUTH_TOKEN` - For SMS functionality
- `SENDGRID_API_KEY` - For email sending

## Key Features

### Implemented ✅
- Login/Registration
- Dashboard with KPIs
- Lead Management (Client & Recruit)
- Visual Pipeline (Kanban)
- Contact Management
- Task Management
- Calendar/Appointments
- Team Management
- Recruiting Pipeline
- Service Ticketing
- AI Copilot Interface
- AI Agents Configuration
- Automation Builder UI
- Marketing & Messaging UI
- Analytics & Reporting UI
- Training & Knowledge Hub UI
- Commissions UI
- Settings Page

### Needs Connection 🔄
- Backend API integration (most components use mock data)
- Real-time WebSocket updates
- File upload functionality
- Google Calendar sync
- Gmail integration
- SMS/Email sending via Twilio/SendGrid
- Automation execution engine
- Campaign analytics
- Report generation

## Development Commands

```bash
# Frontend (runs on port 5000)
npm run dev

# Backend (runs on port 3001)  
cd backend && npm run dev

# Both servers should be running for full functionality
```

## Deployment Configuration
- Production deployment needs to be configured
- Build scripts are ready
- Deployment tool configuration pending

## Next Steps
1. ✅ Set up Supabase database schema
2. Connect frontend to backend APIs
3. Test all workflows end-to-end
4. Configure deployment
5. Add optional integrations as needed

## User Preferences
- Technology Stack: React, TypeScript, Node.js, PostgreSQL, Tailwind CSS
- Deployment: Replit (currently being set up)
- Database: Supabase (PostgreSQL)
