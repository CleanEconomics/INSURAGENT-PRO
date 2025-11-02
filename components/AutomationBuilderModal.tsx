import React, { useState, useEffect } from 'react';
import { Automation, AutomationAction, ActionType, TriggerType } from '../types';
import { CloseIcon, ClockIcon, EmailIcon, PhoneIcon, TagIcon, UsersIcon } from './icons';

interface AutomationBuilderModalProps {
    automationToEdit: Automation | null;
    onSave: (automation: Automation) => void;
    onClose: () => void;
}

const emptyAutomation: Omit<Automation, 'id'> = {
    name: 'New Automation',
    trigger: TriggerType.NewLeadCreated,
    actions: [],
    isActive: true,
};

const availableActions = Object.values(ActionType);

const ActionIcon: React.FC<{ type: ActionType, className?: string }> = ({ type, className = "w-5 h-5" }) => {
    const icons = {
        [ActionType.Wait]: <ClockIcon className={className + " text-amber-600"} />,
        [ActionType.SendSMS]: <PhoneIcon className={className + " text-sky-600"} />,
        [ActionType.SendEmail]: <EmailIcon className={className + " text-green-600"} />,
        [ActionType.AddTag]: <TagIcon className={className + " text-purple-600"} />,
        [ActionType.AssignToAgent]: <UsersIcon className={className + " text-blue-600"} />,
    };
    return icons[type];
}

const AutomationBuilderModal: React.FC<AutomationBuilderModalProps> = ({ automationToEdit, onSave, onClose }) => {
    const [automation, setAutomation] = useState<Omit<Automation, 'id'> & { id?: string }>(
        automationToEdit || emptyAutomation
    );
    const [draggedActionIndex, setDraggedActionIndex] = useState<number | null>(null);

    useEffect(() => {
        setAutomation(automationToEdit || emptyAutomation);
    }, [automationToEdit]);

    const handleSave = () => {
        if (!automation.name) {
            alert('Please give your automation a name.');
            return;
        }
        onSave(automation as Automation);
    };

    const handleAddAction = (type: ActionType) => {
        const newAction: AutomationAction = {
            id: `action-${Date.now()}`,
            type,
            details: ''
        };
        setAutomation(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    };

    const handleUpdateAction = (actionId: string, details: string) => {
        setAutomation(prev => ({
            ...prev,
            actions: prev.actions.map(a => a.id === actionId ? { ...a, details } : a)
        }));
    };

    const handleDeleteAction = (actionId: string) => {
        setAutomation(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== actionId)
        }));
    };

    // Drag and Drop for Available Actions
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const actionType = e.dataTransfer.getData('actionType') as ActionType;
        if (actionType) {
            handleAddAction(actionType);
        }
    };
    
    // Drag and Drop for Reordering
    const handleActionDragStart = (index: number) => {
        setDraggedActionIndex(index);
    };

    const handleActionDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedActionIndex === null || draggedActionIndex === index) return;
        
        const draggedAction = automation.actions[draggedActionIndex];
        const newActions = [...automation.actions];
        newActions.splice(draggedActionIndex, 1);
        newActions.splice(index, 0, draggedAction);

        setAutomation(prev => ({...prev, actions: newActions}));
        setDraggedActionIndex(index);
    };

    const handleActionDragEnd = () => {
        setDraggedActionIndex(null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-textPrimary">{automationToEdit ? 'Edit Automation' : 'Create Automation'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>

                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel: Available Actions */}
                    <aside className="w-64 bg-background border-r border-gray-200 p-4 overflow-y-auto">
                        <h3 className="font-semibold text-textPrimary mb-4">Actions</h3>
                        <div className="space-y-2">
                            {availableActions.map(actionType => (
                                <div
                                    key={actionType}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('actionType', actionType)}
                                    className="flex items-center space-x-3 p-2 rounded-lg bg-surface border border-gray-200 cursor-grab hover:bg-gray-100"
                                >
                                    <ActionIcon type={actionType} />
                                    <span className="text-sm font-medium">{actionType}</span>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Right Panel: Builder */}
                    <main className="flex-grow p-6 overflow-y-auto space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-textPrimary">Automation Name</label>
                            <input type="text" id="name" value={automation.name} onChange={e => setAutomation(p => ({...p, name: e.target.value}))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                        </div>
                         <div>
                            <label htmlFor="trigger" className="block text-sm font-medium text-textPrimary">Trigger</label>
                            <p className="text-xs text-textSecondary">When this happens...</p>
                            <select id="trigger" value={automation.trigger} onChange={e => setAutomation(p => ({...p, trigger: e.target.value as TriggerType}))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
                                {Object.values(TriggerType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="bg-background border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] space-y-3"
                        >
                             <p className="text-center text-sm text-textSecondary">...do this. Drag actions here.</p>
                            {automation.actions.map((action, index) => (
                                <div 
                                    key={action.id}
                                    draggable
                                    onDragStart={() => handleActionDragStart(index)}
                                    onDragOver={(e) => handleActionDragOver(e, index)}
                                    onDragEnd={handleActionDragEnd}
                                    className={`bg-surface p-4 rounded-lg shadow-sm border flex items-start space-x-4 cursor-grab ${draggedActionIndex === index ? 'opacity-50' : ''}`}
                                >
                                    <ActionIcon type={action.type} className="w-6 h-6 mt-1" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{action.type}</p>
                                        <p className="text-xs text-textSecondary">
                                            {action.type === ActionType.Wait && 'Wait for a period of time.'}
                                            {action.type === ActionType.SendSMS && 'Send an SMS message.'}
                                            {action.type === ActionType.SendEmail && 'Send an email.'}
                                            {action.type === ActionType.AddTag && 'Add a tag to the contact.'}
                                            {action.type === ActionType.AssignToAgent && 'Assign the lead to an agent.'}
                                        </p>
                                        <div className="mt-2">
                                            {action.type === ActionType.Wait && <input type="text" value={action.details} onChange={e => handleUpdateAction(action.id, e.target.value)} placeholder="e.g., 5 minutes, 1 day" className="w-full text-sm p-2 border rounded-md" />}
                                            {action.type === ActionType.SendSMS && <textarea rows={3} value={action.details} onChange={e => handleUpdateAction(action.id, e.target.value)} placeholder="Enter SMS content..." className="w-full text-sm p-2 border rounded-md" />}
                                            {action.type === ActionType.SendEmail && <textarea rows={4} value={action.details} onChange={e => handleUpdateAction(action.id, e.target.value)} placeholder="Enter email content (use Subject: for subject line)..." className="w-full text-sm p-2 border rounded-md" />}
                                            {action.type === ActionType.AddTag && <input type="text" value={action.details} onChange={e => handleUpdateAction(action.id, e.target.value)} placeholder="e.g., Contacted, Hot Lead" className="w-full text-sm p-2 border rounded-md" />}
                                            {action.type === ActionType.AssignToAgent && <input type="text" value={action.details} onChange={e => handleUpdateAction(action.id, e.target.value)} placeholder="e.g., Jane Doe, John Smith" className="w-full text-sm p-2 border rounded-md" />}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAction(action.id)} className="p-1 rounded-full hover:bg-gray-200">
                                        <CloseIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
                
                <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end items-center space-x-3 flex-shrink-0">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg text-sm">Save Automation</button>
                </footer>
            </div>
        </div>
    );
};

export default AutomationBuilderModal;
