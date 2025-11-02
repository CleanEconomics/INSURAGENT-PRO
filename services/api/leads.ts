// Leads API Service

import { apiClient } from './client';
import { ClientLead, RecruitLead, Activity } from '../../types';

export interface CreateClientLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  assignedToId?: string;
  status?: string;
}

export interface UpdateClientLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  assignedToId?: string;
  score?: number;
  priority?: 'Low' | 'Medium' | 'High';
}

export interface CreateRecruitLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  roleInterest?: string;
  status?: string;
}

export interface UpdateRecruitLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  roleInterest?: string;
  score?: number;
  priority?: 'Low' | 'Medium' | 'High';
}

export interface AddActivityRequest {
  type: 'Call' | 'Email' | 'Note' | 'Status Change' | 'Appointment';
  content: string;
}

export interface BulkImportRequest {
  leadType: 'client' | 'recruit';
  leads: any[];
}

export const leadsService = {
  // Client Leads
  async getClientLeads(filters?: { status?: string; assignedTo?: string }): Promise<ClientLead[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const queryString = params.toString();
    return apiClient.get<ClientLead[]>(
      `/leads/client-leads${queryString ? `?${queryString}` : ''}`
    );
  },

  async createClientLead(data: CreateClientLeadRequest): Promise<ClientLead> {
    return apiClient.post<ClientLead>('/leads/client-leads', data);
  },

  async updateClientLead(id: string, data: UpdateClientLeadRequest): Promise<ClientLead> {
    return apiClient.put<ClientLead>(`/leads/client-leads/${id}`, data);
  },

  async convertClientLead(id: string): Promise<{ contact: any; opportunity: any }> {
    return apiClient.post(`/leads/client-leads/${id}/convert`);
  },

  async addActivity(leadId: string, data: AddActivityRequest): Promise<Activity> {
    return apiClient.post<Activity>(`/leads/client-leads/${leadId}/activities`, data);
  },

  // Recruit Leads
  async getRecruitLeads(filters?: { status?: string }): Promise<RecruitLead[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    return apiClient.get<RecruitLead[]>(
      `/leads/recruit-leads${queryString ? `?${queryString}` : ''}`
    );
  },

  async createRecruitLead(data: CreateRecruitLeadRequest): Promise<RecruitLead> {
    return apiClient.post<RecruitLead>('/leads/recruit-leads', data);
  },

  async updateRecruitLead(id: string, data: UpdateRecruitLeadRequest): Promise<RecruitLead> {
    return apiClient.put<RecruitLead>(`/leads/recruit-leads/${id}`, data);
  },

  async convertRecruitLead(id: string): Promise<any> {
    return apiClient.post(`/leads/recruit-leads/${id}/convert`);
  },

  // Bulk Import
  async bulkImport(data: BulkImportRequest): Promise<{ imported: number; leads: any[] }> {
    return apiClient.post('/leads/bulk-import', data);
  },
};
