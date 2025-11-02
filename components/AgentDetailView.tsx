
import React from 'react';
import { AgentWithStats, Opportunity, ClientLead, PipelineStage, ActivityType, LeadStatus } from '../types';
import { CloseIcon, PhoneIcon, EmailIcon, NoteIcon, StatusChangeIcon, CalendarIcon } from './icons';

interface AgentDetailViewProps {
  agent: AgentWithStats;
  opportunities: Opportunity[];
  clientLeads: ClientLead[];
  onClose: () => void;
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-background p-4 rounded-lg text-center">
        <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-primary-dark mt-1">{value}</p>
    </div>
);

const STAGE_COLORS: { [key in PipelineStage]: string } = {
  [PipelineStage.NewLead]: 'bg-blue-100 text-blue-800',
  [PipelineStage.Contacted]: 'bg-sky-100 text-sky-800',
  [PipelineStage.AppointmentSet]: 'bg-indigo-100 text-indigo-800',
  [PipelineStage.Quoted]: 'bg-purple-100 text-purple-800',
  [PipelineStage.Issued]: 'bg-amber-100 text-amber-800',
  [PipelineStage.Won]: 'bg-green-100 text-green-800',
  [PipelineStage.Lost]: 'bg-red-100 text-red-800',
};

const StageBadge: React.FC<{ stage: PipelineStage }> = ({ stage }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGE_COLORS[stage]}`}>
      {stage}
    </span>
);

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const icons = {
        [ActivityType.Call]: <PhoneIcon className="w-4 h-4 text-blue-500" />,
        [ActivityType.Email]: <EmailIcon className="w-4 h-4 text-green-500" />,
        [ActivityType.Note]: <NoteIcon className="w-4 h-4 text-yellow-600" />,
        [ActivityType.StatusChange]: <StatusChangeIcon className="w-4 h-4 text-purple-500" />,
        [ActivityType.Appointment]: <CalendarIcon className="w-4 h-4 text-teal-500" />,
    };
    return <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">{icons[type]}</div>;
};

const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, opportunities, clientLeads, onClose }) => {
    const agentOpportunities = opportunities.filter(opp => opp.assignedToId === agent.id);
    const agentClientLeads = clientLeads.filter(lead => lead.assignedTo === agent.name);

    const openOpportunities = agentOpportunities.filter(opp => opp.stage !== PipelineStage.Won && opp.stage !== PipelineStage.Lost);
    const totalPipelineValue = openOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const avgDealSize = openOpportunities.length > 0 ? totalPipelineValue / openOpportunities.length : 0;
    
    const convertedLeads = agentClientLeads.filter(lead => lead.status === LeadStatus.Converted).length;
    const leadConversionRate = agentClientLeads.length > 0 ? Math.round((convertedLeads / agentClientLeads.length) * 100) : 0;
    
    // Simplified: get all activities from this agent's leads
    const recentActivities = agentClientLeads
        .flatMap(lead => lead.activities.filter(act => act.user === agent.name))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-surface flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <h2 className="text-lg font-bold text-textPrimary">{agent.name}</h2>
                            <p className="text-sm text-textSecondary">{agent.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard title="Assigned Leads" value={agent.assignedLeads.toString()} />
                        <KpiCard title="Close Rate" value={`${agent.closeRate}%`} />
                        <KpiCard title="Pipeline Value" value={`$${totalPipelineValue.toLocaleString()}`} />
                        <KpiCard title="Lead Conv. Rate" value={`${leadConversionRate}%`} />
                    </div>

                    {/* Opportunities */}
                    <div className="bg-surface p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-textPrimary mb-3">Live Opportunities ({openOpportunities.length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {openOpportunities.length > 0 ? openOpportunities.map(opp => (
                                <div key={opp.id} className="p-3 bg-background rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-sm text-textPrimary">{opp.contact.name}</p>
                                            <p className="text-xs text-textSecondary">{opp.product}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-dark">${opp.value.toLocaleString()}</p>
                                            <StageBadge stage={opp.stage} />
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-textSecondary text-center py-4">No open opportunities.</p>}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="font-semibold text-textPrimary mb-4">Recent Activity</h3>
                         <div className="flow-root">
                            {recentActivities.length > 0 ? (
                                <ul role="list" className="-mb-8">
                                    {recentActivities.map((activity, activityIdx) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                        {activityIdx !== recentActivities.length - 1 ? (
                                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex items-start space-x-3">
                                            <ActivityIcon type={activity.type} />
                                            <div className="min-w-0 flex-1">
                                            <div>
                                                <p className="text-sm text-textSecondary">
                                                {activity.content}
                                                </p>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-textSecondary text-center py-4">No recent activity found for this agent.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgentDetailView;
