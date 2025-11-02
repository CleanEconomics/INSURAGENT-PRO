import { Automation } from '../types';
import api from './api';

const AUTOMATIONS_BASE = '/automations';

export const automationApi = {
  /**
   * Get all automations
   */
  async getAll(): Promise<Automation[]> {
    const response = await api.get(AUTOMATIONS_BASE);
    return response.data;
  },

  /**
   * Get a single automation by ID
   */
  async getById(id: string): Promise<Automation> {
    const response = await api.get(`${AUTOMATIONS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new automation
   */
  async create(automation: Omit<Automation, 'id' | 'created_at' | 'updated_at'>): Promise<Automation> {
    const response = await api.post(AUTOMATIONS_BASE, automation);
    return response.data;
  },

  /**
   * Update an existing automation
   */
  async update(id: string, automation: Partial<Automation>): Promise<Automation> {
    const response = await api.put(`${AUTOMATIONS_BASE}/${id}`, automation);
    return response.data;
  },

  /**
   * Toggle automation active status
   */
  async toggle(id: string): Promise<Automation> {
    const response = await api.patch(`${AUTOMATIONS_BASE}/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete an automation
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${AUTOMATIONS_BASE}/${id}`);
  },

  /**
   * Get execution history for an automation
   */
  async getExecutions(id: string, limit: number = 50): Promise<any[]> {
    const response = await api.get(`${AUTOMATIONS_BASE}/${id}/executions`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Validate template variables
   */
  async validateTemplate(template: string, trigger: string): Promise<{
    valid: boolean;
    errors: string[];
    availableVariables: string[];
  }> {
    const response = await api.post(`${AUTOMATIONS_BASE}/validate-template`, {
      template,
      trigger,
    });
    return response.data;
  },
};
