# Supabase Migration Guide

This guide explains how to migrate InsurAgent Pro from raw PostgreSQL to Supabase.

---

## Why Supabase?

Supabase provides:
- ✅ **Managed PostgreSQL** - No server maintenance
- ✅ **Real-time subscriptions** - Live data updates
- ✅ **Built-in Authentication** - User management out of the box
- ✅ **Storage** - File uploads and CDN
- ✅ **Auto-generated REST API** - Instant API endpoints
- ✅ **Row Level Security** - Database-level permissions
- ✅ **Dashboard** - Visual table editor and SQL editor
- ✅ **Free tier** - Great for development and small projects

---

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Name:** `insuragent-pro`
   - **Database Password:** (Save this securely!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Start with Free tier
5. Click **"Create new project"**
6. Wait 2-3 minutes for project setup

---

## Step 2: Run the Database Schema

### Copy the SQL Schema

1. Open [`SUPABASE_COMPLETE_SCHEMA.sql`](SUPABASE_COMPLETE_SCHEMA.sql) in your editor
2. Copy the **entire file** content (Cmd+A, Cmd+C)

### Paste into Supabase SQL Editor

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**
3. Paste the copied SQL content
4. Click **"Run"** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
5. Wait 30-60 seconds for all tables to be created
6. You should see: `Success. No rows returned`

### Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar
2. You should see **46+ tables** listed:
   - `users`
   - `contacts`
   - `client_leads`
   - `recruit_leads`
   - `opportunities`
   - `appointments`
   - `tasks`
   - `teams`
   - `service_tickets`
   - `email_campaigns`
   - `sms_messages`
   - `email_messages`
   - `message_templates`
   - `google_drive_credentials`
   - `drive_file_references`
   - `synced_emails`
   - `synced_calendar_events`
   - `google_webhooks`
   - `ai_agents`
   - `agent_tasks`
   - `marketing_campaigns`
   - ...and many more!

---

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the Settings menu
3. You'll see:

### Project URL
```
https://your-project-id.supabase.co
```

### API Keys
- **anon / public key** - Safe to use in frontend
- **service_role / secret key** - **NEVER expose in frontend**, only use in backend

4. Copy these values (you'll need them in the next step)

---

## Step 4: Configure Backend Environment Variables

1. Go to `backend/.env` (create it from `.env.example` if it doesn't exist)
2. Add your Supabase credentials:

```bash
# Database - Supabase (Recommended)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Comment out or remove the old DATABASE_URL
# DATABASE_URL=postgresql://...
```

3. Keep all other environment variables as they are

---

## Step 5: Update Backend Code (Already Done!)

Good news! The backend has already been configured to use Supabase:

### ✅ Supabase Client Created
- File: `backend/src/db/supabase.ts`
- Exports `supabase` (public client) and `supabaseAdmin` (admin client)
- Auto-connects on server start

### ✅ Controllers Still Work
- All existing controllers continue to work
- They use `pool.query()` which works with both PostgreSQL and Supabase
- No code changes needed!

### What Changed?

**Before (PostgreSQL):**
```typescript
import pool from '../db/database.js';
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**After (Supabase) - Option 1: Continue using SQL:**
```typescript
import pool from '../db/database.js';
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
// Still works! Supabase is PostgreSQL under the hood
```

**After (Supabase) - Option 2: Use Supabase client (optional):**
```typescript
import { supabaseAdmin } from '../db/supabase.js';
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

Both approaches work! The second one gives you:
- Type safety (with TypeScript)
- Real-time subscriptions
- Row Level Security support
- Better error handling

---

## Step 6: Test the Connection

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. You should see:
```
✅ Connected to Supabase database
✅ Server running on port 3001
```

3. Test an API endpoint:
```bash
curl http://localhost:3001/api/auth/me
```

If you see a response (even an error about auth), Supabase is working!

---

## Step 7: Seed Initial Data (Optional)

If you want to populate the database with sample data:

1. Update `backend/src/db/seed.ts` to use Supabase
2. Run:
```bash
npm run seed
```

Or manually insert data via Supabase dashboard:
1. Go to **Table Editor**
2. Click on a table (e.g., `users`)
3. Click **"Insert row"**
4. Fill in the values
5. Click **"Save"**

---

## Step 8: Enable Row Level Security (RLS) - Optional but Recommended

Row Level Security ensures users can only access their own data.

### Example: Users can only see their own leads

1. Go to Supabase **SQL Editor**
2. Run this SQL:

```sql
-- Enable RLS on client_leads table
ALTER TABLE client_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their assigned leads
CREATE POLICY "Users can view their own leads"
ON client_leads
FOR SELECT
USING (assigned_to_id = auth.uid());

-- Policy: Users can update their assigned leads
CREATE POLICY "Users can update their own leads"
ON client_leads
FOR UPDATE
USING (assigned_to_id = auth.uid());
```

3. Repeat for other tables as needed

**Documentation:** https://supabase.com/docs/guides/auth/row-level-security

---

## Migration Comparison

| Feature | Old (PostgreSQL) | New (Supabase) |
|---------|------------------|----------------|
| **Database** | Self-hosted PostgreSQL | Managed PostgreSQL |
| **Connection** | `pg` library | `@supabase/supabase-js` |
| **Real-time** | Manual WebSockets | Built-in subscriptions |
| **Auth** | Custom JWT | Supabase Auth (optional) |
| **Storage** | Custom file handling | Supabase Storage |
| **Dashboard** | No GUI | Visual table editor |
| **API** | Custom Express routes | Auto-generated + Custom |
| **Cost** | Server hosting | Free tier available |

---

## Troubleshooting

### Error: "relation 'users' does not exist"

**Solution:** You haven't run the schema SQL file yet. Go back to Step 2.

### Error: "Invalid API key"

**Solution:** Check that your `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct in `.env`

### Error: "Failed to connect to Supabase"

**Solution:**
1. Check that `SUPABASE_URL` is correct
2. Verify your project is active in Supabase dashboard
3. Check your internet connection

### Tables exist but queries fail

**Solution:** You might have RLS enabled. Either:
1. Disable RLS for development: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
2. Use the `supabaseAdmin` client which bypasses RLS

---

## Next Steps

After migrating to Supabase:

1. **Real-time Updates** - Add live data subscriptions:
   ```typescript
   supabase
     .from('client_leads')
     .on('INSERT', payload => {
       console.log('New lead!', payload.new);
     })
     .subscribe();
   ```

2. **Supabase Auth** - Replace custom JWT with Supabase Auth
3. **Storage** - Use Supabase Storage for file uploads
4. **Edge Functions** - Deploy serverless functions to Supabase Edge

---

## Rollback to PostgreSQL (if needed)

If you need to go back to direct PostgreSQL:

1. Comment out Supabase env vars in `.env`:
   ```bash
   # SUPABASE_URL=...
   # SUPABASE_ANON_KEY=...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. Uncomment PostgreSQL connection:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/insuragent_pro
   ```

3. The code still works since both use PostgreSQL!

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Compatibility:** https://supabase.com/docs/guides/database
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Real-time:** https://supabase.com/docs/guides/realtime
- **Supabase CLI:** https://supabase.com/docs/guides/cli

---

## Summary

✅ **What We Did:**
1. Created Supabase project
2. Ran complete database schema (46+ tables)
3. Configured environment variables
4. Backend already set up with Supabase client
5. All controllers continue to work

✅ **What You Get:**
- Managed PostgreSQL database
- Visual dashboard for data management
- Real-time data subscriptions (ready to use)
- Built-in authentication (optional)
- File storage (optional)
- Free tier for development

🚀 **Your app is now running on Supabase!**

---

**Questions?** Check the troubleshooting section or Supabase documentation.
