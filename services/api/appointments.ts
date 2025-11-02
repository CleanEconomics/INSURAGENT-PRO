// Appointments API Service

import { apiClient } from './client';
import { Appointment } from '../../types';

export interface CreateAppointmentRequest {
  title: string;
  contactName: string;
  contactId?: string;
  startTime: string;
  endTime: string;
  type: 'Meeting' | 'Call' | 'Follow-up';
}

export const appointmentsService = {
  async getAppointments(filters?: { start?: string; end?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.start) params.append('start', filters.start);
    if (filters?.end) params.append('end', filters.end);

    const queryString = params.toString();
    return apiClient.get<Appointment[]>(
      `/appointments${queryString ? `?${queryString}` : ''}`
    );
  },

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', data);
  },
};
