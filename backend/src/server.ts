import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeWebSocket } from './websocket/socketServer.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startWebhookRenewalJob } from './jobs/webhookRenewal.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import opportunitiesRoutes from './routes/opportunitiesRoutes.js';
import copilotRoutes from './routes/copilotRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import tasksRoutes from './routes/tasksRoutes.js';
import teamsRoutes from './routes/teamsRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import commissionsRoutes from './routes/commissions.js';
import aiAgentsRoutes from './routes/aiAgents.js';
import marketingRoutes from './routes/marketing.js';
import trainingDataRoutes from './routes/trainingData.js';
import googleAuthRoutes from './routes/googleAuth.js';
import gmailRoutes from './routes/gmail.js';
import calendarRoutes from './routes/calendar.js';
import webhookRoutes from './routes/webhooks.js';
import automationsRoutes from './routes/automations.js';

// Import automation services
import { startJobProcessor } from './services/automationService.js';
import { setupDatabaseListeners } from './services/automationTriggers.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Start webhook renewal cron job
startWebhookRenewalJob();

// Start automation job processor
startJobProcessor();

// Setup database listeners for automation triggers
setupDatabaseListeners();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/ai-agents', aiAgentsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/training-data', trainingDataRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/automations', automationsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║       🚀  InsurAgent Pro Backend API Server  🚀       ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ WebSocket Server: Ready`);
  console.log('');
  console.log('📋 Available Routes:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/auth/me');
  console.log('   - GET    /api/leads/client-leads');
  console.log('   - GET    /api/leads/recruit-leads');
  console.log('   - GET    /api/contacts');
  console.log('   - GET    /api/opportunities');
  console.log('   - POST   /api/copilot/chat');
  console.log('   - GET    /api/appointments');
  console.log('   - GET    /api/tasks');
  console.log('   - GET    /api/teams');
  console.log('   - GET    /api/teams/agents');
  console.log('   - GET    /api/service/tickets');
  console.log('   - GET    /api/analytics/dashboard');
  console.log('   - GET    /api/commissions/statements');
  console.log('   - GET    /api/commissions/summary');
  console.log('   - GET    /api/ai-agents/agents');
  console.log('   - POST   /api/ai-agents/agents/:id/execute');
  console.log('');
  console.log('⚡ Ready to accept requests!');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
