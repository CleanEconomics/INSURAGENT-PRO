// AI Copilot API Service

import { apiClient } from './client';
import { CopilotResponse, AiLeadMappingResponse } from '../../types';

export interface ChatRequest {
  history: any[];
  context?: string;
}

export interface MapLeadsRequest {
  headers: string[];
}

export const copilotService = {
  async chat(data: ChatRequest): Promise<CopilotResponse> {
    return apiClient.post<CopilotResponse>('/copilot/chat', data);
  },

  async mapLeads(data: MapLeadsRequest): Promise<AiLeadMappingResponse> {
    return apiClient.post<AiLeadMappingResponse>('/copilot/map-leads', data);
  },
};
