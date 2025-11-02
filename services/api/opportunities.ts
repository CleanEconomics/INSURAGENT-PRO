// Opportunities (Pipeline) API Service

import { apiClient } from './client';
import { Opportunity } from '../../types';

export interface UpdateOpportunityRequest {
  stage?: string;
  value?: number;
  product?: string;
  lineOfBusiness?: 'Life & Health' | 'P&C';
  closeDate?: string;
}

export const opportunitiesService = {
  async getOpportunities(filters?: {
    lineOfBusiness?: string;
    assignedTo?: string;
  }): Promise<Opportunity[]> {
    const params = new URLSearchParams();
    if (filters?.lineOfBusiness) params.append('lineOfBusiness', filters.lineOfBusiness);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const queryString = params.toString();
    return apiClient.get<Opportunity[]>(
      `/opportunities${queryString ? `?${queryString}` : ''}`
    );
  },

  async updateOpportunity(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
    return apiClient.put<Opportunity>(`/opportunities/${id}`, data);
  },
};
