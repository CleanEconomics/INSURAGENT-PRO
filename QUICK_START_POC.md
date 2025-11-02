# InsurAgent Pro - Quick Start for POC Demo

## ⚡ Fast Setup (15 Minutes)

### Step 1: Environment Files (5 minutes)

Create `.env` in root directory:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

Create `backend/.env`:
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

JWT_SECRET=your-random-32-char-secret-here
GEMINI_API_KEY=your-gemini-api-key

# Optional (for full demo)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### Step 2: Database Setup (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "SQL Editor"
3. Copy/paste `SUPABASE_COMPLETE_SCHEMA.sql`
4. Click "Run"
5. Wait ~60 seconds for completion

### Step 3: Start Servers (5 minutes)

Option A - Using script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Option B - Manual:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

### Step 4: Verify (1 minute)

1. Open http://localhost:3000
2. Should see login page
3. Create account and log in
4. Dashboard should load

---

## 🎯 POC Demo Flow (30 minutes)

### 1. Login & Dashboard (2 min)
→ Show modern login → Dashboard with metrics

### 2. Lead Management (5 min)
→ Leads page → Show filtering → Lead detail → Send message → Convert to opportunity

### 3. Pipeline (3 min)
→ Pipeline board → Drag/drop → Show values

### 4. AI Copilot (5 min)
→ Open copilot → "Create a lead named John" → "Schedule appointment tomorrow" → "Search knowledge hub"

### 5. Automation (5 min)
→ AI Agents page → Show pre-built agents → Automation builder → Explain triggers/actions

### 6. Service Tickets (3 min)
→ Service page → Create ticket → Show categories → Update status

### 7. Team & Analytics (5 min)
→ Team page → Agent stats → Leaderboard → Analytics page → Charts

### 8. Q&A (10 min)

---

## 📋 Pre-Demo Checklist

30 minutes before:

- [ ] Backend running (port 3001)
- [ ] Frontend running (port 3000)
- [ ] Logged in successfully
- [ ] No console errors
- [ ] Demo data seeded:
  - [ ] 5 client leads
  - [ ] 2 recruit leads
  - [ ] 3 contacts
  - [ ] 2 tasks
  - [ ] 2 appointments
  - [ ] 1 service ticket
- [ ] AI Copilot responding
- [ ] Backup plan ready

---

## 🚨 Emergency Fixes

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database issues
- Re-run SQL schema in Supabase
- Check Supabase credentials in .env

### AI Copilot not working
- Verify GEMINI_API_KEY in backend/.env
- Check backend console for errors

---

## 🎤 Key Talking Points

**Opening:**
"InsurAgent Pro is an all-in-one insurance agency management platform with AI-powered automation."

**Core Value Props:**
1. "Complete CRM specifically built for insurance agencies"
2. "AI that actually works - not just chatbots, but real automation"
3. "Everything in one platform - no more juggling 10 different tools"
4. "Modern, intuitive interface your team will actually use"

**Technical Highlights:**
- React 19 + TypeScript frontend
- Node.js + PostgreSQL backend
- Google Gemini AI integration
- Real-time WebSocket updates
- Production-ready architecture

**Closing:**
"We've automated the busy work so you can focus on what matters - selling policies and building relationships."

---

## 📞 Support During Demo

### Have Ready:
- `POC_TEST_SCRIPT.md` - Detailed script
- `APP_REVIEW_AND_POC_READINESS.md` - Full feature list
- `ENVIRONMENT_SETUP.md` - Setup guide
- Backup browser window
- Notes app for feedback

### If Something Breaks:
1. Stay calm - frontend has mock data fallbacks
2. Explain the feature conceptually
3. Show code/architecture if technical audience
4. Make note to show later

---

## ✅ Success Metrics

Demo is successful if:
- [ ] All features shown without major issues
- [ ] Client excited about capabilities
- [ ] AI demo impresses
- [ ] Questions answered confidently
- [ ] Next steps agreed upon

---

## 🚀 After POC

Immediate actions:
1. Send thank you email
2. Share documentation
3. Provide demo recording link
4. Schedule follow-up call
5. Prepare proposal

---

**🎯 You're ready! The app is solid, comprehensive, and impressive. Go close that deal! 💪**

