# InsurAgent Pro: Complete Feature Guide

## 1. Overview

InsurAgent Pro is a comprehensive, all-in-one platform designed exclusively for insurance agents and agencies. It serves as a centralized hub to manage every aspect of the business, from lead generation and sales to client service and team management. Powered by an intelligent AI Copilot, the platform automates routine tasks, provides data-driven insights, and empowers agents to focus on building relationships and closing deals.

---

## 2. Core User Interface & Navigation

The application is built around a clean, responsive, and intuitive user interface that provides quick access to all tools.

### 2.1. Main Sidebar

The primary navigation menu, located on the left side of the screen. It is fully collapsible to maximize workspace and organizes features into logical groups:

-   **Core:** Dashboard, Leads, Pipeline, Contacts, Team, Recruiting, Commissions, Leaderboard.
-   **Tools:** Calendar, Tasks, AI Agents.
-   **Growth:** Marketing, Training, Knowledge Hub, Analytics, Service Desk.

### 2.2. Header

The top bar provides context and quick actions:
-   **Page Title:** Displays the name of the currently active page.
-   **Global Search:** A powerful search bar, accessible via a click or the `Cmd+K` shortcut, that opens the Command Palette.
-   **Quick Create:** A button that opens a modal to quickly create new Leads, Opportunities, or Appointments from anywhere in the app.
-   **Notification Center:** A real-time notification system, indicated by a bell icon, that alerts users to new leads, upcoming tasks, and other important events.

### 2.3. Command Palette (`Cmd+K`)

A lightning-fast universal search and navigation tool. Users can instantly:
-   Jump to any page within the application (e.g., "Leads," "Pipeline").
-   Search for and navigate directly to a specific contact or lead's profile.

---

## 3. Key Features & Functionality

### 3.1. Dashboard

The central landing page providing a high-level overview of business health and daily priorities.
-   **KPI Cards:** At-a-glance metrics for New Leads, Appointments Set, Policies Sold, and Written Premium.
-   **Sales Performance:** A historical bar chart visualizing sales trends over time.
-   **Today's Tasks:** A focused widget showing all tasks that are due today or overdue for the logged-in user.
-   **Recent Activity Feed:** A real-time log of important events, such as new lead assignments, deal stage changes, and confirmed meetings.
-   **Leaderboard Widget:** A snapshot of the top-performing agents to foster friendly competition.

### 3.2. AI Copilot (Global)

A powerful, persistent AI assistant accessible via a floating icon. The Copilot understands natural language commands and uses integrated "tools" to perform actions across the platform.

-   **Natural Language Interaction:** Users can issue commands like, "Create a new client lead for John Doe" or "Draft an email to Maria Garcia about her auto policy renewal."
-   **Function Calling:** The AI can execute a wide range of tasks, including:
    -   **Creating & Updating Leads:** `createClientLead`, `updateClientLead`, `createRecruitLead`, `updateRecruitLead`.
    -   **Scheduling:** `scheduleAppointment` to add events directly to the calendar.
    -   **Communication:** `draftEmail` to generate complete, context-aware email drafts.
    -   **Information Retrieval:** `searchKnowledgeHub` to find relevant documents and articles from the internal library.
-   **Interactive Results:** The Copilot displays rich, interactive cards for actions like email drafts (with a "Copy to Clipboard" button) or search results.

### 3.3. Leads (CRM)

The central hub for managing all incoming prospects, intelligently separated by type.

-   **Client & Recruit Tabs:** A tabbed interface to keep customer leads and agent recruitment leads distinct.
-   **Lead Detail View:** A comprehensive 360-degree view of each lead that slides out, containing:
    -   **Lead Scoring:** An automated score based on source and status, with a manual override option and a detailed breakdown of the scoring logic.
    -   **Activity Timeline:** A complete history of every touchpoint, including notes, emails, calls, and status changes.
    -   **Quick Actions:** Buttons to send an SMS/Email, schedule a follow-up, or convert the lead.
    -   **Conversion:** A seamless workflow to convert a "Client Lead" into a sales opportunity or a "Recruit Lead" into a candidate in the recruiting pipeline.
-   **Bulk Upload:** An AI-powered CSV importer that automatically analyzes file headers and maps columns to the correct CRM fields.
-   **Communication:** Send SMS or emails directly from the lead detail view using templates or the AI draft assistant via the `CommunicationModal`.

### 3.4. Pipeline (Sales)

A visual, Kanban-style board for tracking sales opportunities from inception to close.

-   **Drag-and-Drop Interface:** Easily move deals between stages: `New Lead`, `Contacted`, `Appointment Set`, `Quoted`, `Issued`, `Won`, and `Lost`.
-   **Opportunity Cards:** Each card displays vital information, including contact name, deal value, product, and expected close date.
-   **Dynamic Summaries:** Each pipeline column shows the total number of deals and their combined value.
-   **Filtering:** Filter the entire pipeline by Line of Business (e.g., "Life & Health" or "P&C").

### 3.5. Recruiting

A dedicated pipeline for managing the agent recruitment process.

-   **Recruiting Kanban Board:** A visual pipeline with stages tailored for recruitment: `Prospecting`, `Qualifying`, `Engagement`, `Presenting`, `Closing`, `Retention`, and `Declined`.
-   **Candidate Management:** Track potential hires as they move through the process, with all relevant information on candidate cards.

### 3.6. Team Management

A portal for sales managers to organize their agents and monitor performance.

-   **Team Creation:** Create distinct teams (e.g., "P&C Powerhouse," "Life & Health Legends") and assign managers.
-   **Agent Roster:** View all agents and assign unassigned members to a team.
-   **Team Performance View:** A detailed table showing key metrics (Assigned Leads, Close Rate, etc.) for every member of a selected team.
-   **Agent Detail View:** Click any agent to open a detailed panel showcasing their individual KPIs, active opportunities, and recent activities.

### 3.7. AI Agents & Automations

A sophisticated control center for deploying and managing the agency's AI workforce.

-   **AI Agents:** Activate, deactivate, and configure autonomous AI bots for tasks like appointment setting and renewal reminders. Configuration includes defining their system prompt, tone, and operational limits.
-   **Automation Builder:** A visual workflow builder to create trigger-based automations. For example: `Trigger: New Lead Created` -> `Action: Wait 5 minutes` -> `Action: Send Welcome SMS`.
-   **Safety & Compliance:** A dedicated section to manage AI guardrails, view the Do Not Contact (DNC) list, and review a log of AI-generated responses that were automatically blocked for safety reasons.

### 3.8. Service Desk

A complete ticketing system for managing client service requests.

-   **Centralized Dashboard:** View KPIs like Open Tickets, Average Response Time, and Customer Satisfaction (CSAT).
-   **Two-Pane Layout:** A highly efficient interface with a filterable list of tickets on the left and a detailed conversation view on the right.
-   **Ticket Management:** Agents can:
    -   Reply directly to clients.
    -   Add private, internal notes visible only to the team.
    -   Update a ticket's status, priority, and assignee.
-   **Ticket Creation:** A simple modal to create new tickets on behalf of clients.

### 3.9. Tasks

A comprehensive task management system to keep the entire team organized.

-   **Centralized Task Hub:** A dedicated page to view, filter, and manage all tasks.
-   **Advanced Filtering:** Filter tasks by assignee, status, priority, or search query.
-   **Personalized & Team Views:** Toggle between "My Tasks" and "All Tasks."
-   **Interactive Task List:** A table view with quick actions to update status or mark tasks as complete. A mobile-friendly card view is also available.

### 3.10. Calendar

An integrated scheduling tool to manage appointments and events.

-   **Multiple Views:** Switch between Month, Week, and Day views for flexible planning.
-   **Appointment Creation:** Click any time slot to open a modal and quickly create a new appointment, linking it to a contact.
-   **Google Calendar Sync:** A prominent banner encourages users to connect their Google Calendar (via the Settings page) for a seamless two-way sync, preventing double-bookings.

### 3.11. Knowledge Hub & Training

A dual-purpose section for internal documentation and agent education.

-   **Knowledge Hub:** A searchable library for compliance documents, sales scripts, presentations, and product info. Admins can easily add new resources.
-   **Training Hub:** A structured learning platform with video courses and documents organized by category (Sales, Product, Compliance). It includes a dedicated section for required onboarding materials and allows admins to upload new training modules.

### 3.12. Marketing

Tools for executing and tracking marketing efforts.

-   **Email Campaigns:** Manage email marketing campaigns from a central dashboard. Users can create new campaigns (with AI assistance for drafting content), view performance reports with detailed analytics (open/click rates, click maps), and schedule sends.
-   **Communication Log:** A unified inbox that aggregates all SMS and email conversations with leads, allowing for quick replies and a complete communication history.

### 3.13. Analytics

A dedicated dashboard for deep-diving into business performance.

-   **Dynamic Filtering:** Filter all analytics by date range, team, or individual agent.
-   **Visual Dashboards:** Includes rich visualizations for:
    -   Sales Performance Over Time
    -   A visual Sales Funnel with conversion rates between stages
    -   A Team Leaderboard ranked by revenue
    -   A Pie Chart breaking down revenue by Line of Business

### 3.14. Settings

A centralized area for personal and workspace configuration.

-   **Profile Management:** Update personal details and change passwords.
-   **Integrations:** Manage connections to third-party services, most notably the crucial two-way sync with Google Calendar.
