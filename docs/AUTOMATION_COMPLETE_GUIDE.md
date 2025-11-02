# 🤖 Complete Automation Guide - InsurAgent Pro

## 🎉 All Limitations Resolved!

All automation limitations have been fully resolved with production-ready backend integration. Your automations now work in real-time with actual execution!

---

## ✅ What's Been Implemented

### 1. **Full Backend Integration** ✅
- Automations persist in Supabase database
- Survive page refreshes and app restarts
- Real-time sync across all users

### 2. **Actual Automation Execution** ✅
- Automations trigger automatically when events occur
- Actions execute in sequence with real results
- SMS sent via Twilio
- Emails sent via SendGrid
- Tags added to contacts in database
- Leads assigned to agents
- Tasks created automatically

### 3. **Template Variable Processing** ✅
- `{{lead.name}}`, `{{lead.email}}`, etc. replaced with actual values
- Validation ensures variables exist before saving
- Available variables shown based on trigger type

### 4. **Conditional Logic** ✅
- Add conditions to any action
- Only execute actions when conditions are met
- Operators: equals, not_equals, contains, greater_than, less_than

### 5. **More Trigger Types** ✅
- **New Lead Created** - When a lead is added
- **Appointment Booked** - When appointment is scheduled
- **Status Changed to "Working"** - When lead status updates
- **Lead Converted** - When lead becomes a client ⚡ NEW
- **Policy Renewal Due** - 90 days before policy expires ⚡ NEW

### 6. **More Action Types** ✅
- **Wait** - Delay next action
- **Send SMS** - Via Twilio
- **Send Email** - Via SendGrid
- **Add Tag** - Tag contacts
- **Assign to Agent** - Route leads
- **Update Lead Status** - Change lead status ⚡ NEW
- **Create Task** - Auto-create follow-up tasks ⚡ NEW
- **Send Webhook** - Integrate with external systems ⚡ NEW

### 7. **Job Queue for Delays** ✅
- Wait actions schedule future execution
- Cron job processes scheduled actions every minute
- Retry failed jobs up to 3 times
- Full execution history tracking

### 8. **Scheduling Support** ✅
- Automations can wait minutes, hours, days, or weeks
- Scheduled jobs persist across server restarts
- View execution status in database

---

## 🚀 How It Works Now

### **Complete Workflow:**

```
1. User creates automation in UI
       ↓
2. Frontend sends to API → Saves to Supabase
       ↓
3. Backend sets up database listeners
       ↓
4. Event occurs (new lead, appointment booked, etc.)
       ↓
5. Trigger fires automatically
       ↓
6. Actions execute in sequence:
   - SMS sent via Twilio
   - Emails sent via SendGrid
   - Database updates (tags, assignments, tasks)
   - Wait actions schedule future execution
       ↓
7. Job processor handles scheduled actions
       ↓
8. Execution history logged to database
```

---

## 📋 Setup Requirements

### **1. Database Tables** (Already Created)
```sql
- automation_workflows      (stores automations)
- automation_executions     (execution logs)
- automation_jobs           (scheduled actions queue)
```

Run the schema from `SUPABASE_COMPLETE_SCHEMA.sql` - it includes everything!

### **2. API Credentials**

#### **Required for SMS:**
```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```
Get from: https://console.twilio.com/

#### **Required for Email:**
Email automations use **Gmail OAuth** - no API key needed!
1. Navigate to Settings in the app
2. Click "Connect Google Account"
3. Authorize Gmail permissions
4. Emails will be sent from your connected Gmail address

#### **All Others Work Without Credentials!**
- Wait, Add Tag, Assign to Agent, Create Task, Update Status work immediately

---

## 🎯 Creating an Automation

### **Step 1: Navigate to AI Agents → Automations Tab**

### **Step 2: Click "Create Automation"**

### **Step 3: Configure Your Automation**

#### **Name Your Automation**
```
Example: "New Lead Welcome Sequence"
```

#### **Select a Trigger**
Choose when this automation should run:
- **New Lead Created** - Immediate welcome message
- **Appointment Booked** - Confirmation & reminder
- **Status Changed to "Working"** - Hot lead alert
- **Lead Converted** - Success celebration & onboarding
- **Policy Renewal Due** - 90-day renewal reminder

#### **Build Your Action Sequence**

**Simple Example:**
```
Trigger: New Lead Created
Actions:
  1. Wait: 2 minutes
  2. Send SMS: Hi {{lead.name}}, thanks for reaching out! We'll call you soon.
  3. Add Tag: Contacted
  4. Assign to Agent: Jane Doe
```

**Advanced Example with Conditions:**
```
Trigger: New Lead Created
Actions:
  1. Send SMS: Welcome {{lead.name}}!
     Condition: lead.source equals "Web Form"

  2. Wait: 1 hour

  3. Send Email:
     Subject: Your Insurance Quote
     Hi {{lead.name}}, here's your personalized quote...
     Condition: lead.email contains "@"

  4. Assign to Agent: Top Closer
     Condition: lead.status equals "Hot"
```

### **Step 4: Save and Activate**

Toggle the switch to ON (blue) to activate the automation.

---

## 🔧 Advanced Features

### **1. Template Variables**

Available variables depend on the trigger:

#### **New Lead Created:**
```
{{lead.name}}
{{lead.email}}
{{lead.phone}}
{{lead.source}}
{{lead.status}}
{{lead.createdAt}}
```

#### **Appointment Booked:**
```
{{lead.name}}
{{appointment.date}}
{{appointment.time}}
{{appointment.title}}
{{appointment.type}}
```

#### **Policy Renewal Due:**
```
{{contact.name}}
{{contact.email}}
{{policy.number}}
{{policy.product}}
{{policy.renewalDate}}
{{policy.premium}}
```

### **2. Conditional Actions**

Add conditions to any action:

```json
{
  "conditions": [
    {
      "field": "lead.source",
      "operator": "equals",
      "value": "Facebook Ad"
    }
  ]
}
```

**Operators:**
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison

### **3. Wait Durations**

Supports natural language:
```
5 minutes
30 min
2 hours
1 day
3 days
1 week
2 weeks
```

### **4. Email Formatting**

First line with `Subject:` sets the email subject:
```
Subject: Your Quote is Ready!

Hi {{lead.name}},

Thanks for your interest! Attached is your personalized quote.

Best regards,
Your Insurance Team
```

### **5. Webhook Integration**

Send data to external systems:
```
URL: https://example.com/webhook
```

Sends full trigger data as JSON:
```json
{
  "leadId": "123",
  "lead": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  }
}
```

---

## 📊 Monitoring & Analytics

### **View Execution History**

API endpoint: `GET /api/automations/:id/executions`

Returns:
```json
[
  {
    "id": "exec-1",
    "workflow_id": "auto-1",
    "status": "completed",
    "trigger_data": {...},
    "current_action_index": 3,
    "created_at": "2025-10-26T10:00:00Z",
    "completed_at": "2025-10-26T10:05:00Z"
  }
]
```

### **Status Values:**
- `pending` - Scheduled but not started
- `running` - Currently executing
- `completed` - Successfully finished
- `failed` - Error occurred

### **Job Queue Status**

Check scheduled jobs in database:
```sql
SELECT * FROM automation_jobs
WHERE status = 'pending'
ORDER BY scheduled_for;
```

---

## 🔍 Troubleshooting

### **Automation Not Triggering:**
1. Check if automation is active (toggle switch ON)
2. Verify trigger event is occurring (check database)
3. Check backend logs for errors
4. Ensure database listeners are running

### **SMS Not Sending:**
1. Verify Twilio credentials in `.env`
2. Check phone number format (+1234567890)
3. Check Twilio account balance
4. View error in `automation_executions` table

### **Email Not Sending:**
1. Verify Gmail is connected in Settings
2. Check Google OAuth credentials are valid
3. Ensure Gmail API permissions are granted
4. Check backend logs for Gmail API errors
5. Check recipient's spam folder

### **Wait Actions Not Executing:**
1. Ensure job processor is running (starts with server)
2. Check `automation_jobs` table for scheduled items
3. Verify cron job is running: `SELECT * FROM automation_jobs WHERE status='processing'`

### **Template Variables Not Replacing:**
1. Check variable name spelling
2. Verify data exists in trigger (e.g., lead has email)
3. Use validation endpoint: `POST /api/automations/validate-template`

---

## 🎓 Real-World Examples

### **Example 1: Lead Nurture Campaign**
```
Trigger: New Lead Created
Actions:
  1. Wait: 5 minutes
  2. Send SMS: Hi {{lead.name}}! Thanks for reaching out. When's a good time to chat?
  3. Add Tag: Initial Contact
  4. Wait: 2 hours
  5. Send Email:
     Subject: Your Insurance Questions Answered
     [Educational content here]
  6. Wait: 2 days
  7. Assign to Agent: Follow-up Specialist
  8. Create Task: Call lead about their interest
```

### **Example 2: Appointment Reminders**
```
Trigger: Appointment Booked
Actions:
  1. Send Email:
     Subject: Appointment Confirmed - {{appointment.date}}
     Hi {{lead.name}}, looking forward to our meeting!
  2. Wait: 1 day before appointment
  3. Send SMS: Reminder: You have an appointment tomorrow at {{appointment.time}}
  4. Wait: 1 day after appointment
  5. Send Email:
     Subject: Following Up
     Thanks for meeting with us! Any questions?
```

### **Example 3: Policy Renewal Campaign**
```
Trigger: Policy Renewal Due (90 days)
Actions:
  1. Send Email:
     Subject: Your {{policy.product}} Renews in 90 Days
     Hi {{contact.name}}, let's review your coverage.
  2. Create Task: Schedule renewal review with {{contact.name}}
  3. Wait: 30 days
  4. Send SMS: Hi {{contact.name}}, your policy renews in 60 days. Let's chat!
  5. Assign to Agent: Renewal Specialist
  6. Wait: 30 days
  7. Send Email: URGENT: Your policy renews in 30 days!
```

### **Example 4: Hot Lead Alert (with Conditions)**
```
Trigger: Status Changed to "Working"
Actions:
  1. Send SMS: [URGENT] Hot lead! {{lead.name}} from {{lead.source}}
     Condition: lead.source equals "Referral"

  2. Assign to Agent: Top Closer
     Condition: lead.priority equals "High"

  3. Create Task: Call {{lead.name}} within 15 minutes

  4. Send Webhook:
     URL: https://slack.com/webhook
     [Sends notification to Slack]
```

---

## 🔒 Security & Compliance

### **Do Not Contact (DNC) List**
- Automations automatically check DNC list
- No SMS/Email sent to contacts on DNC
- Auto-added when contact replies "STOP"

### **Content Moderation**
- AI filters inappropriate language
- Harmful content blocked before sending
- Rescinded responses logged

### **Data Privacy**
- Template data not logged permanently
- Execution logs can be purged
- GDPR/CCPA compliant

---

## 📱 API Reference

### **Create Automation**
```http
POST /api/automations
Content-Type: application/json

{
  "name": "My Automation",
  "trigger": "New Lead Created",
  "actions": [
    {
      "id": "action-1",
      "type": "Wait",
      "details": "5 minutes"
    },
    {
      "id": "action-2",
      "type": "Send SMS",
      "details": "Hello {{lead.name}}!",
      "conditions": [
        {
          "field": "lead.source",
          "operator": "equals",
          "value": "Web Form"
        }
      ]
    }
  ],
  "is_active": true
}
```

### **Update Automation**
```http
PUT /api/automations/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "actions": [...]
}
```

### **Toggle Active Status**
```http
PATCH /api/automations/:id/toggle
```

### **Delete Automation**
```http
DELETE /api/automations/:id
```

### **Get Executions**
```http
GET /api/automations/:id/executions?limit=50
```

### **Validate Template**
```http
POST /api/automations/validate-template
Content-Type: application/json

{
  "template": "Hi {{lead.name}}, welcome!",
  "trigger": "New Lead Created"
}
```

---

## 🎯 Best Practices

1. **Start Simple** - Test with one action before building complex sequences
2. **Use Waits Strategically** - Don't spam contacts immediately
3. **Test Variables** - Validate templates before activating
4. **Monitor Executions** - Check logs regularly for failures
5. **Set Conditions** - Target actions to relevant leads only
6. **Name Clearly** - Use descriptive automation names
7. **Document Intent** - Add comments in action details
8. **Respect DNC** - Automation checks this automatically
9. **Balance Frequency** - Don't over-automate
10. **Keep It Human** - Personalize with variables

---

## 🚀 Production Checklist

Before going live:

- [ ] Database tables created (`automation_workflows`, `automation_executions`, `automation_jobs`)
- [ ] Twilio credentials configured (if using SMS)
- [ ] Gmail OAuth connected (if using Email)
- [ ] Backend server running with automation services started
- [ ] Job processor cron running (every minute)
- [ ] Database listeners active
- [ ] Test automations created and verified
- [ ] Execution logs monitored
- [ ] DNC list populated
- [ ] Content moderation enabled
- [ ] Error handling tested

---

## 🎉 You're All Set!

Your automation system is now **production-ready** with:
- ✅ Full backend integration
- ✅ Real-time execution
- ✅ Template variables
- ✅ Conditional logic
- ✅ Job scheduling
- ✅ 8 action types
- ✅ 5 trigger types
- ✅ Complete monitoring

**Start creating automations and watch your agency scale!** 🚀

---

## 📞 Support

Questions? Issues? Check:
- Backend logs: `npm run dev` output
- Database: `automation_executions` table
- API errors: Browser console (F12)

For technical support, see the main README.md
