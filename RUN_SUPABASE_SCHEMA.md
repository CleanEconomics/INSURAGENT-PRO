# How to Run the Supabase Schema

## ✅ Connection Test Results

Your Supabase connection is **working perfectly**!

```
✅ Connected to Supabase database
✅ Users table exists
✅ No Prisma instances found
✅ Database type: PostgreSQL (via Supabase)
```

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

**Click this link:**
👉 https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new

Or manually navigate:
1. Go to https://app.supabase.com
2. Select your project: `YOUR_PROJECT_ID`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New Query"**

---

### Step 2: Copy the SQL Schema

1. Open the file: `SUPABASE_COMPLETE_SCHEMA.sql`
2. Select ALL content (Cmd+A / Ctrl+A)
3. Copy (Cmd+C / Ctrl+C)

**File size:** 1,394 lines
**Tables to create:** 61 tables
**Estimated time:** 30-60 seconds

---

### Step 3: Paste and Run

1. Paste the entire SQL content into the Supabase SQL Editor
2. Click the **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
3. Wait for execution to complete (30-60 seconds)
4. You should see: `Success. No rows returned`

---

### Step 4: Verify Tables Were Created

**Option 1: Check in Table Editor**
1. Click **"Table Editor"** in the left sidebar
2. You should see 61 tables listed

**Option 2: Run the connection test**
```bash
cd backend
npx tsx test-supabase-connection.ts
```

Expected output:
```
✅ Found 61 tables:
   1. activities
   2. agent_activity_log
   3. agent_candidates
   4. agent_tasks
   5. ai_agents
   ... (and 56 more)
```

---

## 📊 What Gets Created

### Core CRM (23 tables)
- users, teams, contacts, policies
- client_leads, recruit_leads, agent_candidates
- opportunities, appointments, tasks
- activities, service_tickets, ticket_messages
- knowledge_resources, training_modules
- commissions, commission_statements, commission_details
- email_campaigns, messages, notifications
- dnc_entries, rescinded_responses, automations

### Messaging System (10 tables)
- user_phone_numbers, sms_messages, email_messages
- message_templates, message_threads, message_queue
- messaging_analytics, messaging_quotas
- marketing_campaigns, do_not_contact

### Google Integration (13 tables)
- google_drive_credentials, drive_file_references
- training_data_references, drive_file_content_cache
- copilot_knowledge_base, drive_folders, drive_file_access_log
- google_sync_settings, synced_emails, email_attachments
- email_threads, synced_calendar_events, google_sync_history

### Calendar & Templates (2 tables)
- calendar_availability, calendar_event_templates
- email_templates_v2

### AI & Automation (5 tables)
- agent_tasks, agent_activity_log, ai_agents
- automation_workflows, automation_executions

### Webhooks (4 tables)
- webhook_registrations, webhook_events
- email_linking_rules, email_auto_link_log

**Total: 61 tables**

---

## 🔧 Troubleshooting

### Error: "relation already exists"

**This is OK!** It means the table already exists. The script uses `IF NOT EXISTS` so it's safe to run multiple times.

### Error: "permission denied"

**Solution:** Make sure you're logged into the correct Supabase project.

### Error: "syntax error"

**Solution:** Make sure you copied the ENTIRE file including the header and footer.

### Connection test fails

**Check:**
1. Is your `.env` file correct?
2. Are the Supabase credentials valid?
3. Is your internet working?

**Fix:**
```bash
# Verify .env file has correct values
cat backend/.env | grep SUPABASE
```

Should show:
```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## ✅ After Running the Schema

### Test Your Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to Supabase database
✅ Server running on port 3001
```

### Test an API Endpoint

```bash
curl http://localhost:3001/api/auth/me
```

### Start the Frontend

```bash
# In root directory
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🎯 Quick Verification Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied entire SUPABASE_COMPLETE_SCHEMA.sql file
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "Success" message
- [ ] Verified 61 tables in Table Editor
- [ ] Ran `npx tsx test-supabase-connection.ts` successfully
- [ ] Started backend with `npm run dev`
- [ ] Started frontend with `npm run dev`

---

## 📱 Direct Links

| Resource | Link |
|----------|------|
| **SQL Editor (Run Schema Here)** | https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new |
| **Table Editor (Verify Tables)** | https://app.supabase.com/project/YOUR_PROJECT_ID/editor |
| **Database** | https://app.supabase.com/project/YOUR_PROJECT_ID/database/tables |
| **API Docs** | https://app.supabase.com/project/YOUR_PROJECT_ID/api |
| **Dashboard** | https://app.supabase.com/project/YOUR_PROJECT_ID |

---

## 🎉 Success!

Once you've run the schema, your InsurAgent Pro application will have:

✅ **61 database tables** - All created and ready
✅ **Zero Prisma dependencies** - Pure Supabase PostgreSQL
✅ **Complete schema** - All missing tables from audit now included
✅ **Production ready** - Indexes, foreign keys, constraints all in place

---

**Need Help?**
- See: [SUPABASE_MIGRATION_GUIDE.md](SUPABASE_MIGRATION_GUIDE.md)
- See: [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md)
