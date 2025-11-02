import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Supabase auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Leads API
export const leadsApi = {
  getClientLeads: () => api.get('/leads/client-leads'),
  createClientLead: (data: any) => api.post('/leads/client-leads', data),
  updateClientLead: (id: string, data: any) => api.put(`/leads/client-leads/${id}`, data),
  deleteClientLead: (id: string) => api.delete(`/leads/client-leads/${id}`),

  getRecruitLeads: () => api.get('/leads/recruit-leads'),
  createRecruitLead: (data: any) => api.post('/leads/recruit-leads', data),
  updateRecruitLead: (id: string, data: any) => api.put(`/leads/recruit-leads/${id}`, data),
  deleteRecruitLead: (id: string) => api.delete(`/leads/recruit-leads/${id}`),
};

// Contacts API
export const contactsApi = {
  getAll: () => api.get('/contacts'),
  create: (data: any) => api.post('/contacts', data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Appointments API
export const appointmentsApi = {
  getAll: () => api.get('/appointments'),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Teams API
export const teamsApi = {
  getAll: () => api.get('/teams'),
  getAgents: () => api.get('/teams/agents'),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

// Opportunities API
export const opportunitiesApi = {
  getAll: () => api.get('/opportunities'),
  create: (data: any) => api.post('/opportunities', data),
  update: (id: string, data: any) => api.put(`/opportunities/${id}`, data),
  delete: (id: string) => api.delete(`/opportunities/${id}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Service Tickets API
export const serviceApi = {
  getTickets: () => api.get('/service/tickets'),
  createTicket: (data: any) => api.post('/service/tickets', data),
  updateTicket: (id: string, data: any) => api.put(`/service/tickets/${id}`, data),
};

// Automations API
export const automationsApi = {
  getAll: () => api.get('/automations'),
  get: (id: string) => api.get(`/automations/${id}`),
  create: (data: any) => api.post('/automations', data),
  update: (id: string, data: any) => api.put(`/automations/${id}`, data),
  delete: (id: string) => api.delete(`/automations/${id}`),
  toggle: (id: string) => api.patch(`/automations/${id}/toggle`),
};

// AI Agents API
export const aiAgentsApi = {
  getAll: () => api.get('/ai-agents/agents'),
  execute: (id: string, data: any) => api.post(`/ai-agents/agents/${id}/execute`, data),
};

// Copilot API
export const copilotApi = {
  chat: (message: string, context: any, history: any[]) =>
    api.post('/copilot/chat', { message, context, history }),
};

// Marketing API
export const marketingApi = {
  getCampaigns: () => api.get('/marketing/campaigns'),
  createCampaign: (data: any) => api.post('/marketing/campaigns', data),
  updateCampaign: (id: string, data: any) => api.put(`/marketing/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/marketing/campaigns/${id}`),
  sendCampaign: (id: string) => api.post(`/marketing/campaigns/${id}/send`),
  getCampaignStats: (id: string) => api.get(`/marketing/campaigns/${id}/stats`),
};

// Commissions API
export const commissionsApi = {
  getAll: () => api.get('/commissions'),
  create: (data: any) => api.post('/commissions', data),
  update: (id: string, data: any) => api.put(`/commissions/${id}`, data),
  delete: (id: string) => api.delete(`/commissions/${id}`),
};

export default api;
