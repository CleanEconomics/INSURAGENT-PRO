// Service Desk API Service

import { apiClient } from './client';
import { ServiceTicket } from '../../types';

export interface CreateTicketRequest {
  contactId: string;
  subject: string;
  category: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  initialMessage?: string;
}

export interface UpdateTicketRequest {
  status?: string;
  priority?: string;
  assignedToId?: string;
}

export interface AddTicketMessageRequest {
  content: string;
  isInternalNote?: boolean;
}

export const serviceService = {
  async getTickets(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
  }): Promise<ServiceTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const queryString = params.toString();
    return apiClient.get<ServiceTicket[]>(
      `/service/tickets${queryString ? `?${queryString}` : ''}`
    );
  },

  async getTicketById(id: string): Promise<ServiceTicket> {
    return apiClient.get<ServiceTicket>(`/service/tickets/${id}`);
  },

  async createTicket(data: CreateTicketRequest): Promise<ServiceTicket> {
    return apiClient.post<ServiceTicket>('/service/tickets', data);
  },

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<ServiceTicket> {
    return apiClient.put<ServiceTicket>(`/service/tickets/${id}`, data);
  },

  async addMessage(ticketId: string, data: AddTicketMessageRequest): Promise<any> {
    return apiClient.post(`/service/tickets/${ticketId}/messages`, data);
  },
};
