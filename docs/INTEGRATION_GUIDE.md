
# Frontend-Backend Integration Guide

This guide explains how to integrate the InsurAgent Pro frontend with the backend API.

## ✅ What's Been Set Up

The integration layer is **complete** and ready to use:

### 1. API Service Layer (`/services/api/`)
- ✅ **HTTP Client** - Base API client with authentication
- ✅ **Authentication Service** - Login, register, logout
- ✅ **Leads Service** - Client & recruit leads CRUD
- ✅ **Contacts Service** - Contact management
- ✅ **Opportunities Service** - Pipeline management
- ✅ **Copilot Service** - AI chat integration
- ✅ **Appointments Service** - Calendar management
- ✅ **Tasks Service** - Task management
- ✅ **Teams Service** - Team & agent management
- ✅ **Service Desk Service** - Ticket management
- ✅ **Analytics Service** - Dashboard data

### 2. WebSocket Service (`/services/websocket.ts`)
- ✅ Real-time event handling
- ✅ Auto-reconnection
- ✅ Event listeners for all backend events

### 3. React Context (`/contexts/AuthContext.tsx`)
- ✅ Authentication state management
- ✅ User session persistence
- ✅ WebSocket connection management

### 4. Custom Hooks (`/hooks/`)
- ✅ `useApi` - Data fetching with loading states
- ✅ `useMutation` - Create/update/delete operations
- ✅ `useWebSocket` - Real-time event subscriptions
- ✅ Event-specific hooks (notifications, leads, tasks, etc.)

---

## 🚀 Quick Start

### Step 1: Update App.tsx

Wrap your app with the AuthProvider:

```tsx
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;
```

### Step 2: Use Authentication

```tsx
import { useAuth } from './contexts/AuthContext';

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    try {
      await login('agent@example.com', 'password123');
      // User is now logged in!
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome {user?.name}!</div>;
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

### Step 3: Fetch Data from API

```tsx
import { useApi } from './hooks/useApi';
import { leadsService } from './services/api';

function LeadsPage() {
  const { data: leads, loading, error, refetch } = useApi(
    () => leadsService.getClientLeads(),
    [] // dependencies
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {leads?.map(lead => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

### Step 4: Create/Update Data

```tsx
import { useMutation } from './hooks/useApi';
import { leadsService } from './services/api';

function CreateLeadForm() {
  const { mutate, loading, error } = useMutation(
    leadsService.createClientLead
  );

  const handleSubmit = async (formData) => {
    try {
      const newLead = await mutate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: 'Web Form',
      });
      console.log('Lead created:', newLead);
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Lead'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Step 5: Real-time Updates

```tsx
import { useLeadUpdates, useNotifications } from './hooks/useWebSocket';

function Dashboard() {
  const [leads, setLeads] = useState([]);

  // Listen for lead updates
  useLeadUpdates((data) => {
    console.log('Lead updated:', data);
    // Update your state
    setLeads(prev => prev.map(lead =>
      lead.id === data.leadId ? { ...lead, ...data.lead } : lead
    ));
  });

  // Listen for notifications
  useNotifications((notification) => {
    console.log('New notification:', notification);
    // Show toast or update notification center
  });

  return <div>Dashboard with real-time updates!</div>;
}
```

---

## 📚 Complete API Examples

### Authentication

```tsx
import { authService } from './services/api';

// Register
const response = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'Agent/Producer',
});

// Login
const response = await authService.login({
  email: 'john@example.com',
  password: 'password123',
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

### Leads

```tsx
import { leadsService } from './services/api';

// Get all client leads
const leads = await leadsService.getClientLeads();

// Filter leads
const newLeads = await leadsService.getClientLeads({ status: 'New' });

// Create lead
const newLead = await leadsService.createClientLead({
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-0123',
  source: 'Referral',
});

// Update lead
const updated = await leadsService.updateClientLead('lead-id', {
  status: 'Contacted',
  priority: 'High',
});

// Add activity
const activity = await leadsService.addActivity('lead-id', {
  type: 'Call',
  content: 'Discussed insurance needs',
});

// Convert lead
const result = await leadsService.convertClientLead('lead-id');
console.log('Contact:', result.contact);
console.log('Opportunity:', result.opportunity);

// Bulk import
const result = await leadsService.bulkImport({
  leadType: 'client',
  leads: [
    { name: 'Lead 1', email: 'lead1@example.com' },
    { name: 'Lead 2', email: 'lead2@example.com' },
  ],
});
```

### Contacts

```tsx
import { contactsService } from './services/api';

// Get all contacts
const contacts = await contactsService.getContacts();

// Get contact details
const contact = await contactsService.getContactById('contact-id');
// Returns contact with policies, opportunities, and activities

// Create contact
const newContact = await contactsService.createContact({
  name: 'Michael Chen',
  email: 'm.chen@example.com',
  phone: '555-0101',
  tags: ['High Value', 'Life'],
});

// Add policy
const policy = await contactsService.addPolicy('contact-id', {
  policyNumber: 'POL-12345',
  product: 'Term Life',
  lineOfBusiness: 'Life & Health',
  premium: 1500,
  effectiveDate: '2024-01-01',
  expirationDate: '2025-01-01',
});
```

### Opportunities (Pipeline)

```tsx
import { opportunitiesService } from './services/api';

// Get opportunities
const opportunities = await opportunitiesService.getOpportunities();

// Filter by line of business
const lifeOpps = await opportunitiesService.getOpportunities({
  lineOfBusiness: 'Life & Health',
});

// Update opportunity (drag & drop)
const updated = await opportunitiesService.updateOpportunity('opp-id', {
  stage: 'Won',
  value: 5500,
});
```

### AI Copilot

```tsx
import { copilotService } from './services/api';

// Chat with AI
const response = await copilotService.chat({
  history: [
    {
      role: 'user',
      parts: [{ text: 'Create a lead for Sarah Johnson' }],
    },
  ],
  context: 'email: sarah@example.com',
});

console.log(response.chatResponse);
// "I've created a new lead for Sarah Johnson..."

// Map CSV columns
const mapping = await copilotService.mapLeads({
  headers: ['Full Name', 'Email Address', 'Phone Number'],
});

console.log(mapping.leadType); // 'client' or 'recruit'
console.log(mapping.mapping); // { name: 'Full Name', email: 'Email Address', ... }
```

### Tasks

```tsx
import { tasksService } from './services/api';

// Get tasks
const tasks = await tasksService.getTasks();

// Filter tasks
const myTasks = await tasksService.getTasks({
  assigneeId: 'user-id',
  status: 'To-do',
});

// Create task
const newTask = await tasksService.createTask({
  title: 'Follow up with Jane',
  description: 'Discuss auto insurance',
  dueDate: '2024-08-10T17:00:00Z',
  priority: 'High',
  assigneeId: 'agent-id',
});

// Update task
const updated = await tasksService.updateTask('task-id', {
  status: 'Completed',
});
```

### Appointments

```tsx
import { appointmentsService } from './services/api';

// Get appointments
const appointments = await appointmentsService.getAppointments({
  start: '2024-08-01T00:00:00Z',
  end: '2024-08-31T23:59:59Z',
});

// Create appointment
const newAppt = await appointmentsService.createAppointment({
  title: 'Policy Review',
  contactName: 'Michael Chen',
  contactId: 'contact-id',
  startTime: '2024-08-05T10:00:00Z',
  endTime: '2024-08-05T11:00:00Z',
  type: 'Meeting',
});
```

### Teams & Agents

```tsx
import { teamsService } from './services/api';

// Get all teams
const teams = await teamsService.getTeams();

// Get all agents with stats
const agents = await teamsService.getAgents();

// Get agent details
const agent = await teamsService.getAgentById('agent-id');
console.log(agent.policiesSold, agent.revenue);

// Create team
const newTeam = await teamsService.createTeam({
  name: 'P&C Powerhouse',
  managerId: 'manager-id',
});

// Add member to team
await teamsService.addTeamMember('team-id', {
  memberId: 'agent-id',
});
```

### Service Desk

```tsx
import { serviceService } from './services/api';

// Get tickets
const tickets = await serviceService.getTickets({
  status: 'Open',
  priority: 'High',
});

// Get ticket details
const ticket = await serviceService.getTicketById('ticket-id');

// Create ticket
const newTicket = await serviceService.createTicket({
  contactId: 'contact-id',
  subject: 'Policy Change Request',
  category: 'Policy Change Request',
  priority: 'Medium',
  initialMessage: 'I need to update my address',
});

// Add message to ticket
await serviceService.addMessage('ticket-id', {
  content: 'I've updated your address',
  isInternalNote: false,
});

// Update ticket
await serviceService.updateTicket('ticket-id', {
  status: 'Closed',
});
```

### Analytics

```tsx
import { analyticsService } from './services/api';

// Get dashboard data
const data = await analyticsService.getDashboard({
  dateRange: '90', // last 90 days
  teamId: 'team-id', // optional
  agentId: 'agent-id', // optional
});

console.log(data.salesPerformance); // Array of weekly performance
console.log(data.salesFunnel); // Funnel stages with counts
console.log(data.leaderboard); // Top agents
console.log(data.revenueByLineOfBusiness); // Revenue breakdown
```

---

## 🔌 Real-time Events

### Available WebSocket Events

```tsx
import { wsService } from './services/websocket';

// Manually subscribe to events
wsService.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});

wsService.on('lead:updated', ({ leadId, lead }) => {
  console.log('Lead updated:', leadId, lead);
});

wsService.on('opportunity:updated', ({ opportunityId, opportunity }) => {
  console.log('Opportunity updated:', opportunityId, opportunity);
});

wsService.on('ticket:updated', ({ ticketId, ticket }) => {
  console.log('Ticket updated:', ticketId, ticket);
});

wsService.on('message:incoming', (message) => {
  console.log('New message:', message);
});

wsService.on('task:updated', ({ taskId, task }) => {
  console.log('Task updated:', taskId, task);
});

wsService.on('appointment:created', (appointment) => {
  console.log('Appointment created:', appointment);
});
```

### Or use the hooks:

```tsx
import {
  useNotifications,
  useLeadUpdates,
  useOpportunityUpdates,
  useTicketUpdates,
  useMessageUpdates,
  useTaskUpdates,
  useAppointmentUpdates,
} from './hooks/useWebSocket';

function MyComponent() {
  useNotifications((notification) => {
    // Handle notification
  });

  useLeadUpdates(({ leadId, lead }) => {
    // Update lead in state
  });

  // ... etc
}
```

---

## 🛠️ Error Handling

All API calls return errors in a consistent format:

```tsx
import { ApiError } from './services/api';

try {
  const lead = await leadsService.createClientLead(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Data:', error.data);

    if (error.statusCode === 401) {
      // Handle unauthorized - redirect to login
    } else if (error.statusCode === 400) {
      // Handle validation errors
      console.log(error.data.details); // Validation details
    }
  }
}
```

---

## 📝 Best Practices

### 1. Always use the hooks for data fetching

```tsx
// ✅ Good
const { data, loading, error } = useApi(() => leadsService.getClientLeads());

// ❌ Avoid
useEffect(() => {
  leadsService.getClientLeads().then(setLeads);
}, []);
```

### 2. Handle loading and error states

```tsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <DataDisplay data={data} />;
```

### 3. Use WebSocket hooks for real-time updates

```tsx
const { data: leads, setData } = useApi(() => leadsService.getClientLeads());

useLeadUpdates(({ leadId, lead }) => {
  setData(prevLeads =>
    prevLeads?.map(l => l.id === leadId ? { ...l, ...lead } : l)
  );
});
```

### 4. Refetch data after mutations

```tsx
const { data, refetch } = useApi(() => leadsService.getClientLeads());
const { mutate } = useMutation(leadsService.createClientLead);

const handleCreate = async (formData) => {
  await mutate(formData);
  await refetch(); // Refresh the list
};
```

---

## 🎯 Migration Checklist

To migrate existing components to use the backend:

- [ ] Replace mock data with API calls
- [ ] Use `useApi` hook for data fetching
- [ ] Use `useMutation` hook for create/update/delete
- [ ] Add WebSocket listeners for real-time updates
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Update forms to call mutation functions
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Test real-time event handling

---

## 🚀 Next Steps

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Update your components** to use the API services

3. **Test the integration** by creating/updating records

4. **Monitor WebSocket** events in the browser console

---

## 📞 Need Help?

- **API Reference:** See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Backend Setup:** See [backend/QUICKSTART.md](backend/QUICKSTART.md)
- **Type Definitions:** Check [types.ts](types.ts) for all data structures

---

**The integration layer is ready to use! Start connecting your components to the backend API.**
