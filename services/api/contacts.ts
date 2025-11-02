// Contacts API Service

import { apiClient } from './client';
import { Contact } from '../../types';

export interface CreateContactRequest {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

export interface AddPolicyRequest {
  policyNumber: string;
  product: string;
  lineOfBusiness: 'Life & Health' | 'P&C';
  premium: number;
  effectiveDate: string;
  expirationDate: string;
}

export const contactsService = {
  async getContacts(): Promise<Contact[]> {
    return apiClient.get<Contact[]>('/contacts');
  },

  async getContactById(id: string): Promise<any> {
    return apiClient.get(`/contacts/${id}`);
  },

  async createContact(data: CreateContactRequest): Promise<Contact> {
    return apiClient.post<Contact>('/contacts', data);
  },

  async updateContact(id: string, data: UpdateContactRequest): Promise<Contact> {
    return apiClient.put<Contact>(`/contacts/${id}`, data);
  },

  async addPolicy(contactId: string, data: AddPolicyRequest): Promise<any> {
    return apiClient.post(`/contacts/${contactId}/policies`, data);
  },

  async updatePolicy(contactId: string, policyId: string, data: Partial<AddPolicyRequest>): Promise<any> {
    return apiClient.put(`/contacts/${contactId}/policies/${policyId}`, data);
  },

  async deletePolicy(contactId: string, policyId: string): Promise<void> {
    return apiClient.delete(`/contacts/${contactId}/policies/${policyId}`);
  },
};
