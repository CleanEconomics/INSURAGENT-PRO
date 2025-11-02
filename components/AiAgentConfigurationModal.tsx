import React, { useState, useEffect } from 'react';
import { AiAgent } from '../types';
import { CloseIcon } from './icons';

interface AiAgentConfigurationModalProps {
    agent: AiAgent;
    onSave: (updatedAgent: AiAgent) => void;
    onClose: () => void;
}

const AiAgentConfigurationModal: React.FC<AiAgentConfigurationModalProps> = ({ agent, onSave, onClose }) => {
    const [config, setConfig] = useState<AiAgent>(agent);

    useEffect(() => {
        setConfig(agent);
    }, [agent]);

    const handleSave = () => {
        onSave(config);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            taskThresholds: {
                ...prev.taskThresholds,
                [name]: parseInt(value, 10) || 0
            }
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Configure: {agent.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                    {/* General Settings */}
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-textPrimary">General Settings</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-textPrimary">Agent Name</label>
                            <input type="text" id="name" name="name" value={config.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-textPrimary">Description</label>
                            <textarea id="description" name="description" rows={2} value={config.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>

                    {/* Behavior & Personality */}
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-textPrimary">Behavior & Personality</h3>
                        <div>
                            <label htmlFor="systemPrompt" className="block text-sm font-medium text-textPrimary">System Prompt</label>
                            <p className="text-xs text-textSecondary mt-1">Define the agent's core instructions, personality, and objectives.</p>
                            <textarea id="systemPrompt" name="systemPrompt" rows={5} value={config.systemPrompt} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm font-mono text-sm" />
                        </div>
                        <div>
                            <label htmlFor="tone" className="block text-sm font-medium text-textPrimary">Communication Tone</label>
                            <select id="tone" name="tone" value={config.tone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm">
                                <option>Friendly</option>
                                <option>Formal</option>
                                <option>Persuasive</option>
                                <option>Concise</option>
                            </select>
                        </div>
                    </div>

                    {/* Task Thresholds */}
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-textPrimary">Task Thresholds</h3>
                        <div>
                            <label htmlFor="maxFollowUps" className="block text-sm font-medium text-textPrimary">Max Follow-ups</label>
                            <p className="text-xs text-textSecondary mt-1">Set a limit for automated follow-up messages before stopping.</p>
                            <input type="number" id="maxFollowUps" name="maxFollowUps" value={config.taskThresholds.maxFollowUps} onChange={handleThresholdChange} className="mt-1 block w-full max-w-xs px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </div>
                <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg text-sm">Save Configuration</button>
                </footer>
            </div>
        </div>
    );
};

export default AiAgentConfigurationModal;