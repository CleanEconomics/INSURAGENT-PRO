# InsurAgent Pro - Backend Development Guide

## 1. Introduction

This document outlines the backend requirements to support the InsurAgent Pro frontend application. It details the necessary data models, API endpoints, AI integrations, and real-time event handling.

**Core Technologies:**
- **Language:** Node.js/TypeScript (Recommended)
- **Framework:** Express.js, NestJS, or similar
- **Database:** PostgreSQL
- **API Style:** REST for commands (Create, Update, Delete), GraphQL for complex queries (optional but recommended for analytics).
- **Real-time:** WebSockets (e.g., with Socket.IO)
- **Authentication:** JWT (JSON Web Tokens)

---

## 2. Core Concepts

### 2.1. Authentication & Authorization

- **JWT Flow:**
  - `POST /auth/login`: User submits credentials, backend validates, and returns a JWT.
  - `POST /auth/register`: Create a new user account.
  - All subsequent authenticated requests must include the JWT in the `Authorization: Bearer <token>` header.
- **Role-Based Access Control (RBAC):**
  - The `User` model should have a `role` field (e.g., 'Agent/Producer', 'Sales Manager', 'Admin').
  - API endpoints should be protected by middleware that checks the user's role against the required permissions for that action.

### 2.2. Database Models (PostgreSQL Schemas)

The frontend `types.ts` file is the source of truth for all data structures. The backend should create tables that mirror these types. Key models include:

- `User` (extends `Agent` type, adds hashed password, role)
- `Team`
- `Contact`
- `Policy`
- `ClientLead`
- `RecruitLead`
- `Activity` (polymorphic relationship to Leads and other records)
- `Opportunity`
- `AgentCandidate`
- `Appointment`
- `Task`
- `ServiceTicket`
- `TicketMessage`
- `KnowledgeResource`
- `TrainingModule`
- `Commission`
- `EmailCampaign`
- `Message` (for unified inbox)
- `AiAgent`
- `Automation`
- `Notification`
- `DncEntry`
- `RescindedResponse`

### 2.3. Real-time Events (WebSockets)

A WebSocket server is crucial for pushing real-time updates to connected clients.

**Events to Emit from Backend:**
- `notification:new`: For general alerts (new lead, task assigned, etc.).
- `message:incoming`: When a new SMS/email is received from a lead.
- `lead:updated`: When a lead's details or status change.
- `opportunity:updated`: When an opportunity's stage is changed in the pipeline.
- `ticket:updated`: When a service ticket is updated with a new message or status change.
- `appointment:created` / `appointment:updated`
- `task:created` / `task:updated`

---

## 3. API Endpoints by Feature

### 3.1. CRM

#### Leads (`/leads`)
- `GET /client-leads`: Fetch all client leads. Supports filtering via query params (e.g., `?status=New`).
- `GET /recruit-leads`: Fetch all recruit leads. Supports filtering.
- `POST /client-leads` / `POST /recruit-leads`: Create a new lead.
- `PUT /leads/:id`: Update a lead's details (e.g., status, contact info, score).
- `POST /leads/:id/activities`: Add a new activity (note, call log) to a lead.
- `POST /client-leads/:id/convert`: Convert a client lead into an opportunity and a contact.
- `POST /recruit-leads/:id/convert`: Convert a recruit lead into an agent candidate.
- `POST /leads/bulk-import`: Handles the bulk upload of leads from a CSV file.

#### Contacts (`/contacts`)
- `GET /contacts`: Fetch all contacts.
- `POST /contacts`: Create a new contact.
- `PUT /contacts/:id`: Update a contact's details.
- `GET /contacts/:id`: Fetch full contact details, including related policies, activities, opportunities, etc.
- `POST /contacts/:contactId/policies`: Add a new policy to a contact.
- `PUT /contacts/:contactId/policies/:policyId`: Update a policy.
- `DELETE /contacts/:contactId/policies/:policyId`: Delete a policy.

#### Pipeline (`/opportunities`)
- `GET /opportunities`: Fetch all opportunities.
- `PUT /opportunities/:id`: Update an opportunity. Primarily used for drag-and-drop stage changes. Body: `{ "stage": "Quoted" }`.

### 3.2. AI Copilot & Gemini Integration

This is a critical backend service that orchestrates calls to the Google GenAI API.

#### Chat Endpoint (`/copilot/chat`)
- `POST /copilot/chat`: The main endpoint for all Copilot interactions.
  - **Request Body:** `{ "history": [...], "context": "..." }`
  - **Backend Logic:**
    1. Receive the request from the frontend.
    2. Call `geminiService.getAiCopilotResponse(history, context)`.
    3. **If the Gemini response contains `functionCalls`:**
       a. For each `call` in `functionCalls`, execute a corresponding backend service function. The backend must have a handler for every tool defined in `geminiService.ts`:
          - `searchKnowledgeHub` -> `knowledgeHubService.search(...)`
          - `createClientLead` -> `leadService.createClient(...)`
          - `updateClientLead` -> `leadService.updateClient(...)`
          - `createRecruitLead` -> `leadService.createRecruit(...)`
          - `updateRecruitLead` -> `leadService.updateRecruit(...)`
          - `scheduleAppointment` -> `calendarService.createAppointment(...)`
          - `draftEmail` -> This is a special case. The backend can simply return the drafted content for the frontend to display. No internal service call is needed.
       b. Collect the results from your internal services.
       c. Make a **second** call to the Gemini API, passing the original history plus the model's function call and the results from your services as a function response.
       d. Gemini will return a natural language summary (e.g., "OK, I've scheduled that meeting for you.").
       e. Send this final text response back to the frontend.
    4. **If the Gemini response contains only a `chatResponse` (text):**
       a. Send this text directly back to the frontend.
  - **Response Body:** `{ "chatResponse": "...", "functionCalls": null }`

#### Lead Mapping (`/leads/bulk-map`)
- `POST /leads/bulk-map`: Used by the bulk upload feature.
  - **Request Body:** `{ "headers": ["Full Name", "Email Address", "Source"] }`
  - **Backend Logic:** Call the `geminiService.getAiLeadMapping(headers)` function and return the structured JSON response.

### 3.3. Calendar & Appointments (`/appointments`)
- `GET /appointments`: Fetch appointments for a date range (`?start=...&end=...`).
- `POST /appointments`: Create a new appointment.
- **Google Calendar Integration:**
  - A backend service is needed to handle the OAuth 2.0 flow.
  - Store user refresh tokens securely.
  - Implement two-way sync via Google Calendar API push notifications (webhooks) and API calls from your app.

### 3.4. Marketing & Communications
#### Campaigns (`/campaigns`)
- Standard CRUD endpoints for email campaigns.
- `POST /campaigns/:id/send`: Triggers sending a campaign via an email service (e.g., SendGrid).
#### Messages (`/messages`)
- `GET /messages`: Fetch all conversations for the authenticated user.
- `GET /messages/:leadId`: Fetch the message history for a specific lead.
- `POST /messages/send`: Send a new SMS or Email. Integrates with a provider like Twilio.
- `POST /webhooks/incoming-message`: A public endpoint to receive incoming message webhooks. On receipt, create a `Message` record and emit a `message:incoming` WebSocket event.

### 3.5. Tasks (`/tasks`)
- `GET /tasks`: Fetch tasks. Supports filtering by assignee (`?assigneeId=...`) and status.
- `POST /tasks`: Create a new task.
- `PUT /tasks/:id`: Update a task.

### 3.6. Team Management
- `GET /teams`: Fetch all teams.
- `POST /teams`: Create a new team.
- `PUT /teams/:id/members`: Add a member to a team.
- `GET /agents`: Fetch all agents, including their calculated stats (`AgentWithStats`). This is a read-heavy endpoint and should be optimized.

### 3.7. Service Desk (`/tickets`)
- `GET /tickets`: Fetch service tickets, with filtering.
- `POST /tickets`: Create a new ticket.
- `GET /tickets/:id`: Get full details for one ticket, including all messages.
- `POST /tickets/:id/messages`: Add a new message or internal note to a ticket. Emit `ticket:updated` event.
- `PUT /tickets/:id`: Update ticket properties like status, priority, or assignee.

### 3.8. AI Agents & Automations
- `/ai-agents`: Standard CRUD endpoints.
- `/automations`: Standard CRUD endpoints.
- `/dnc-list`: Endpoints to get and manage the Do-Not-Contact list.
- `/safety/rescinded-responses`: Endpoint to log and retrieve AI responses that were blocked by safety guardrails.

### 3.9. Training & Knowledge
- `/training/modules`: Standard CRUD endpoints for `TrainingModule` resources.
- `/knowledge-hub/resources`: Standard CRUD endpoints for `KnowledgeResource` resources.

### 3.10. Notifications (`/notifications`)
- `GET /notifications`: Get all notifications for the current user.
- `POST /notifications/mark-read`: Mark all notifications as read.

### 3.11. Analytics (`/analytics/dashboard`)
- `GET /analytics/dashboard`: A single, powerful endpoint to gather all data for the analytics page.
  - **Query Params:** `?dateRange=90d&teamId=team1&agentId=agent4`
  - **Backend Logic:** This is a read-heavy operation requiring optimized database aggregations (SUM, COUNT, AVG) on the `opportunities` and `leads` tables, grouped by various dimensions.
  - **Response Body:** A large JSON object containing pre-formatted data for every chart and KPI card on the page.

---

This guide provides the core blueprint. Each additional frontend module will require its own set of corresponding database models and CRUD API endpoints following the patterns outlined above.
