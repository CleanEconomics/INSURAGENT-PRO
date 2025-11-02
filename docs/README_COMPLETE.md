# InsurAgent Pro

<div align="center">

**A Complete Insurance Agency Management Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

</div>

---

## 🎯 Overview

InsurAgent Pro is a comprehensive, all-in-one platform designed exclusively for insurance agents and agencies. It serves as a centralized hub to manage every aspect of the business, from lead generation and sales to client service and team management.

### ✨ Key Features

- 🤖 **AI Copilot** - Intelligent assistant powered by Google Gemini
- 📊 **Complete CRM** - Leads, contacts, and pipeline management
- 📅 **Calendar & Tasks** - Appointment scheduling and task tracking
- 👥 **Team Management** - Performance metrics and leaderboards
- 🎫 **Service Desk** - Complete ticketing system
- 📈 **Analytics** - Comprehensive reporting and dashboards
- ⚡ **Real-time Updates** - WebSocket-powered live synchronization
- 🔐 **Secure** - JWT authentication with role-based access

---

## 📦 What's Included

### Frontend (React + TypeScript)
- 30 React components
- Complete UI for all features
- API integration layer
- WebSocket real-time updates
- Custom React hooks

### Backend (Node.js + Express + PostgreSQL)
- 50+ REST API endpoints
- PostgreSQL database with 25+ tables
- JWT authentication
- AI Copilot integration
- WebSocket server
- Full TypeScript implementation

### Documentation
- Complete API documentation
- Integration guides
- Quick start guides
- Migration checklists

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Gemini API key

# Create database
createdb insuragent_pro

# Run migrations
npm run migrate

# Start server
npm run dev
```

Backend will run on **http://localhost:3001**

### 2. Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies (if not already installed)
npm install

# Start frontend
npm run dev
```

Frontend will run on **http://localhost:5173**

### 3. Test the Integration

1. Open http://localhost:5173
2. Register a new account
3. Explore the platform!

---

## 📚 Documentation

### Getting Started
- **[Quick Start](backend/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Connect frontend to backend
- **[Project Summary](PROJECT_COMPLETE_SUMMARY.md)** - Complete overview

### Technical Documentation
- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Backend Guide](backend/README.md)** - Backend architecture
- **[Integration Summary](FRONTEND_BACKEND_INTEGRATION_SUMMARY.md)** - Integration details

### Feature Specifications
- **[App Features](APP_FEATURES.md)** - Complete feature list
- **[Backend Guide](BACKEND_GUIDE.md)** - Backend requirements

---

## 🏗️ Project Structure

```
insuragent-pro/
├── frontend/                   # React application
│   ├── components/            # UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API services
│   │   ├── api/              # Backend API integration
│   │   └── websocket.ts      # WebSocket service
│   ├── types.ts               # TypeScript definitions
│   └── App.tsx                # Main application
│
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Middleware
│   │   ├── db/                # Database
│   │   ├── websocket/         # WebSocket server
│   │   └── server.ts          # Main server
│   └── package.json
│
└── docs/                       # Documentation
    ├── INTEGRATION_GUIDE.md
    ├── PROJECT_COMPLETE_SUMMARY.md
    └── ...
```

---

## 🔧 Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **Google Gemini** - AI integration

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### CRM
- `/api/leads` - Lead management
- `/api/contacts` - Contact management
- `/api/opportunities` - Pipeline management

### Features
- `/api/copilot` - AI assistant
- `/api/appointments` - Calendar
- `/api/tasks` - Task management
- `/api/teams` - Team & agent management
- `/api/service/tickets` - Service desk
- `/api/analytics` - Analytics & reporting

[See complete API documentation](backend/API_DOCUMENTATION.md)

---

## 🔌 Real-time Events

WebSocket events for live updates:

- `notification:new` - New notifications
- `lead:updated` - Lead changes
- `opportunity:updated` - Pipeline updates
- `ticket:updated` - Ticket updates
- `message:incoming` - New messages
- `task:updated` - Task changes
- `appointment:created` - New appointments

---

## 💻 Usage Example

```tsx
import { useApi, useMutation } from './hooks/useApi';
import { useLeadUpdates } from './hooks/useWebSocket';
import { leadsService } from './services/api';

function LeadsPage() {
  // Fetch leads
  const { data: leads, loading, refetch } = useApi(
    () => leadsService.getClientLeads()
  );

  // Create lead
  const { mutate: createLead } = useMutation(
    leadsService.createClientLead
  );

  // Real-time updates
  useLeadUpdates(({ leadId, lead }) => {
    // Update state when lead changes
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {leads?.map(lead => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔐 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error sanitization

---

## 🚢 Deployment

### Backend
- Railway (Recommended)
- Render
- Heroku
- AWS EC2 + RDS

### Frontend
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront

[See deployment guide](backend/README.md#deployment)

---

## 📊 Project Statistics

- **Total Files:** 53+
- **Lines of Code:** 5,500+
- **API Endpoints:** 50+
- **Database Tables:** 25+
- **React Components:** 30+
- **Documentation Pages:** 7

---

## ✅ Features

- [x] Complete CRM system
- [x] AI-powered Copilot
- [x] Real-time updates
- [x] Team management
- [x] Service desk
- [x] Analytics dashboard
- [x] Calendar & tasks
- [x] Authentication
- [x] WebSocket integration
- [x] Full TypeScript coverage
- [x] Comprehensive documentation

---

## 🎓 Learning Resources

1. **[Integration Guide](INTEGRATION_GUIDE.md)** - How to use the API
2. **[API Docs](backend/API_DOCUMENTATION.md)** - Complete API reference
3. **[Quick Start](backend/QUICKSTART.md)** - Get started fast
4. **[Complete Summary](PROJECT_COMPLETE_SUMMARY.md)** - Everything explained

---

## 🤝 Contributing

This is a complete, production-ready application. To extend it:

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Submit pull requests

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with React, Node.js, and PostgreSQL
- AI powered by Google Gemini
- Real-time updates with Socket.IO

---

## 📞 Support

For questions or issues:

1. Check the [Integration Guide](INTEGRATION_GUIDE.md)
2. Review [API Documentation](backend/API_DOCUMENTATION.md)
3. See [Quick Start Guide](backend/QUICKSTART.md)

---

<div align="center">

**Built with ❤️ for insurance agencies**

[Get Started](backend/QUICKSTART.md) · [API Docs](backend/API_DOCUMENTATION.md) · [Features](APP_FEATURES.md)

</div>
