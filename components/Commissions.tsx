
import React from 'react';
import { Commission } from '../types';

const mockCommissions: Commission[] = [
  { id: 'comm1', policyId: 'PL1001', contactName: 'Michael Chen', avatarUrl: 'https://picsum.photos/seed/mchen/40/40', premium: 5000, commissionRate: 0.85, commissionAmount: 4250, status: 'Paid', payoutDate: '2024-07-15' },
  { id: 'comm2', policyId: 'PL1002', contactName: 'Samantha Blue', avatarUrl: 'https://picsum.photos/seed/sblue/40/40', premium: 7500, commissionRate: 0.80, commissionAmount: 6000, status: 'Pending', payoutDate: '2024-08-01' },
  { id: 'comm3', policyId: 'PL1003', contactName: 'David Lee', avatarUrl: 'https://picsum.photos/seed/dlee/40/40', premium: 2500, commissionRate: 0.15, commissionAmount: 375, status: 'Paid', payoutDate: '2024-07-20' },
  { id: 'comm4', policyId: 'PL1004', contactName: 'Emily White', avatarUrl: 'https://picsum.photos/seed/ewhite/40/40', premium: 3200, commissionRate: 0.12, commissionAmount: 384, status: 'Pending', payoutDate: '2024-08-05' },
  { id: 'comm5', policyId: 'PL0988', contactName: 'James Green', avatarUrl: 'https://picsum.photos/seed/jgreen/40/40', premium: 1200, commissionRate: 0.90, commissionAmount: 1080, status: 'Chargeback', payoutDate: '2024-06-15' },
  { id: 'comm6', policyId: 'PL1005', contactName: 'Jessica Taylor', avatarUrl: 'https://picsum.photos/seed/jtaylor/40/40', premium: 1800, commissionRate: 0.85, commissionAmount: 1530, status: 'Paid', payoutDate: '2024-07-22' },
];

const kpiData = [
  { title: "Total Paid (YTD)", value: "$52,850", color: "text-green-500" },
  { title: "Pending Payout", value: "$6,384", color: "text-amber-500" },
  { title: "Chargebacks (YTD)", value: "$1,080", color: "text-red-500" },
];

const KpiCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-surface p-6 rounded-xl shadow-sm">
    <p className="text-sm text-textSecondary font-medium">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const StatusBadge: React.FC<{ status: 'Paid' | 'Pending' | 'Chargeback' }> = ({ status }) => {
  const colorClasses = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-amber-100 text-amber-800',
    Chargeback: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const Commissions: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
      <div className="bg-surface p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-textPrimary">Commission Statements</h2>
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Import Statement
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Client / Policy</th>
                        <th scope="col" className="px-6 py-3">Premium</th>
                        <th scope="col" className="px-6 py-3">Comm. Rate</th>
                        <th scope="col" className="px-6 py-3">Comm. Amount</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Payout Date</th>
                    </tr>
                </thead>
                <tbody>
                    {mockCommissions.map(comm => (
                        <tr key={comm.id} className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                <img className="w-10 h-10 rounded-full" src={comm.avatarUrl} alt={`${comm.contactName} avatar`} />
                                <div className="pl-3">
                                    <div className="text-base font-semibold">{comm.contactName}</div>
                                    <div className="font-normal text-gray-500">{comm.policyId}</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">${comm.premium.toLocaleString()}</td>
                            <td className="px-6 py-4">{(comm.commissionRate * 100).toFixed(0)}%</td>
                            <td className="px-6 py-4 font-semibold text-textPrimary">${comm.commissionAmount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={comm.status} />
                            </td>
                            <td className="px-6 py-4">{new Date(comm.payoutDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Commissions;
