import { apiClient } from './client.js';

export interface CommissionStatement {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_commission: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  agent_name?: string;
  agent_avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionDetail {
  id: string;
  statement_id: string;
  policy_id: string;
  transaction_date: string;
  commission_amount: number;
  commission_rate: number;
  premium_amount: number;
  transaction_type: 'New Business' | 'Renewal' | 'Adjustment';
  policy_number?: string;
  product?: string;
  line_of_business?: string;
  client_name?: string;
}

export interface CommissionSummary {
  summary: {
    total_earned: number;
    total_paid: number;
    total_pending: number;
    statement_count: number;
  };
  byLineOfBusiness: Array<{
    line_of_business: string;
    total_commission: number;
    policy_count: number;
  }>;
  recentTransactions: CommissionDetail[];
}

export const commissionsService = {
  // Get commission statements
  getStatements: async (params?: {
    agentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CommissionStatement[]> => {
    return apiClient.get('/commissions/statements', { params });
  },

  // Get commission summary
  getSummary: async (params?: {
    agentId?: string;
    period?: 'current' | 'ytd' | 'last-year';
  }): Promise<CommissionSummary> => {
    return apiClient.get('/commissions/summary', { params });
  },

  // Get commission details for a statement
  getStatementDetails: async (
    statementId: string
  ): Promise<{
    statement: CommissionStatement;
    details: CommissionDetail[];
  }> => {
    return apiClient.get(`/commissions/statements/${statementId}`);
  },

  // Create a commission statement (managers only)
  createStatement: async (data: {
    userId: string;
    periodStart: string;
    periodEnd: string;
    totalCommission: number;
    status?: 'Pending' | 'Paid' | 'Cancelled';
  }): Promise<CommissionStatement> => {
    return apiClient.post('/commissions/statements', data);
  },

  // Update commission statement status (managers only)
  updateStatementStatus: async (
    statementId: string,
    status: 'Pending' | 'Paid' | 'Cancelled'
  ): Promise<CommissionStatement> => {
    return apiClient.patch(`/commissions/statements/${statementId}`, { status });
  },
};
