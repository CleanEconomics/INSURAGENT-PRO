# InsurAgent Pro - Supabase Quick Start

✅ **Your Supabase is already configured!**

---

## Your Supabase Project Info

**Project ID:** `YOUR_PROJECT_ID`
**Project URL:** https://YOUR_PROJECT_ID.supabase.co
**Dashboard:** https://app.supabase.com/project/YOUR_PROJECT_ID

---

## Step 1: Create Database Tables (5 minutes)

### Copy the SQL File

1. Open [`SUPABASE_COMPLETE_SCHEMA.sql`](SUPABASE_COMPLETE_SCHEMA.sql)
2. Select all (Cmd+A / Ctrl+A) and copy (Cmd+C / Ctrl+C)

### Run in Supabase

1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new
2. Paste the SQL content
3. Click **"Run"** or press `Cmd+Enter`
4. Wait 30-60 seconds
5. You should see: `Success. No rows returned`

### Verify Tables

1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/editor
2. You should see **46+ tables** in the left sidebar

---

## Step 2: Start the Backend (2 minutes)

Your `.env` file is already configured with Supabase credentials!

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Connected to Supabase database
✅ Server running on port 3001
```

---

## Step 3: Start the Frontend (1 minute)

```bash
# In the root directory
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

---

## That's It! 🎉

Your InsurAgent Pro is now running on Supabase!

---

## What You Get

✅ **46+ Database Tables** - All created automatically
✅ **Real-time Ready** - Live data updates available
✅ **Visual Dashboard** - Manage data at https://app.supabase.com
✅ **Managed Database** - No server maintenance needed
✅ **Free Tier** - Great for development

---

## Quick Links

| Resource | URL |
|----------|-----|
| **Supabase Dashboard** | https://app.supabase.com/project/YOUR_PROJECT_ID |
| **Table Editor** | https://app.supabase.com/project/YOUR_PROJECT_ID/editor |
| **SQL Editor** | https://app.supabase.com/project/YOUR_PROJECT_ID/sql |
| **API Docs** | https://app.supabase.com/project/YOUR_PROJECT_ID/api |
| **Database** | https://app.supabase.com/project/YOUR_PROJECT_ID/database/tables |
| **Authentication** | https://app.supabase.com/project/YOUR_PROJECT_ID/auth/users |
| **Storage** | https://app.supabase.com/project/YOUR_PROJECT_ID/storage/buckets |

---

## Environment Variables (Already Set)

Your `backend/.env` is pre-configured with:

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (✓ configured)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (✓ configured)
```

---

## Database Tables Created (46+)

### Core CRM (10 tables)
- `users` - User accounts and agents
- `teams` - Sales teams
- `contacts` - Customer contacts
- `client_leads` - Sales leads
- `recruit_leads` - Recruiting leads
- `opportunities` - Sales pipeline
- `agent_candidates` - Recruiting pipeline
- `appointments` - Calendar events
- `tasks` - Task management
- `activities` - Activity history

### Service & Support (4 tables)
- `service_tickets` - Support tickets
- `ticket_messages` - Ticket conversations
- `knowledge_resources` - Knowledge base
- `training_modules` - Training content

### Financial (2 tables)
- `commissions` - Commission tracking
- `policies` - Insurance policies

### Messaging (10 tables)
- `user_phone_numbers` - Dedicated phone numbers
- `sms_messages` - SMS history
- `email_messages` - Email history
- `message_templates` - Reusable templates
- `message_threads` - Conversation threads
- `message_queue` - Bulk sending queue
- `messaging_analytics` - Message metrics
- `messaging_quotas` - Usage limits
- `marketing_campaigns` - Campaign management
- `do_not_contact` - DNC list

### Google Integration (13 tables)
- `google_drive_credentials` - OAuth tokens
- `drive_file_references` - Drive files
- `training_data_references` - Training data
- `drive_file_content_cache` - File content cache
- `copilot_knowledge_base` - AI knowledge
- `drive_folders` - Folder structure
- `drive_file_access_log` - Access tracking
- `synced_emails` - Gmail sync
- `email_attachments` - Email attachments
- `email_threads` - Email threads
- `synced_calendar_events` - Calendar sync
- `google_sync_history` - Sync logs
- `google_sync_settings` - Sync config

### Webhooks (3 tables)
- `google_webhooks` - Webhook registrations
- `webhook_events` - Webhook history
- `webhook_registrations` - Active webhooks

### AI & Automation (4 tables)
- `ai_agents` - AI agent config
- `agent_tasks` - AI tasks
- `agent_activity_log` - AI activity
- `automation_workflows` - Automation rules
- `automations` - Legacy automations

### Misc (4 tables)
- `email_campaigns` - Email campaigns
- `messages` - Unified inbox
- `notifications` - User notifications
- `dnc_entries` - Do not contact
- `rescinded_responses` - AI safety log

---

## Next Steps (Optional)

### 1. Seed Sample Data

Add some test users and data:
```bash
cd backend
npm run seed
```

### 2. Enable Row Level Security (RLS)

Protect user data with database-level permissions:
```sql
-- Example: Users can only see their own leads
ALTER TABLE client_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
ON client_leads FOR SELECT
USING (assigned_to_id = auth.uid());
```

### 3. Enable Real-time Updates

Add live data subscriptions to your frontend:
```typescript
import { supabase } from './supabase';

supabase
  .from('client_leads')
  .on('INSERT', payload => {
    console.log('New lead!', payload.new);
  })
  .subscribe();
```

---

## Troubleshooting

### "Failed to connect to Supabase"

**Check:**
1. Is your internet working?
2. Is the Supabase project active? (check dashboard)
3. Are the credentials correct in `.env`?

**Solution:** Restart the backend server

### "Table does not exist"

**Cause:** You haven't run the SQL schema yet

**Solution:** Go back to Step 1 and run the `SUPABASE_COMPLETE_SCHEMA.sql` file

### "Invalid API key"

**Cause:** Wrong credentials in `.env`

**Solution:** Double-check the keys match your Supabase project

---

## Documentation

- **Full Migration Guide:** See [`SUPABASE_MIGRATION_GUIDE.md`](SUPABASE_MIGRATION_GUIDE.md)
- **Complete Audit:** See [`docs/COMPLETE_APP_AUDIT_2025.md`](docs/COMPLETE_APP_AUDIT_2025.md)
- **Supabase Docs:** https://supabase.com/docs

---

## Summary Checklist

- [ ] Run `SUPABASE_COMPLETE_SCHEMA.sql` in Supabase SQL Editor
- [ ] Verify 46+ tables exist in Table Editor
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Test login at http://localhost:5173

---

**🚀 You're all set! Your app is now powered by Supabase.**
