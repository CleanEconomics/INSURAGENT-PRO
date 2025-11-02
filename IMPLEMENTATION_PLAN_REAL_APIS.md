# 🎯 Implementation Plan: Replace Mock Data with Real APIs

## 📊 Current Situation

**Problem:** App.tsx uses 100% mock data, no real API integration except authentication

**Status:**
- ✅ Backend APIs exist and are functional
- ✅ Supabase Auth working
- ❌ Frontend not calling backend APIs
- ❌ All data is hardcoded mock data

---

## 🔧 What Needs to Be Done

### **Step 1: Create API Client Service**
Create `services/api.ts` with axios configured for backend API calls

### **Step 2: Replace Mock Data with API Calls in App.tsx**
Add `useEffect` hooks to fetch real data after authentication:

1. **Client Leads** - `GET /api/leads/client-leads`
2. **Recruit Leads** - `GET /api/leads/recruit-leads`
3. **Contacts** - `GET /api/contacts`
4. **Opportunities** - `GET /api/opportunities`
5. **Tasks** - `GET /api/tasks`
6. **Appointments** - `GET /api/appointments`
7. **Teams** - `GET /api/teams`
8. **Agents** - `GET /api/teams/agents`
9. **Service Tickets** - `GET /api/service/tickets`
10. **Automations** - `GET /api/automations`
11. **AI Agents** - `GET /api/ai-agents/agents`

### **Step 3: Add Loading States**
Show loading spinners while fetching data

### **Step 4: Add Error Handling**
Handle API errors gracefully with toast messages

---

## 📝 Detailed Implementation

### **File 1: `services/api.ts` (NEW)**

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const leadsApi = {
  getClientLeads: () => api.get('/leads/client-leads'),
  getRecruitLeads: () => api.get('/leads/recruit-leads'),
};

export const contactsApi = {
  getAll: () => api.get('/contacts'),
};

export const tasksApi = {
  getAll: () => api.get('/tasks'),
};

export const appointmentsApi = {
  getAll: () => api.get('/appointments'),
};

export const teamsApi = {
  getAll: () => api.get('/teams'),
  getAgents: () => api.get('/teams/agents'),
};

export const opportunitiesApi = {
  getAll: () => api.get('/opportunities'),
};

export const serviceApi = {
  getTickets: () => api.get('/service/tickets'),
};

export const aiAgentsApi = {
  getAll: () => api.get('/ai-agents/agents'),
};

export default api;
```

### **File 2: Update `App.tsx`**

**Add after hooks declarations (around line 293):**

```typescript
// Fetch all data after authentication
useEffect(() => {
  if (isAuthenticated) {
    fetchAllData();
  }
}, [isAuthenticated]);

const fetchAllData = async () => {
  try {
    const [
      clientLeadsRes,
      recruitLeadsRes,
      contactsRes,
      tasksRes,
      appointmentsRes,
      teamsRes,
      agentsRes,
      opportunitiesRes,
      serviceTicketsRes,
      aiAgentsRes,
    ] = await Promise.all([
      leadsApi.getClientLeads(),
      leadsApi.getRecruitLeads(),
      contactsApi.getAll(),
      tasksApi.getAll(),
      appointmentsApi.getAll(),
      teamsApi.getAll(),
      teamsApi.getAgents(),
      opportunitiesApi.getAll(),
      serviceApi.getTickets(),
      aiAgentsApi.getAll(),
    ]);

    setClientLeads(clientLeadsRes.data);
    setRecruitLeads(recruitLeadsRes.data);
    setContacts(contactsRes.data);
    setTasks(tasksRes.data);
    setAppointments(appointmentsRes.data);
    setTeams(teamsRes.data);
    setAgents(agentsRes.data);
    setOpportunities(opportunitiesRes.data);
    setServiceTickets(serviceTicketsRes.data);
    setAiAgents(aiAgentsRes.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setToast({ message: 'Failed to load data. Please refresh.' });
  }
};
```

**Change initial state from mock data to empty arrays:**

```typescript
// BEFORE
const [clientLeads, setClientLeads] = useState<ClientLead[]>(mockClientLeadsData);

// AFTER
const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);
```

---

## ⚠️ Important Notes

### **1. Backend Token Authentication**
The backend uses JWT tokens. Need to:
- Store token from Supabase auth
- Add to localStorage
- Include in API requests

### **2. Data Structure Compatibility**
Backend response format must match frontend types. May need to transform data.

### **3. Loading States**
Add loading states to prevent rendering empty data while fetching.

---

## 🚀 Implementation Order

### **Phase 1: Core Setup (30 mins)**
1. Create `services/api.ts`
2. Install axios if needed: `npm install axios`
3. Test one API endpoint (client leads)

### **Phase 2: Replace Mock Data (1 hour)**
1. Change all `useState` initializations to empty arrays
2. Add `useEffect` with `fetchAllData()`
3. Add error handling

### **Phase 3: Token Integration (30 mins)**
1. Update AuthContext to store JWT token
2. Add token to axios interceptor
3. Test authenticated requests

### **Phase 4: Testing (30 mins)**
1. Test all API endpoints
2. Verify data displays correctly
3. Test error scenarios

---

## 📋 Checklist

- [ ] Create `services/api.ts`
- [ ] Install axios
- [ ] Replace mock data with empty arrays
- [ ] Add `fetchAllData()` function
- [ ] Add `useEffect` to fetch on auth
- [ ] Update AuthContext for token storage
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all endpoints
- [ ] Clean up mock data constants

---

## 🎯 Expected Outcome

After implementation:
- ✅ All data fetched from backend APIs
- ✅ Real data from Supabase database
- ✅ Proper loading states
- ✅ Error handling
- ✅ Token-based authentication
- ✅ No more mock data

**Estimated Time:** 2-3 hours total

Would you like me to proceed with this implementation?
