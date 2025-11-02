# InsurAgent Pro - Complete API Documentation

## Base URL
```
http://localhost:3001/api
```

All endpoints require `Content-Type: application/json` header unless otherwise specified.

---

## Authentication

### Register New User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Agent/Producer"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Agent/Producer",
    "avatarUrl": "https://picsum.photos/seed/john@example.com/40/40"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Agent/Producer",
    "avatarUrl": "https://picsum.photos/seed/john@example.com/40/40"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get authenticated user's information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Agent/Producer",
  "avatarUrl": "https://picsum.photos/seed/john@example.com/40/40",
  "teamId": "team-uuid-here"
}
```

---

## Leads Management

### Get Client Leads
**GET** `/leads/client-leads`

Fetch all client leads with optional filtering.

**Query Parameters:**
- `status` (optional) - Filter by status: `New`, `Contacted`, `Working`, `Unqualified`, `Converted`
- `assignedTo` (optional) - Filter by assigned user ID

**Response:** `200 OK`
```json
[
  {
    "id": "lead-uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-0123",
    "avatarUrl": "https://picsum.photos/seed/jane@example.com/40/40",
    "status": "New",
    "source": "Web Form",
    "assignedToId": "agent-uuid",
    "score": 30,
    "priority": "Medium",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "activities": [
      {
        "id": "activity-uuid",
        "type": "Status Change",
        "content": "Lead created.",
        "userName": "System",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
]
```

### Create Client Lead
**POST** `/leads/client-leads`

Create a new client lead.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-0123",
  "source": "Web Form",
  "assignedToId": "agent-uuid",
  "status": "New"
}
```

**Response:** `201 Created`

### Update Client Lead
**PUT** `/leads/client-leads/:id`

Update existing client lead.

**Request Body:**
```json
{
  "status": "Contacted",
  "score": 50,
  "priority": "High"
}
```

**Response:** `200 OK`

### Convert Client Lead
**POST** `/leads/client-leads/:id/convert`

Convert a client lead into a contact and opportunity.

**Response:** `200 OK`
```json
{
  "contact": { /* contact object */ },
  "opportunity": { /* opportunity object */ }
}
```

### Add Activity to Lead
**POST** `/leads/client-leads/:id/activities`

Add a note, call log, or other activity to a lead.

**Request Body:**
```json
{
  "type": "Call",
  "content": "Discussed life insurance needs, follow up next week"
}
```

**Response:** `201 Created`

### Bulk Import Leads
**POST** `/leads/bulk-import`

Import multiple leads from CSV.

**Request Body:**
```json
{
  "leadType": "client",
  "leads": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-0100",
      "source": "Bulk Import",
      "assignedTo": "agent-uuid"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "imported": 50,
  "leads": [ /* array of created leads */ ]
}
```

---

## Contacts

### Get All Contacts
**GET** `/contacts`

**Response:** `200 OK`
```json
[
  {
    "id": "contact-uuid",
    "name": "Michael Chen",
    "email": "m.chen@example.com",
    "phone": "555-0101",
    "avatarUrl": "https://picsum.photos/seed/mchen/40/40",
    "tags": ["High Value", "Life"],
    "createdAt": "2024-01-10T08:00:00Z"
  }
]
```

### Get Contact by ID
**GET** `/contacts/:id`

Get detailed contact information including policies, opportunities, and activities.

**Response:** `200 OK`
```json
{
  "id": "contact-uuid",
  "name": "Michael Chen",
  "email": "m.chen@example.com",
  "phone": "555-0101",
  "tags": ["High Value", "Life"],
  "policies": [
    {
      "id": "policy-uuid",
      "policyNumber": "POL-12345",
      "product": "Term Life",
      "lineOfBusiness": "Life & Health",
      "premium": 1500.00,
      "status": "Active",
      "effectiveDate": "2024-01-01",
      "expirationDate": "2025-01-01"
    }
  ],
  "opportunities": [ /* array */ ],
  "activities": [ /* array */ ]
}
```

### Create Contact
**POST** `/contacts`

**Request Body:**
```json
{
  "name": "Michael Chen",
  "email": "m.chen@example.com",
  "phone": "555-0101",
  "tags": ["High Value", "Life"]
}
```

**Response:** `201 Created`

### Add Policy to Contact
**POST** `/contacts/:contactId/policies`

**Request Body:**
```json
{
  "policyNumber": "POL-12345",
  "product": "Term Life",
  "lineOfBusiness": "Life & Health",
  "premium": 1500.00,
  "effectiveDate": "2024-01-01",
  "expirationDate": "2025-01-01"
}
```

**Response:** `201 Created`

---

## Opportunities (Pipeline)

### Get Opportunities
**GET** `/opportunities`

**Query Parameters:**
- `lineOfBusiness` (optional) - `Life & Health` or `P&C`
- `assignedTo` (optional) - User ID

**Response:** `200 OK`
```json
[
  {
    "id": "opp-uuid",
    "contact": {
      "id": "contact-uuid",
      "name": "Michael Chen",
      "email": "m.chen@example.com",
      "phone": "555-0101",
      "avatarUrl": "https://picsum.photos/seed/mchen/40/40",
      "tags": []
    },
    "stage": "Quoted",
    "value": 5000,
    "product": "Term Life",
    "lineOfBusiness": "Life & Health",
    "closeDate": "2024-08-15",
    "assignedToId": "agent-uuid"
  }
]
```

### Update Opportunity
**PUT** `/opportunities/:id`

Primarily used for drag-and-drop stage changes.

**Request Body:**
```json
{
  "stage": "Won",
  "value": 5500
}
```

**Response:** `200 OK`

---

## AI Copilot

### Chat with AI
**POST** `/copilot/chat`

Send a message to the AI Copilot. The AI can execute functions like creating leads, scheduling appointments, drafting emails, etc.

**Request Body:**
```json
{
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Create a new lead for Sarah Johnson" }]
    }
  ],
  "context": "email: sarah.j@example.com"
}
```

**Response:** `200 OK`
```json
{
  "chatResponse": "I've created a new client lead for Sarah Johnson with email sarah.j@example.com. The lead has been assigned to you.",
  "functionCalls": null
}
```

### AI Lead Mapping
**POST** `/copilot/map-leads`

Use AI to automatically map CSV column headers to CRM fields.

**Request Body:**
```json
{
  "headers": ["Full Name", "Email Address", "Phone Number", "Lead Source"]
}
```

**Response:** `200 OK`
```json
{
  "leadType": "client",
  "mapping": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "source": "Lead Source"
  }
}
```

---

## Calendar & Appointments

### Get Appointments
**GET** `/appointments`

**Query Parameters:**
- `start` (optional) - Start date (ISO format)
- `end` (optional) - End date (ISO format)

**Response:** `200 OK`
```json
[
  {
    "id": "appt-uuid",
    "title": "Policy Review with Michael Chen",
    "contactName": "Michael Chen",
    "contactId": "contact-uuid",
    "startTime": "2024-08-05T10:00:00Z",
    "endTime": "2024-08-05T11:00:00Z",
    "type": "Meeting",
    "userId": "agent-uuid"
  }
]
```

### Create Appointment
**POST** `/appointments`

**Request Body:**
```json
{
  "title": "Policy Review with Michael Chen",
  "contactName": "Michael Chen",
  "contactId": "contact-uuid",
  "startTime": "2024-08-05T10:00:00Z",
  "endTime": "2024-08-05T11:00:00Z",
  "type": "Meeting"
}
```

**Response:** `201 Created`

---

## Tasks

### Get Tasks
**GET** `/tasks`

**Query Parameters:**
- `assigneeId` (optional) - Filter by assignee
- `status` (optional) - `To-do`, `In Progress`, `Completed`
- `search` (optional) - Search in title/description

**Response:** `200 OK`
```json
[
  {
    "id": "task-uuid",
    "title": "Follow up with Jane Smith",
    "description": "Discuss auto insurance quote",
    "dueDate": "2024-08-10T17:00:00Z",
    "status": "To-do",
    "priority": "High",
    "contactId": "contact-uuid",
    "assigneeId": "agent-uuid",
    "contactName": "Jane Smith"
  }
]
```

### Create Task
**POST** `/tasks`

**Request Body:**
```json
{
  "title": "Follow up with Jane Smith",
  "description": "Discuss auto insurance quote",
  "dueDate": "2024-08-10T17:00:00Z",
  "status": "To-do",
  "priority": "High",
  "contactId": "contact-uuid",
  "assigneeId": "agent-uuid"
}
```

**Response:** `201 Created`

### Update Task
**PUT** `/tasks/:id`

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Response:** `200 OK`

---

## Teams & Agents

### Get All Teams
**GET** `/teams`

**Response:** `200 OK`
```json
[
  {
    "id": "team-uuid",
    "name": "P&C Powerhouse",
    "managerId": "manager-uuid",
    "managerName": "John Smith",
    "memberIds": ["agent1-uuid", "agent2-uuid"]
  }
]
```

### Get All Agents
**GET** `/teams/agents`

Get all agents with calculated performance statistics.

**Response:** `200 OK`
```json
[
  {
    "id": "agent-uuid",
    "name": "Maria Garcia",
    "email": "maria@example.com",
    "avatarUrl": "https://picsum.photos/seed/maria/40/40",
    "role": "Agent/Producer",
    "teamId": "team-uuid",
    "assignedLeads": 45,
    "closeRate": 22.5,
    "policiesSold": 18,
    "revenue": 48900,
    "recruitsOnboarded": 2
  }
]
```

### Get Agent Details
**GET** `/teams/agents/:id`

**Response:** `200 OK`
```json
{
  "id": "agent-uuid",
  "name": "Maria Garcia",
  "assignedLeads": 45,
  "policiesSold": 18,
  "revenue": 48900,
  "opportunities": [ /* active opportunities */ ],
  "activities": [ /* recent activities */ ]
}
```

---

## Service Desk

### Get All Tickets
**GET** `/service/tickets`

**Query Parameters:**
- `status` (optional) - `Open`, `In Progress`, `Pending Client Response`, `Closed`
- `priority` (optional) - `Low`, `Medium`, `High`, `Urgent`
- `assignedTo` (optional) - User ID

**Response:** `200 OK`

### Get Ticket Details
**GET** `/service/tickets/:id`

**Response:** `200 OK`
```json
{
  "id": "ticket-uuid",
  "ticketNumber": "TKT-001234",
  "contactId": "contact-uuid",
  "contactName": "Sarah Johnson",
  "subject": "Policy Change Request",
  "category": "Policy Change Request",
  "status": "Open",
  "priority": "Medium",
  "assignedToId": "agent-uuid",
  "createdAt": "2024-08-01T09:00:00Z",
  "updatedAt": "2024-08-01T09:00:00Z",
  "messages": [
    {
      "id": "msg-uuid",
      "sender": "Client",
      "content": "I need to update my address",
      "timestamp": "2024-08-01T09:00:00Z",
      "isInternalNote": false
    }
  ]
}
```

### Create Ticket
**POST** `/service/tickets`

**Request Body:**
```json
{
  "contactId": "contact-uuid",
  "subject": "Policy Change Request",
  "category": "Policy Change Request",
  "priority": "Medium",
  "initialMessage": "I need to update my address"
}
```

**Response:** `201 Created`

### Add Message to Ticket
**POST** `/service/tickets/:id/messages`

**Request Body:**
```json
{
  "content": "I've updated your address in our system.",
  "isInternalNote": false
}
```

**Response:** `201 Created`

---

## Analytics

### Get Analytics Dashboard
**GET** `/analytics/dashboard`

Get comprehensive analytics data for dashboards.

**Query Parameters:**
- `dateRange` (optional) - Number of days (default: 90)
- `teamId` (optional) - Filter by team
- `agentId` (optional) - Filter by specific agent

**Response:** `200 OK`
```json
{
  "salesPerformance": [
    {
      "week": "2024-07-29T00:00:00Z",
      "policiesSold": 12,
      "revenue": 28500
    }
  ],
  "salesFunnel": [
    { "stage": "New Lead", "count": 45, "totalValue": 125000 },
    { "stage": "Contacted", "count": 32, "totalValue": 98000 },
    { "stage": "Quoted", "count": 18, "totalValue": 67000 },
    { "stage": "Won", "count": 8, "totalValue": 42000 }
  ],
  "leaderboard": [
    {
      "id": "agent-uuid",
      "agentName": "Maria Garcia",
      "avatarUrl": "https://picsum.photos/seed/maria/40/40",
      "policiesSold": 18,
      "revenue": 48900
    }
  ],
  "revenueByLineOfBusiness": [
    { "lineOfBusiness": "Life & Health", "revenue": 125000 },
    { "lineOfBusiness": "P&C", "revenue": 87000 }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing rate limiting middleware.

## Pagination

Currently all list endpoints return all results. For production with large datasets, implement pagination:
- Add `limit` and `offset` query parameters
- Return metadata: `{ data: [...], total: 500, limit: 50, offset: 0 }`
