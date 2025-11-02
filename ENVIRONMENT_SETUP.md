# InsurAgent Pro - Environment Setup Guide

## Quick Start

### 1. Frontend Environment Variables

Create a file named `.env` in the root directory with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Optional: WebSocket URL
VITE_WS_URL=http://localhost:3001
```

### 2. Backend Environment Variables

Create a file named `.env` in the `backend/` directory with:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Database - Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Twilio SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Email Configuration (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Gemini AI Configuration
GEMINI_API_KEY=your-google-gemini-api-key

# Optional: Google Cloud Pub/Sub
GMAIL_PUBSUB_TOPIC=projects/your-project-id/topics/gmail-notifications
CALENDAR_WEBHOOK_URL=http://localhost:3001/api/webhooks/calendar
```

## Getting Your Credentials

### Supabase Setup

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Go to Settings → API
4. Copy:
   - `URL` → Use as `SUPABASE_URL`
   - `anon public` key → Use as `SUPABASE_ANON_KEY`
   - `service_role` key → Use as `SUPABASE_SERVICE_KEY`

### Google Gemini API Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key → Use as `GEMINI_API_KEY`

### Google OAuth (Optional - for Google Calendar/Gmail)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API and Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy Client ID and Client Secret

### Twilio (Optional - for SMS)

1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Create account and verify phone number
3. Get Account SID and Auth Token from dashboard
4. Purchase a phone number

### JWT Secret

Generate a secure random string (at least 32 characters):

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use any password generator
```

## Database Setup

Run the SQL schema in your Supabase project:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `SUPABASE_COMPLETE_SCHEMA.sql`
4. Click "Run"

Alternatively, you can use `RUN_THIS_SQL_IN_SUPABASE.sql` for a complete schema.

## Starting the Application

### Option 1: Using the Startup Script (Recommended)

```bash
# Make the script executable
chmod +x start-dev.sh

# Run it
./start-dev.sh
```

### Option 2: Manual Start

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

## Verification

After starting:

1. Frontend should be accessible at: `http://localhost:3000`
2. Backend should be accessible at: `http://localhost:3001`
3. Health check: `curl http://localhost:3001/health`
4. Should return: `{"status":"ok","timestamp":"..."}`

## Common Issues

### "Missing Supabase environment variables"
- Ensure `.env` file exists in root directory
- Check that variable names start with `VITE_`
- Restart the dev server after creating .env

### Backend fails to start
- Check `backend/.env` exists and has all required variables
- Verify Supabase credentials are correct
- Check if port 3001 is already in use

### "Failed to load data from backend"
- Ensure backend is running
- Check CORS_ORIGIN matches frontend URL
- Verify Supabase schema has been deployed

## Production Deployment

For production, update the URLs:

```bash
# Frontend .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_URL=https://api.yourdomain.com/api

# Backend .env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

## Security Best Practices

- ✅ Never commit `.env` files to git
- ✅ Use different credentials for dev/staging/production
- ✅ Rotate JWT_SECRET regularly
- ✅ Use HTTPS in production
- ✅ Enable Supabase RLS (Row Level Security)
- ✅ Implement rate limiting in production
- ✅ Monitor API usage and set alerts

## Need Help?

Refer to:
- `POC_TEST_SCRIPT.md` - Complete demo guide
- `READY_TO_USE.md` - Quick start guide
- `docs/DEPLOYMENT_READY_CHECKLIST.md` - Production deployment
- `backend/API_DOCUMENTATION.md` - API reference

