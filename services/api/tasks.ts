// Tasks API Service

import { apiClient } from './client';
import { Task } from '../../types';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  status?: 'To-do' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  contactId?: string;
  assigneeId?: string;
  reminder?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'To-do' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
}

export const tasksService = {
  async getTasks(filters?: {
    assigneeId?: string;
    status?: string;
    search?: string;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return apiClient.get<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks', data);
  },

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },
};
