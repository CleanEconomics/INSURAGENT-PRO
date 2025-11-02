// Teams & Agents API Service

import { apiClient } from './client';
import { Team, AgentWithStats } from '../../types';

export interface CreateTeamRequest {
  name: string;
  managerId: string;
}

export interface AddTeamMemberRequest {
  memberId: string;
}

export const teamsService = {
  async getTeams(): Promise<Team[]> {
    return apiClient.get<Team[]>('/teams');
  },

  async createTeam(data: CreateTeamRequest): Promise<Team> {
    return apiClient.post<Team>('/teams', data);
  },

  async addTeamMember(teamId: string, data: AddTeamMemberRequest): Promise<void> {
    return apiClient.put(`/teams/${teamId}/members`, data);
  },

  async getAgents(): Promise<AgentWithStats[]> {
    return apiClient.get<AgentWithStats[]>('/teams/agents');
  },

  async getAgentById(id: string): Promise<any> {
    return apiClient.get(`/teams/agents/${id}`);
  },
};
