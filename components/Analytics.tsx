
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Opportunity, ClientLead, AgentWithStats, Team, PipelineStage, LineOfBusiness } from '../types';

interface AnalyticsProps {
    opportunities: Opportunity[];
    clientLeads: ClientLead[];
    agentsWithStats: AgentWithStats[];
    teams: Team[];
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-surface p-6 rounded-xl shadow-sm">
        <p className="text-sm text-textSecondary font-medium">{title}</p>
        <p className="text-3xl font-bold text-textPrimary mt-2">{value}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold">{label}</p>
        <p className="text-primary-dark">{`Revenue: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const Analytics: React.FC<AnalyticsProps> = ({ opportunities, clientLeads, agentsWithStats, teams }) => {
    const [dateRange, setDateRange] = useState('all'); // In a real app, you'd use a date library for this
    const [selectedTeamId, setSelectedTeamId] = useState('all');
    const [selectedAgentId, setSelectedAgentId] = useState('all');

    const agentsInSelectedTeam = useMemo(() => {
        if (selectedTeamId === 'all') return agentsWithStats;
        const team = teams.find(t => t.id === selectedTeamId);
        if (!team) return [];
        return agentsWithStats.filter(a => team.memberIds.includes(a.id) || team.managerId === a.id);
    }, [selectedTeamId, agentsWithStats, teams]);

    const filteredData = useMemo(() => {
        let filteredOpps = opportunities;
        let filteredLeads = clientLeads;
        
        let agentIdsInScope = agentsWithStats.map(a => a.id);
        if (selectedTeamId !== 'all') {
            agentIdsInScope = agentsInSelectedTeam.map(a => a.id);
        }
        if (selectedAgentId !== 'all') {
            agentIdsInScope = [selectedAgentId];
        }

        filteredOpps = opportunities.filter(opp => agentIdsInScope.includes(opp.assignedToId));
        filteredLeads = clientLeads.filter(lead => {
            const agent = agentsWithStats.find(a => a.name === lead.assignedTo);
            return agent && agentIdsInScope.includes(agent.id);
        });

        return { opportunities: filteredOpps, leads: filteredLeads };
    }, [opportunities, clientLeads, selectedTeamId, selectedAgentId, agentsWithStats, agentsInSelectedTeam]);

    const kpis = useMemo(() => {
        const wonOpps = filteredData.opportunities.filter(o => o.stage === PipelineStage.Won);
        const lostOpps = filteredData.opportunities.filter(o => o.stage === PipelineStage.Lost);
        
        const totalRevenue = wonOpps.reduce((sum, opp) => sum + opp.value, 0);
        const newLeadsCount = filteredData.leads.length;
        const totalClosedOpps = wonOpps.length + lostOpps.length;
        const closeRate = totalClosedOpps > 0 ? (wonOpps.length / totalClosedOpps * 100) : 0;
        const avgDealSize = wonOpps.length > 0 ? totalRevenue / wonOpps.length : 0;

        return {
            totalRevenue: `$${totalRevenue.toLocaleString()}`,
            newLeadsCount: newLeadsCount.toLocaleString(),
            closeRate: `${closeRate.toFixed(1)}%`,
            avgDealSize: `$${Math.round(avgDealSize).toLocaleString()}`
        };
    }, [filteredData]);

    const salesByMonth = useMemo(() => {
        const monthData: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        filteredData.opportunities
            .filter(opp => opp.stage === PipelineStage.Won)
            .forEach(opp => {
                const monthIndex = new Date(opp.closeDate).getMonth();
                const year = new Date(opp.closeDate).getFullYear();
                const key = `${monthNames[monthIndex]} '${year.toString().slice(-2)}`;
                if (!monthData[key]) monthData[key] = 0;
                monthData[key] += opp.value;
            });

        return Object.entries(monthData).map(([name, Revenue]) => ({ name, Revenue }));
    }, [filteredData]);
    
    const salesFunnelData = useMemo(() => {
        const stageOrder = Object.values(PipelineStage);
        const stageCounts = filteredData.opportunities.reduce((acc, opp) => {
            acc[opp.stage] = (acc[opp.stage] || 0) + 1;
            return acc;
        }, {} as Record<PipelineStage, number>);
        
        return stageOrder.map(stage => ({
            name: stage,
            value: stageCounts[stage] || 0
        })).filter(item => item.value > 0);
    }, [filteredData]);

    const pieChartData = useMemo(() => {
        const wonOpps = filteredData.opportunities.filter(o => o.stage === PipelineStage.Won);
        
        const lobData = wonOpps.reduce((acc, opp) => {
            acc[opp.lineOfBusiness] = (acc[opp.lineOfBusiness] || 0) + opp.value;
            return acc;
        }, {} as Record<LineOfBusiness, number>);

        const leadSourceData = filteredData.leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            lob: Object.entries(lobData).map(([name, value]) => ({ name, value })),
            leadSource: Object.entries(leadSourceData).map(([name, value]) => ({ name, value })),
        };
    }, [filteredData]);

    const leaderboardData = useMemo(() => {
        const agentRevenue = filteredData.opportunities
            .filter(o => o.stage === PipelineStage.Won)
            .reduce((acc, opp) => {
                acc[opp.assignedToId] = (acc[opp.assignedToId] || 0) + opp.value;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(agentRevenue)
            .map(([agentId, revenue]) => {
                const agent = agentsWithStats.find(a => a.id === agentId);
                return { name: agent?.name || 'Unknown', revenue };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [filteredData, agentsWithStats]);

    const PIE_COLORS = ['#0D47A1', '#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB'];

    return (
        <div className="p-8 space-y-8">
            <div className="bg-surface p-4 rounded-xl shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-semibold text-textPrimary">Analytics Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm text-sm">
                        <option value="all">All Time</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <select value={selectedTeamId} onChange={e => {setSelectedTeamId(e.target.value); setSelectedAgentId('all')}} className="px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm text-sm">
                        <option value="all">All Teams</option>
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)} className="px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm text-sm">
                        <option value="all">All Agents</option>
                        {agentsInSelectedTeam.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Revenue" value={kpis.totalRevenue} />
                <KpiCard title="New Leads" value={kpis.newLeadsCount} />
                <KpiCard title="Close Rate" value={kpis.closeRate} />
                <KpiCard title="Average Deal Size" value={kpis.avgDealSize} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-surface p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-textPrimary mb-4">Sales Performance Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#757575', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#757575', fontSize: 12 }} tickFormatter={(value) => `$${(value/1000)}k`} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(13, 71, 161, 0.1)'}} />
                            <Bar dataKey="Revenue" fill="#1E88E5" barSize={30} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-textPrimary mb-4">Sales Funnel</h3>
                    <div className="space-y-2">
                        {salesFunnelData.map((item, index) => {
                             const maxVal = salesFunnelData[0]?.value || 1;
                             const percentage = (item.value / maxVal) * 100;
                             const conversionRate = index > 0 ? ((item.value / (salesFunnelData[index-1]?.value || 1)) * 100).toFixed(1) : 100;

                            return (
                                <div key={item.name} className="flex items-center">
                                    <div className="w-32 text-right text-xs font-medium text-textSecondary pr-2">{item.name}</div>
                                    <div className="flex-1 bg-gray-200 rounded-r-full">
                                        <div style={{ width: `${percentage}%` }} className="bg-primary h-6 rounded-r-full flex items-center justify-between px-2 text-white text-xs font-bold">
                                            <span>{item.value}</span>
                                        </div>
                                    </div>
                                    <div className="w-16 text-left text-xs font-semibold text-primary-dark pl-2">{index > 0 && `${conversionRate}%`}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-textPrimary mb-4">Team Leaderboard (by Revenue)</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaderboardData} layout="vertical" margin={{ left: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#757575', fontSize: 12 }} />
                            <Tooltip cursor={{fill: 'rgba(13, 71, 161, 0.1)'}} />
                            <Bar dataKey="revenue" fill="#4CAF50" barSize={20} radius={[0, 4, 4, 0]}>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm">
                     <h3 className="font-semibold text-textPrimary mb-4">Revenue by LOB</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieChartData.lob} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {pieChartData.lob.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
