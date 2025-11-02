import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Define tools available to the AI Copilot
const tools = [
  {
    name: 'searchKnowledgeHub',
    description: 'Search the knowledge hub for documents, presentations, compliance info, and sales scripts.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'createClientLead',
    description: 'Create a new client lead in the CRM system.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the lead' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        source: { type: 'string', description: 'Lead source (e.g., Web Form, Referral)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'updateClientLead',
    description: 'Update an existing client lead.',
    parameters: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'ID of the lead to update' },
        status: { type: 'string', description: 'New status' },
        notes: { type: 'string', description: 'Additional notes' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'createRecruitLead',
    description: 'Create a new recruit lead for agent hiring.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        roleInterest: { type: 'string', description: 'Role they are interested in' },
      },
      required: ['name'],
    },
  },
  {
    name: 'updateRecruitLead',
    description: 'Update an existing recruit lead.',
    parameters: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'ID of the recruit lead' },
        status: { type: 'string', description: 'New status' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'scheduleAppointment',
    description: 'Schedule a new appointment or meeting.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Appointment title' },
        contactName: { type: 'string', description: 'Contact name' },
        startTime: { type: 'string', description: 'Start time in ISO format' },
        endTime: { type: 'string', description: 'End time in ISO format' },
        type: { type: 'string', description: 'Type: Meeting, Call, or Follow-up' },
      },
      required: ['title', 'contactName', 'startTime', 'endTime'],
    },
  },
  {
    name: 'draftEmail',
    description: 'Draft a professional email.',
    parameters: {
      type: 'object',
      properties: {
        recipient: { type: 'string', description: 'Recipient name or email' },
        subject: { type: 'string', description: 'Email subject' },
        purpose: { type: 'string', description: 'Purpose of the email' },
        tone: { type: 'string', description: 'Tone: professional, friendly, formal' },
      },
      required: ['recipient', 'purpose'],
    },
  },
  {
    name: 'createTask',
    description: 'Create a new task in the task management system.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        priority: { type: 'string', description: 'Priority: Low, Medium, or High' },
        contactId: { type: 'string', description: 'Related contact ID (optional)' },
      },
      required: ['title', 'dueDate'],
    },
  },
  {
    name: 'createOpportunity',
    description: 'Create a new sales opportunity in the pipeline.',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'Contact ID for this opportunity' },
        value: { type: 'number', description: 'Expected deal value in dollars' },
        product: { type: 'string', description: 'Product name (e.g., Term Life, Auto Insurance)' },
        lineOfBusiness: { type: 'string', description: 'Line of Business: Life & Health or P&C' },
        closeDate: { type: 'string', description: 'Expected close date in YYYY-MM-DD format' },
      },
      required: ['contactId', 'value', 'product'],
    },
  },
  {
    name: 'getContactByName',
    description: 'Find a contact by their name to get their ID and details.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full or partial name of the contact' },
      },
      required: ['name'],
    },
  },
  {
    name: 'getLeadByName',
    description: 'Find a lead by their name to get their ID and details.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full or partial name of the lead' },
        leadType: { type: 'string', description: 'Type of lead: client or recruit' },
      },
      required: ['name'],
    },
  },
  {
    name: 'createContact',
    description: 'Create a new contact in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        company: { type: 'string', description: 'Company name (optional)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
      },
      required: ['name'],
    },
  },
  {
    name: 'addNoteToLead',
    description: 'Add a note or activity to a lead.',
    parameters: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID' },
        leadType: { type: 'string', description: 'Type: client or recruit' },
        note: { type: 'string', description: 'Note content' },
      },
      required: ['leadId', 'leadType', 'note'],
    },
  },
  {
    name: 'sendSMS',
    description: 'Send an SMS message to a lead or contact.',
    parameters: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', description: 'Contact or lead ID' },
        recipientType: { type: 'string', description: 'Type: contact, client_lead, or recruit_lead' },
        message: { type: 'string', description: 'SMS message content (keep under 160 characters)' },
      },
      required: ['recipientId', 'recipientType', 'message'],
    },
  },
  {
    name: 'sendEmail',
    description: 'Send an email to a lead or contact.',
    parameters: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', description: 'Contact or lead ID' },
        recipientType: { type: 'string', description: 'Type: contact, client_lead, or recruit_lead' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body content' },
      },
      required: ['recipientId', 'recipientType', 'subject', 'body'],
    },
  },
  {
    name: 'getUpcomingAppointments',
    description: 'Get upcoming appointments for the user.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look ahead (default 7)' },
      },
    },
  },
  {
    name: 'getTasks',
    description: 'Get tasks for the user, optionally filtered.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: To-do, In Progress, or Completed' },
        priority: { type: 'string', description: 'Filter by priority: Low, Medium, or High' },
      },
    },
  },
];

export async function getAiCopilotResponse(history: any[], context?: string) {
  try {
    const systemInstruction = `You are an intelligent AI assistant for InsurAgent Pro, an insurance agency management platform.
You help insurance agents with:
- Managing leads and contacts
- Scheduling appointments
- Drafting professional communications
- Finding information in the knowledge base
- Creating and updating CRM records

Be concise, professional, and helpful. When users ask you to perform actions, use the available tools.`;

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      ...history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.parts?.[0]?.text || msg.content || '' }]
      })),
      { role: 'user', parts: [{ text: context || '' }] }
    ];

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
    });

    // Return text response
    return {
      functionCalls: null,
      chatResponse: response.text || '',
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function getAiFunctionResponse(history: any[], functionResponses: any[]) {
  try {
    const contents = [
      { role: 'user', parts: [{ text: 'You are an intelligent AI assistant for InsurAgent Pro.' }] },
      ...history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.parts?.[0]?.text || msg.content || '' }]
      })),
    ];

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
    });

    return {
      chatResponse: response.text || '',
      functionCalls: null,
    };
  } catch (error) {
    console.error('Gemini function response error:', error);
    throw new Error('Failed to get AI function response');
  }
}

export async function getAiLeadMapping(headers: string[]) {
  try {
    const prompt = `You are analyzing CSV headers to map them to CRM fields for lead import.

CSV Headers: ${headers.join(', ')}

Map these headers to the appropriate fields. Available fields are:
- name (full name)
- email
- phone
- status (New, Contacted, Working, Unqualified)
- source (lead source)
- assignedTo (for client leads)
- roleInterest (for recruit leads)

Also determine if these are client leads or recruit leads based on the headers.

Return a JSON object in this exact format:
{
  "leadType": "client" or "recruit",
  "mapping": {
    "name": "header name that maps to name field",
    "email": "header name that maps to email field",
    ... etc
  }
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('AI lead mapping error:', error);
    throw new Error('Failed to map lead fields');
  }
}
