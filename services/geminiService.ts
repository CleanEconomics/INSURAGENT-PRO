
import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { CopilotResponse, AiLeadMappingResponse, LeadStatus } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

// Tool Declarations
const searchKnowledgeHub: FunctionDeclaration = {
    name: 'searchKnowledgeHub',
    description: 'Search the company knowledge hub for articles, documents, and videos based on a query.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING, description: 'The search term or question.' },
        },
        required: ['query'],
    },
};

const createClientLead: FunctionDeclaration = {
    name: 'createClientLead',
    description: "Creates a new client lead in the CRM.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The lead's full name." },
            email: { type: Type.STRING, description: "The lead's email address." },
            phone: { type: Type.STRING, description: "The lead's phone number." },
            source: { type: Type.STRING, description: "Where the lead came from (e.g., 'Referral', 'Web Form')." },
        },
        required: ['name', 'email'],
    },
};

const updateClientLead: FunctionDeclaration = {
    name: 'updateClientLead',
    description: "Updates an existing client lead's information. Use the lead's name to find them.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            leadName: { type: Type.STRING, description: "The full name of the lead to update." },
            newStatus: { type: Type.STRING, description: "The new status for the lead.", enum: Object.values(LeadStatus) },
            newPhone: { type: Type.STRING, description: "The new phone number for the lead." },
            newEmail: { type: Type.STRING, description: "The new email address for the lead." },
        },
        required: ['leadName'],
    },
};

const createRecruitLead: FunctionDeclaration = {
    name: 'createRecruitLead',
    description: "Creates a new recruiting lead in the CRM.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The recruit's full name." },
            email: { type: Type.STRING, description: "The recruit's email address." },
            phone: { type: Type.STRING, description: "The recruit's phone number." },
            source: { type: Type.STRING, description: "Where the recruit was found (e.g., 'LinkedIn', 'Indeed')." },
            roleInterest: { type: Type.STRING, description: "The role the recruit is interested in." },
        },
        required: ['name', 'email', 'roleInterest'],
    },
};

const updateRecruitLead: FunctionDeclaration = {
    name: 'updateRecruitLead',
    description: "Updates an existing recruit lead's information. Use the recruit's name to find them.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            leadName: { type: Type.STRING, description: "The full name of the recruit to update." },
            newStatus: { type: Type.STRING, description: "The new status for the recruit.", enum: Object.values(LeadStatus) },
            newPhone: { type: Type.STRING, description: "The new phone number for the recruit." },
            newEmail: { type: Type.STRING, description: "The new email address for the recruit." },
        },
        required: ['leadName'],
    },
};

const scheduleAppointment: FunctionDeclaration = {
    name: 'scheduleAppointment',
    description: "Schedules a new appointment with a lead or contact on the agent's calendar.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            leadName: { type: Type.STRING, description: "The name of the person the appointment is with." },
            title: { type: Type.STRING, description: "The title of the appointment." },
            startDateTimeISO: { type: Type.STRING, description: "The start date and time for the appointment in ISO 8601 format (e.g., '2024-08-15T14:30:00.000Z')." },
            durationMinutes: { type: Type.NUMBER, description: "The duration of the appointment in minutes." },
        },
        required: ['leadName', 'title', 'startDateTimeISO', 'durationMinutes'],
    },
};

const draftEmail: FunctionDeclaration = {
    name: 'draftEmail',
    description: 'Drafts an email to a specific recipient with a subject and body. This is a tool to prepare a draft, it does not send the email.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            recipient: { type: Type.STRING, description: "The recipient's name or email address." },
            subject: { type: Type.STRING, description: 'A compelling subject line for the email.' },
            body: { type: Type.STRING, description: 'The full content of the email body, formatted with line breaks.' }
        },
        required: ['recipient', 'subject', 'body']
    }
};

export const availableTools = [
    searchKnowledgeHub,
    createClientLead,
    updateClientLead,
    createRecruitLead,
    updateRecruitLead,
    scheduleAppointment,
    draftEmail,
];


// NOW CALLS BACKEND API INSTEAD OF FRONTEND GEMINI SDK
export const getAiCopilotResponse = async (history: Content[], context?: string): Promise<CopilotResponse> => {
  try {
    // Call backend API instead of using frontend Gemini SDK
    const { copilotApi } = await import('./api');

    // Extract the last user message from history
    const lastUserMessage = history.filter(h => h.role === 'user').slice(-1)[0];
    const message = lastUserMessage?.parts?.[0]?.text || '';

    const response = await copilotApi.chat(message, context || '', history);

    // Backend returns the AI response in a compatible format
    return response.data;
  } catch (error) {
    console.error('Error calling copilot API:', error);
    return {
      chatResponse: "Sorry, I encountered an error. Please try again."
    };
  }
};


const leadMappingSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The column header in the user's file that corresponds to the lead's full name (e.g., 'Full Name', 'Contact', 'Name')." },
        email: { type: Type.STRING, description: "The column header for the lead's email address." },
        phone: { type: Type.STRING, description: "The column header for the lead's phone number." },
        status: { type: Type.STRING, description: "The column header for the lead's current status (e.g., 'Status', 'Stage'). If not present, this can be omitted." },
        source: { type: Type.STRING, description: "The column header for the lead's source (e.g., 'Source', 'Lead Source')." },
        assignedTo: { type: Type.STRING, description: "For CLIENT leads only. The column for the agent this lead is assigned to." },
        roleInterest: { type: Type.STRING, description: "For RECRUIT leads only. The column for the role the recruit is interested in (e.g., 'Role', 'Position Interest')." },
    },
    required: ["name", "email"],
};

const aiLeadMappingResponseSchema = {
    type: Type.OBJECT,
    properties: {
        leadType: { type: Type.STRING, description: "The type of lead detected. Must be either 'client' or 'recruit'. A column like 'Role Interest' or 'Position' indicates a 'recruit' lead.", enum: ['client', 'recruit'] },
        mapping: leadMappingSchema,
    },
    required: ["leadType", "mapping"],
};

export const getAiLeadMapping = async (headers: string[]): Promise<AiLeadMappingResponse> => {
    if (!API_KEY) {
        throw new Error("AI features are currently unavailable. Please configure the API key.");
    }
    
    try {
        const prompt = `Analyze the following CSV headers and determine the mapping to our CRM lead fields.
        The CRM has two types of leads: 'client' and 'recruit'.
        - A 'recruit' lead will have a column indicating a job role or position they are interested in (e.g., 'Role Interest', 'Position', 'Applying For').
        - If no such column exists, it is a 'client' lead.
        
        Map the provided headers to the following fields: name, email, phone, status, source, assignedTo (for client leads), roleInterest (for recruit leads).
        'name' and 'email' are mandatory. Respond with the determined leadType and the mapping object.

        CSV Headers:
        [${headers.join(', ')}]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aiLeadMappingResponseSchema,
            }
        });

        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error calling Gemini API for lead mapping:", error);
        throw new Error("The AI failed to map the columns. Please check your file format and try again.");
    }
};
