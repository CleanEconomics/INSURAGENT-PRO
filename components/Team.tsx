


import React, { useState, useMemo } from 'react';
import { Team as TeamType, Agent, ClientLead, Opportunity, AgentCandidate, PipelineStage, LeadStatus, AgentWithStats } from '../types';
import { CloseIcon, UsersIcon } from './icons';
import AgentDetailView from './AgentDetailView';


interface TeamProps {
    teams: TeamType[];
    setTeams: React.Dispatch<React.SetStateAction<TeamType[]>>;
    agentsWithStats: AgentWithStats[];
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    setSelectedAgent: (agent: AgentWithStats | null) => void;
}

const Team: React.FC<TeamProps> = ({ teams, setTeams, agentsWithStats, setAgents, setSelectedAgent }) => {
    const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(teams[0] || null);
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    
    const unassignedAgents = agentsWithStats.filter(agent => !agent.teamId);

    const CreateTeamModal: React.FC = () => {
        const [teamName, setTeamName] = useState('');
        const [managerId, setManagerId] = useState('');

        const handleCreate = () => {
            if (!teamName || !managerId) return;
            const newTeam: TeamType = {
                id: `team${teams.length + 1}`,
                name: teamName,
                managerId: managerId,
                memberIds: [],
            };
            setTeams(prev => [...prev, newTeam]);
            setAgents(prev => prev.map(agent => agent.id === managerId ? {...agent, teamId: newTeam.id} : agent));
            setIsCreateTeamModalOpen(false);
        };
        
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-medium text-textPrimary">Team Name</label>
                            <input type="text" id="teamName" value={teamName} onChange={e => setTeamName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"/>
                        </div>
                        <div>
                            <label htmlFor="manager" className="block text-sm font-medium text-textPrimary">Select Manager</label>
                            <select id="manager" value={managerId} onChange={e => setManagerId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                                <option value="" disabled>Choose a manager</option>
                                {unassignedAgents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsCreateTeamModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark">Create Team</button>
                    </div>
                </div>
            </div>
        );
    };

     const AddMemberModal: React.FC = () => {
        const [memberId, setMemberId] = useState('');

        const handleAdd = () => {
            if (!memberId || !selectedTeam) return;
            setTeams(prev => prev.map(team => 
                team.id === selectedTeam.id ? {...team, memberIds: [...team.memberIds, memberId]} : team
            ));
            setAgents(prev => prev.map(agent => 
                agent.id === memberId ? {...agent, teamId: selectedTeam.id} : agent
            ));
            setIsAddMemberModalOpen(false);
        };
        
        return (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Add Member to {selectedTeam?.name}</h3>
                    <select value={memberId} onChange={e => setMemberId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                        <option value="" disabled>Select an agent</option>
                        {unassignedAgents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                    </select>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark">Add Member</button>
                    </div>
                </div>
            </div>
        );
    };

    const TeamCard: React.FC<{ team: TeamType }> = ({ team }) => {
        const manager = agentsWithStats.find(a => a.id === team.managerId);
        const members = agentsWithStats.filter(a => team.memberIds.includes(a.id));
        return (
            <div 
                onClick={() => setSelectedTeam(team)}
                className={`p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-300 ${selectedTeam?.id === team.id ? 'bg-primary-light/10 border-2 border-primary-light' : 'bg-surface hover:shadow-md border-2 border-transparent'}`}
            >
                <h3 className="font-bold text-textPrimary text-lg">{team.name}</h3>
                <p className="text-sm text-textSecondary mt-1">Managed by: <span className="font-semibold">{manager?.name}</span></p>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2">
                        {[manager, ...members].slice(0, 4).map(m => m && <img key={m.id} src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white"/>)}
                    </div>
                    <span className="text-sm font-semibold text-primary-dark">{team.memberIds.length + 1} Members</span>
                </div>
            </div>
        );
    };

    const MemberTable: React.FC<{ team: TeamType }> = ({ team }) => {
        const manager = agentsWithStats.find(a => a.id === team.managerId);
        const members = agentsWithStats.filter(a => team.memberIds.includes(a.id));
        const allMembers = manager ? [manager, ...members] : members;

        return (
            <div className="bg-surface p-6 rounded-xl shadow-sm mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-textPrimary">{team.name} - Performance Overview</h2>
                    <button onClick={() => setIsAddMemberModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Add Member</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Member</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Assigned Leads</th>
                                <th scope="col" className="px-6 py-3">Close Rate</th>
                                <th scope="col" className="px-6 py-3">Recruits Onboarded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMembers.map(agent => (
                                <tr key={agent.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAgent(agent)}>
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                        <img className="w-10 h-10 rounded-full" src={agent.avatarUrl} alt={agent.name} />
                                        <div className="pl-3">
                                            <div className="text-base font-semibold">{agent.name}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{agent.id === team.managerId ? 'Sales Manager' : agent.role}</td>
                                    <td className="px-6 py-4 font-semibold">{agent.assignedLeads}</td>
                                    <td className="px-6 py-4 font-semibold">{agent.closeRate}%</td>
                                    <td className="px-6 py-4 font-semibold">{agent.recruitsOnboarded}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Team Portal</h1>
                    <p className="text-textSecondary mt-1">Manage your teams and track their performance.</p>
                </div>
                <button onClick={() => setIsCreateTeamModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                    <UsersIcon className="w-5 h-5"/>
                    <span>Create Team</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => <TeamCard key={team.id} team={team} />)}
            </div>
            
            {selectedTeam && <MemberTable team={selectedTeam} />}

            {isCreateTeamModalOpen && <CreateTeamModal />}
            {isAddMemberModalOpen && <AddMemberModal />}
        </div>
    );
};

export default Team;
