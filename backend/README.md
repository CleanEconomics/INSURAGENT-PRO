# InsurAgent Pro - Backend API

A comprehensive backend API for the InsurAgent Pro insurance agency management platform. Built with Node.js, Express, TypeScript, PostgreSQL, and Socket.IO.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **CRM System** - Leads, Contacts, and Pipeline management
- **AI Copilot** - Gemini AI integration for intelligent assistance
- **Calendar & Tasks** - Appointment scheduling and task management
- **Team Management** - Teams, agents, and performance tracking
- **Service Desk** - Ticketing system for client support
- **Analytics** - Comprehensive business intelligence and reporting
- **Real-time Updates** - WebSocket support for live notifications
- **RESTful API** - Clean, well-documented REST endpoints

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT signing
   - `GEMINI_API_KEY` - Google Gemini API key
   - Other optional services (SendGrid, Twilio, etc.)

4. **Set up the database:**
   ```bash
   # Create PostgreSQL database
   createdb insuragent_pro

   # Run migrations
   npm run migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── leadsController.ts
│   │   ├── contactsController.ts
│   │   ├── opportunitiesController.ts
│   │   ├── copilotController.ts
│   │   ├── appointmentsController.ts
│   │   ├── tasksController.ts
│   │   ├── teamsController.ts
│   │   ├── serviceController.ts
│   │   └── analyticsController.ts
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   │   └── geminiService.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── db/               # Database
│   │   ├── database.ts
│   │   ├── schema.sql
│   │   └── migrate.ts
│   ├── websocket/        # WebSocket server
│   │   └── socketServer.ts
│   ├── types/            # TypeScript types
│   └── server.ts         # Main server file
├── package.json
├── tsconfig.json
└── README.md
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Leads (CRM)
- `GET /api/leads/client-leads` - Get all client leads
- `POST /api/leads/client-leads` - Create client lead
- `PUT /api/leads/client-leads/:id` - Update client lead
- `POST /api/leads/client-leads/:id/convert` - Convert lead to opportunity
- `POST /api/leads/client-leads/:id/activities` - Add activity to lead
- `GET /api/leads/recruit-leads` - Get all recruit leads
- `POST /api/leads/recruit-leads` - Create recruit lead
- `PUT /api/leads/recruit-leads/:id` - Update recruit lead
- `POST /api/leads/recruit-leads/:id/convert` - Convert to candidate
- `POST /api/leads/bulk-import` - Bulk import leads from CSV

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get contact details
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `POST /api/contacts/:contactId/policies` - Add policy to contact
- `PUT /api/contacts/:contactId/policies/:policyId` - Update policy
- `DELETE /api/contacts/:contactId/policies/:policyId` - Delete policy

### Pipeline (Opportunities)
- `GET /api/opportunities` - Get all opportunities
- `PUT /api/opportunities/:id` - Update opportunity (e.g., change stage)

### AI Copilot
- `POST /api/copilot/chat` - Send message to AI Copilot
- `POST /api/copilot/map-leads` - AI-powered CSV column mapping

### Appointments
- `GET /api/appointments` - Get appointments (supports date range filtering)
- `POST /api/appointments` - Create new appointment

### Tasks
- `GET /api/tasks` - Get tasks (supports filtering by assignee, status)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id/members` - Add member to team
- `GET /api/teams/agents` - Get all agents with stats
- `GET /api/teams/agents/:id` - Get agent details

### Service Desk
- `GET /api/service/tickets` - Get all tickets
- `GET /api/service/tickets/:id` - Get ticket details with messages
- `POST /api/service/tickets` - Create new ticket
- `PUT /api/service/tickets/:id` - Update ticket
- `POST /api/service/tickets/:id/messages` - Add message/note to ticket

### Analytics
- `GET /api/analytics/dashboard` - Get comprehensive analytics data
  - Query params: `dateRange`, `teamId`, `agentId`
  - Returns: Sales performance, funnel, leaderboard, revenue breakdown

## 🔐 Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication.

**Include JWT token in requests:**
```
Authorization: Bearer <your-jwt-token>
```

**Example Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "agent@example.com", "password": "password123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "agent@example.com",
    "role": "Agent/Producer"
  }
}
```

## 🔌 WebSocket Events

The server emits real-time events via WebSocket:

### Client → Server
- `authenticate` - Authenticate socket connection with userId

### Server → Client
- `notification:new` - New notification for user
- `lead:updated` - Lead was updated
- `opportunity:updated` - Opportunity stage changed
- `ticket:updated` - Service ticket updated
- `message:incoming` - New SMS/email received
- `task:updated` - Task created or updated
- `appointment:created` - New appointment scheduled

**Frontend Connection Example:**
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  socket.emit('authenticate', userId);
});

socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

## 🤖 AI Copilot Integration

The AI Copilot uses Google's Gemini 2.0 model with function calling to execute actions.

**Available AI Functions:**
- `searchKnowledgeHub` - Search internal documentation
- `createClientLead` - Create new client lead
- `updateClientLead` - Update existing lead
- `createRecruitLead` - Create recruit lead
- `updateRecruitLead` - Update recruit lead
- `scheduleAppointment` - Schedule meeting
- `draftEmail` - Generate professional email

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/copilot/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "history": [],
    "context": "Create a new lead for John Smith, email john@example.com"
  }'
```

## 🗄️ Database Schema

The database schema is defined in [src/db/schema.sql](src/db/schema.sql).

**Key Tables:**
- `users` - User accounts and agents
- `teams` - Agent teams
- `contacts` - Client contacts
- `policies` - Insurance policies
- `client_leads` - Client leads (CRM)
- `recruit_leads` - Recruitment leads
- `activities` - Activity timeline (calls, emails, notes)
- `opportunities` - Sales pipeline
- `agent_candidates` - Recruiting pipeline
- `appointments` - Calendar events
- `tasks` - Task management
- `service_tickets` - Support tickets
- `ticket_messages` - Ticket conversation history
- `knowledge_resources` - Knowledge base
- `training_modules` - Training content
- `commissions` - Commission tracking
- `email_campaigns` - Marketing campaigns
- `messages` - Unified inbox (SMS/Email)
- `ai_agents` - AI agent configurations
- `automations` - Workflow automations
- `notifications` - User notifications
- `dnc_entries` - Do Not Contact list
- `rescinded_responses` - AI safety log

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Enable SSL for PostgreSQL connection
- Configure CORS origin to your frontend domain
- Set up proper logging and monitoring

### Recommended Hosting
- **API Server:** Railway, Render, Heroku, AWS EC2
- **Database:** Railway PostgreSQL, Supabase, AWS RDS
- **Environment:** Use managed services for easier scaling

## 📚 Additional Resources

- [Frontend App](../README.md)
- [Backend Guide](../BACKEND_GUIDE.md)
- [App Features](../APP_FEATURES.md)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for insurance agencies**
