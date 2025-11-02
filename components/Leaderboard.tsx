


import React, { useState } from 'react';
import { AgentWithStats } from '../types';
import { TrophyIcon } from './icons';

interface LeaderboardProps {
    agentsWithStats: AgentWithStats[];
    setSelectedAgent: (agent: AgentWithStats | null) => void;
}

const LeaderboardPage: React.FC<LeaderboardProps> = ({ agentsWithStats, setSelectedAgent }) => {
    const [metric, setMetric] = useState<'policiesSold' | 'revenue'>('policiesSold');

    const sortedData = [...agentsWithStats].sort((a, b) => {
        if (metric === 'policiesSold') {
            return b.policiesSold - a.policiesSold;
        }
        return b.revenue - a.revenue;
    });

    const trophyColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

    return (
        <div className="p-8">
            <div className="bg-surface p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary">Team Leaderboard</h2>
                        <p className="text-sm text-textSecondary mt-1">See who's leading the pack this quarter.</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setMetric('policiesSold')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metric === 'policiesSold' ? 'bg-white shadow text-primary-dark' : 'text-textSecondary hover:bg-gray-200'}`}>
                            Policies Sold
                        </button>
                        <button onClick={() => setMetric('revenue')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${metric === 'revenue' ? 'bg-white shadow text-primary-dark' : 'text-textSecondary hover:bg-gray-200'}`}>
                            Revenue
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    {sortedData.map((agent, index) => (
                        <div key={agent.id} onClick={() => setSelectedAgent(agent)} className="flex items-center space-x-4 p-3 hover:bg-gray-100/50 rounded-lg border-b border-gray-100 last:border-b-0 cursor-pointer">
                            <div className="w-8 text-center font-bold text-lg text-textSecondary">{index + 1}</div>
                            <div className="w-8 text-center">
                                {index < 3 ? <TrophyIcon color={trophyColors[index]} className="w-6 h-6" /> : <div className="w-6 h-6"></div>}
                            </div>
                            <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full" />
                            <p className="flex-grow font-semibold text-base text-textPrimary">{agent.name}</p>
                            <p className="font-bold text-lg text-primary-dark w-32 text-right">
                                {metric === 'policiesSold' ? agent.policiesSold : `$${agent.revenue.toLocaleString()}`}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const LeaderboardWidget: React.FC<LeaderboardProps> = ({ agentsWithStats, setSelectedAgent }) => {
    const [metric, setMetric] = useState<'policiesSold' | 'revenue'>('policiesSold');

    const sortedData = [...agentsWithStats].sort((a, b) => {
        if (metric === 'policiesSold') {
            return b.policiesSold - a.policiesSold;
        }
        return b.revenue - a.revenue;
    }).slice(0, 5); // Show top 5 for widget

    const trophyColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-textPrimary">Team Leaderboard</h2>
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
                    <button onClick={() => setMetric('policiesSold')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${metric === 'policiesSold' ? 'bg-white shadow-sm text-primary-dark' : 'text-textSecondary hover:bg-gray-200'}`}>
                        Policies
                    </button>
                    <button onClick={() => setMetric('revenue')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${metric === 'revenue' ? 'bg-white shadow-sm text-primary-dark' : 'text-textSecondary hover:bg-gray-200'}`}>
                        Revenue
                    </button>
                </div>
            </div>
            <div className="space-y-3">
                {sortedData.map((agent, index) => (
                    <div key={agent.id} onClick={() => setSelectedAgent(agent)} className="flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-lg cursor-pointer">
                        <div className="w-6 text-center font-bold text-sm text-textSecondary">{index + 1}</div>
                        <div className="w-6 text-center">
                            {index < 3 ? <TrophyIcon color={trophyColors[index]} className="w-5 h-5" /> : <div className="w-5 h-5"></div>}
                        </div>
                        <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full" />
                        <p className="flex-grow font-medium text-sm text-textPrimary">{agent.name}</p>
                        <p className="font-bold text-sm text-primary-dark">
                            {metric === 'policiesSold' ? agent.policiesSold : `$${agent.revenue.toLocaleString()}`}
                        </p>
                    </div>
                ))}
            </div>
        </>
    )
};


// The default export is the full page, but we also export the widget for the dashboard
export { LeaderboardWidget };
export default LeaderboardPage;
