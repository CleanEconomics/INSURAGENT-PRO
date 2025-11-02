

import React, { useState } from 'react';
import { AiAgent, Automation, RescindedResponse, ActionType, DncEntry, AutomationAction } from '../types';
import { ClockIcon, EmailIcon, NoteIcon, PhoneIcon, TagIcon, UsersIcon, PlusIcon } from './icons';

interface AiAgentsProps {
    agents: AiAgent[];
    setAgents: React.Dispatch<React.SetStateAction<AiAgent[]>>;
    automations: Automation[];
    setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
    rescindedResponses: RescindedResponse[];
    dncList: DncEntry[];
    onConfigureAgent: (agent: AiAgent) => void;
    onEditAutomation: (automation: Automation | null) => void;
    onDeleteAutomation: (automationId: string) => void;
}

// Toggle Switch Component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    );
};

// Agents View
interface AgentsViewProps extends Pick<AiAgentsProps, 'agents' | 'setAgents'> {
    onConfigureAgent: (agent: AiAgent) => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({ agents, setAgents, onConfigureAgent }) => {

    const handleToggle = (agentId: string, isActive: boolean) => {
        setAgents(prev => prev.map(agent => agent.id === agentId ? { ...agent, isActive } : agent));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
                <div key={agent.id} className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-textPrimary text-lg mb-2">{agent.name}</h3>
                            <ToggleSwitch checked={agent.isActive} onChange={(checked) => handleToggle(agent.id, checked)} />
                        </div>
                        <p className="text-sm text-textSecondary mb-4 h-16">{agent.description}</p>
                    </div>
                    <div>
                        <div className="text-sm space-y-2">
                            {agent.metrics.map(metric => (
                                <div key={metric.name} className="flex justify-between items-center bg-background p-2 rounded-md">
                                    <span className="font-medium text-textSecondary">{metric.name}</span>
                                    <span className="font-bold text-primary-dark">{metric.value}</span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => onConfigureAgent(agent)}
                            className="w-full mt-4 text-sm font-semibold text-primary-dark bg-primary-light/20 hover:bg-primary-light/30 py-2 rounded-lg transition-colors">
                            Configure
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Automations View
const ActionIcon: React.FC<{type: ActionType}> = ({ type }) => {
    const icons = {
        [ActionType.Wait]: <ClockIcon className="text-amber-600" />,
        [ActionType.SendSMS]: <PhoneIcon className="text-sky-600 w-5 h-5" />,
        [ActionType.SendEmail]: <EmailIcon className="text-green-600 w-5 h-5" />,
        [ActionType.AddTag]: <TagIcon className="text-purple-600" />,
        [ActionType.AssignToAgent]: <UsersIcon className="text-blue-600 w-5 h-5" />,
    };
    const actionName = Object.keys(ActionType).find(key => ActionType[key as keyof typeof ActionType] === type);
    return <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" title={actionName}>{icons[type]}</div>;
}

const AutomationCard: React.FC<{
    automation: Automation;
    onToggle: (isActive: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ automation, onToggle, onEdit, onDelete }) => {
    return (
        <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-textPrimary text-lg mb-1">{automation.name}</h3>
                    <ToggleSwitch checked={automation.isActive} onChange={onToggle} />
                </div>
                <p className="text-sm text-textSecondary">
                    <strong>Trigger:</strong> {automation.trigger}
                </p>
            </div>
            <div className="my-4">
                <p className="text-xs font-semibold text-textSecondary uppercase mb-2">Action Sequence</p>
                <div className="flex items-center space-x-2 bg-background p-2 rounded-lg">
                    {automation.actions.map((action, index) => (
                        <React.Fragment key={action.id}>
                            <ActionIcon type={action.type} />
                             {index < automation.actions.length - 1 && <div className="w-4 h-px bg-gray-300"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 border-t border-gray-200 pt-4">
                <button onClick={onDelete} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors px-3 py-1">Delete</button>
                <button onClick={onEdit} className="text-sm font-semibold text-primary-dark bg-primary-light/20 hover:bg-primary-light/30 px-4 py-2 rounded-lg transition-colors">
                    Edit
                </button>
            </div>
        </div>
    );
};

const AutomationsView: React.FC<Pick<AiAgentsProps, 'automations' | 'setAutomations' | 'onEditAutomation' | 'onDeleteAutomation'>> = ({ automations, setAutomations, onEditAutomation, onDeleteAutomation }) => {
    
    const handleToggle = (autoId: string, isActive: boolean) => {
        setAutomations(prev => prev.map(auto => auto.id === autoId ? { ...auto, isActive } : auto));
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => onEditAutomation(null)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Automation</span>
                </button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automations.map(auto => (
                    <AutomationCard
                        key={auto.id}
                        automation={auto}
                        onToggle={(isActive) => handleToggle(auto.id, isActive)}
                        onEdit={() => onEditAutomation(auto)}
                        onDelete={() => onDeleteAutomation(auto.id)}
                    />
                ))}
            </div>
        </div>
    );
};

// Safety & Compliance View
const SafetyView: React.FC<Pick<AiAgentsProps, 'rescindedResponses' | 'dncList'>> = ({ rescindedResponses, dncList }) => {
    const [contentModeration, setContentModeration] = useState(true);
    const [humanInLoop, setHumanInLoop] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-textPrimary text-lg mb-2">Safety Guardrails</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="font-semibold text-textPrimary">Content Moderation</label>
                                <p className="text-xs text-textSecondary">Filter inappropriate language.</p>
                            </div>
                            <ToggleSwitch checked={contentModeration} onChange={setContentModeration} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                        <strong>Jailbreak Prevention</strong> is always active to protect against prompt injection and other security risks. This setting cannot be disabled.
                    </p>
                </div>
                 <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-textPrimary text-lg mb-2">Human-in-the-Loop</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="font-semibold text-textPrimary">Enable Approval Queues</label>
                                <p className="text-xs text-textSecondary">Manually approve sensitive AI actions.</p>
                            </div>
                            <ToggleSwitch checked={humanInLoop} onChange={setHumanInLoop} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-textPrimary text-lg mb-2">Do Not Contact (DNC) List</h3>
                    <p className="text-xs text-textSecondary mt-1 mb-4">Contacts are automatically added to this list when they reply with keywords like 'STOP' or 'Unsubscribe'. AI agents will not contact anyone on this list.</p>
                    <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-textSecondary uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Contact</th>
                                    <th className="px-4 py-2">Date Added</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dncList.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-textPrimary">{entry.contactName}</div>
                                            <div className="text-xs text-textSecondary">{entry.contactInfo}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{new Date(entry.dateAdded).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-textPrimary text-lg mb-4">Rescinded Responses Log</h3>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-textSecondary uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Timestamp</th>
                                    <th className="px-4 py-2">Lead</th>
                                    <th className="px-4 py-2">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rescindedResponses.map(resp => (
                                    <tr key={resp.id} className="hover:bg-gray-50" title={`Original Content: ${resp.originalContent}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">{new Date(resp.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3">{resp.leadName}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{resp.reason}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AiAgents: React.FC<AiAgentsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'Agents' | 'Automations' | 'Safety & Compliance'>('Agents');

    const TabButton: React.FC<{ label: typeof activeTab }> = ({ label }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === label
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary hover:border-gray-300 hover:text-textPrimary'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-textPrimary">AI Agents & Automations</h1>
                <p className="text-textSecondary mt-1">Deploy, manage, and monitor your AI workforce.</p>
            </div>
            
            <div className="flex items-center border-b border-gray-200">
                <TabButton label="Agents" />
                <TabButton label="Automations" />
                <TabButton label="Safety & Compliance" />
            </div>

            <div>
                {activeTab === 'Agents' && <AgentsView agents={props.agents} setAgents={props.setAgents} onConfigureAgent={props.onConfigureAgent} />}
                {activeTab === 'Automations' && <AutomationsView automations={props.automations} setAutomations={props.setAutomations} onEditAutomation={props.onEditAutomation} onDeleteAutomation={props.onDeleteAutomation} />}
                {activeTab === 'Safety & Compliance' && <SafetyView rescindedResponses={props.rescindedResponses} dncList={props.dncList} />}
            </div>
        </div>
    );
};

export default AiAgents;