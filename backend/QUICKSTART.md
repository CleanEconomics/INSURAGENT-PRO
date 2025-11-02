# InsurAgent Pro Backend - Quick Start Guide

Get your InsurAgent Pro backend API running in minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ A Google Gemini API key ([Get one here](https://ai.google.dev/))

## 1. Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb insuragent_pro

# Or using psql
psql -U postgres
CREATE DATABASE insuragent_pro;
\q
```

### Option B: Cloud PostgreSQL (Railway, Supabase, etc.)

Create a new PostgreSQL database and copy the connection string.

## 2. Install Dependencies

```bash
cd backend
npm install
```

## 3. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Minimum required configuration:**

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Update with your connection string
DATABASE_URL=postgresql://username:password@localhost:5432/insuragent_pro

# JWT - Generate a strong secret (use: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 4. Run Database Migrations

```bash
npm run migrate
```

You should see: `✅ Database migrations completed successfully!`

## 5. Start the Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       🚀  InsurAgent Pro Backend API Server  🚀       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

✅ Server running on port 3001
✅ Environment: development
✅ API Base URL: http://localhost:3001/api
✅ WebSocket Server: Ready

⚡ Ready to accept requests!
```

## 6. Test the API

### Health Check
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-08-05T10:30:00.000Z"
}
```

### Create a User Account
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "email": "agent@test.com",
    "password": "password123",
    "role": "Agent/Producer"
  }'
```

Save the returned `token` for subsequent requests!

### Create a Lead
```bash
curl -X POST http://localhost:3001/api/leads/client-leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-0123",
    "source": "Web Form"
  }'
```

## 7. Connect Frontend

Update your frontend `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## Common Issues & Solutions

### ❌ Database connection error
**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
1. Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
2. Verify DATABASE_URL is correct
3. Check username/password

### ❌ JWT_SECRET not configured
**Problem:** `Error: JWT_SECRET not configured`

**Solution:** Add a strong JWT_SECRET to your .env file

### ❌ Gemini API error
**Problem:** `Failed to get AI response`

**Solution:**
1. Verify GEMINI_API_KEY is valid
2. Check you have API quota remaining
3. Ensure you're using the correct key format

### ❌ Port already in use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
1. Change PORT in .env to 3002 or another available port
2. Or kill the process using port 3001:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

## Next Steps

- ✅ Backend is running!
- 📖 Read the [full API documentation](./API_DOCUMENTATION.md)
- 🚀 Start the [frontend application](../README.md)
- 🤖 Test the AI Copilot integration
- 📊 Explore the analytics endpoints

## Development Tips

### Auto-reload on file changes
The dev server uses `tsx watch` - your changes will automatically reload!

### View database
```bash
psql insuragent_pro
\dt  # List all tables
SELECT * FROM users;
```

### Check logs
All requests are logged to console with timing information.

### Test WebSocket
Use a tool like [Postman](https://www.postman.com/) or [Socket.io Client Tool](https://amritb.github.io/socketio-client-tool/)

Connect to: `ws://localhost:3001`

## Production Deployment

When ready to deploy:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Use a production-grade PostgreSQL**

4. **Enable SSL** for database connections

5. **Configure proper CORS** origins

6. **Deploy to:**
   - Railway: Auto-detects Node.js, easy PostgreSQL
   - Render: Free tier available
   - Heroku: Classic choice
   - AWS: EC2 + RDS for full control

---

🎉 **You're all set!** Your InsurAgent Pro backend is ready to power your insurance agency management platform.

**Need help?** Check the [README](./README.md) or [API docs](./API_DOCUMENTATION.md)
