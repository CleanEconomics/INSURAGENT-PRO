// Analytics API Service

import { apiClient } from './client';

export interface AnalyticsDashboardResponse {
  salesPerformance: {
    week: string;
    policiesSold: number;
    revenue: number;
  }[];
  salesFunnel: {
    stage: string;
    count: number;
    totalValue: number;
  }[];
  leaderboard: {
    id: string;
    agentName: string;
    avatarUrl: string;
    policiesSold: number;
    revenue: number;
  }[];
  revenueByLineOfBusiness: {
    lineOfBusiness: string;
    revenue: number;
  }[];
}

export const analyticsService = {
  async getDashboard(filters?: {
    dateRange?: string;
    teamId?: string;
    agentId?: string;
  }): Promise<AnalyticsDashboardResponse> {
    const params = new URLSearchParams();
    if (filters?.dateRange) params.append('dateRange', filters.dateRange);
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.agentId) params.append('agentId', filters.agentId);

    const queryString = params.toString();
    return apiClient.get<AnalyticsDashboardResponse>(
      `/analytics/dashboard${queryString ? `?${queryString}` : ''}`
    );
  },
};
