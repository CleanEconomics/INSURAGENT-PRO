import React, { useState } from 'react';
import { DocumentTextIcon, SearchIcon, FilterIcon } from './icons';

interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  clientAvatar: string;
  type: 'Auto' | 'Home' | 'Life' | 'Health' | 'Commercial';
  carrier: string;
  premium: number;
  status: 'Active' | 'Pending' | 'Expired' | 'Cancelled';
  effectiveDate: string;
  expirationDate: string;
  assignedAgent: string;
  renewalProbability?: number;
}

const mockPolicies: Policy[] = [
  {
    id: '1',
    policyNumber: 'AUTO-2024-001',
    clientName: 'John Smith',
    clientAvatar: 'https://i.pravatar.cc/150?img=12',
    type: 'Auto',
    carrier: 'State Farm',
    premium: 1850,
    status: 'Active',
    effectiveDate: '2024-01-15',
    expirationDate: '2025-01-15',
    assignedAgent: 'Jane Doe',
    renewalProbability: 85,
  },
  {
    id: '2',
    policyNumber: 'HOME-2024-042',
    clientName: 'Sarah Johnson',
    clientAvatar: 'https://i.pravatar.cc/150?img=45',
    type: 'Home',
    carrier: 'Allstate',
    premium: 2400,
    status: 'Active',
    effectiveDate: '2024-03-01',
    expirationDate: '2025-03-01',
    assignedAgent: 'John Smith',
    renewalProbability: 92,
  },
  {
    id: '3',
    policyNumber: 'LIFE-2024-128',
    clientName: 'Michael Chen',
    clientAvatar: 'https://i.pravatar.cc/150?img=33',
    type: 'Life',
    carrier: 'Prudential',
    premium: 3600,
    status: 'Active',
    effectiveDate: '2024-02-10',
    expirationDate: '2044-02-10',
    assignedAgent: 'Jane Doe',
    renewalProbability: 95,
  },
  {
    id: '4',
    policyNumber: 'AUTO-2023-892',
    clientName: 'Emily Davis',
    clientAvatar: 'https://i.pravatar.cc/150?img=5',
    type: 'Auto',
    carrier: 'GEICO',
    premium: 1650,
    status: 'Pending',
    effectiveDate: '2024-12-01',
    expirationDate: '2025-12-01',
    assignedAgent: 'Jane Doe',
    renewalProbability: 75,
  },
  {
    id: '5',
    policyNumber: 'HEALTH-2023-456',
    clientName: 'Robert Wilson',
    clientAvatar: 'https://i.pravatar.cc/150?img=68',
    type: 'Health',
    carrier: 'Blue Cross',
    premium: 5200,
    status: 'Expired',
    effectiveDate: '2023-01-01',
    expirationDate: '2024-01-01',
    assignedAgent: 'John Smith',
    renewalProbability: 45,
  },
  {
    id: '6',
    policyNumber: 'COMM-2024-033',
    clientName: 'ABC Corp',
    clientAvatar: 'https://i.pravatar.cc/150?img=70',
    type: 'Commercial',
    carrier: 'The Hartford',
    premium: 12500,
    status: 'Active',
    effectiveDate: '2024-04-15',
    expirationDate: '2025-04-15',
    assignedAgent: 'Jane Doe',
    renewalProbability: 88,
  },
];

const StatusBadge: React.FC<{ status: Policy['status'] }> = ({ status }) => {
  const colorClasses = {
    Active: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Expired: 'bg-red-100 text-red-800',
    Cancelled: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const TypeBadge: React.FC<{ type: Policy['type'] }> = ({ type }) => {
  const colorClasses = {
    Auto: 'bg-blue-100 text-blue-800',
    Home: 'bg-purple-100 text-purple-800',
    Life: 'bg-pink-100 text-pink-800',
    Health: 'bg-green-100 text-green-800',
    Commercial: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[type]}`}>
      {type}
    </span>
  );
};

const RenewalProbabilityBar: React.FC<{ probability: number }> = ({ probability }) => {
  // Clamp probability to 0-100 range to prevent overflow
  const clampedProbability = Math.max(0, Math.min(100, probability));
  
  const getColor = () => {
    if (clampedProbability >= 80) return 'bg-green-500';
    if (clampedProbability >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-24">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-300`} 
            style={{ width: `${clampedProbability}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-semibold text-textPrimary min-w-[3rem] text-right">
        {clampedProbability}%
      </span>
    </div>
  );
};

const Policies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Policy['status']>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | Policy['type']>('All');

  const filteredPolicies = mockPolicies.filter(policy => {
    const matchesSearch = policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || policy.status === statusFilter;
    const matchesType = typeFilter === 'All' || policy.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalPolicies: mockPolicies.length,
    activePolicies: mockPolicies.filter(p => p.status === 'Active').length,
    totalPremium: mockPolicies.filter(p => p.status === 'Active').reduce((sum, p) => sum + p.premium, 0),
    upForRenewal: mockPolicies.filter(p => {
      const daysUntilExpiration = Math.ceil((new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration > 0 && daysUntilExpiration <= 90;
    }).length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary mb-2">Policy Management</h1>
        <p className="text-textSecondary">Track and manage all insurance policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <p className="text-sm text-textSecondary font-medium">Total Policies</p>
          <p className="text-3xl font-bold text-textPrimary mt-2">{stats.totalPolicies}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <p className="text-sm text-textSecondary font-medium">Active Policies</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.activePolicies}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <p className="text-sm text-textSecondary font-medium">Total Premium (Annual)</p>
          <p className="text-3xl font-bold text-primary mt-2">${stats.totalPremium.toLocaleString()}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <p className="text-sm text-textSecondary font-medium">Up for Renewal (90d)</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.upForRenewal}</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by policy number or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="Auto">Auto</option>
                <option value="Home">Home</option>
                <option value="Life">Life</option>
                <option value="Health">Health</option>
                <option value="Commercial">Commercial</option>
              </select>
              <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                + Add Policy
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-textSecondary uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Policy #</th>
                <th scope="col" className="px-6 py-3">Client</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Carrier</th>
                <th scope="col" className="px-6 py-3">Premium</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Expiration</th>
                <th scope="col" className="px-6 py-3">Renewal Prob.</th>
                <th scope="col" className="px-6 py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map(policy => {
                  const daysUntilExpiration = Math.ceil((new Date(policy.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30;
                  
                  return (
                    <tr key={policy.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 font-medium text-primary">
                        {policy.policyNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="w-8 h-8 rounded-full" src={policy.clientAvatar} alt={policy.clientName} />
                          <span className="ml-3 font-semibold text-textPrimary">{policy.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TypeBadge type={policy.type} />
                      </td>
                      <td className="px-6 py-4">{policy.carrier}</td>
                      <td className="px-6 py-4 font-semibold text-textPrimary">
                        ${policy.premium.toLocaleString()}/yr
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={policy.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={isExpiringSoon ? 'text-orange-600 font-semibold' : ''}>
                          {new Date(policy.expirationDate).toLocaleDateString()}
                          {isExpiringSoon && (
                            <div className="text-xs text-orange-600 font-medium">
                              {daysUntilExpiration}d remaining
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {policy.renewalProbability && (
                          <RenewalProbabilityBar probability={policy.renewalProbability} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-textSecondary">{policy.assignedAgent}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-textSecondary">No policies found matching your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Policies;
