

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ServiceTicket, ServiceTicketStatus, Agent, Contact, ServiceTicketCategory, ServiceTicketPriority, TicketMessage } from '../types';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, EqualsIcon, CloseIcon, SendIcon, UsersIcon } from './icons';

interface ServiceProps {
    tickets: ServiceTicket[];
    agents: Agent[];
    contacts: Contact[];
    onCreateTicket: (newTicketData: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'lastUpdatedAt' | 'messages'>) => void;
    onUpdateTicket: (updatedTicket: ServiceTicket) => void;
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-surface p-4 rounded-xl shadow-sm">
        <p className="text-sm text-textSecondary font-medium">{title}</p>
        <p className="text-2xl font-bold text-textPrimary mt-1">{value}</p>
    </div>
);

const StatusBadge: React.FC<{ status: ServiceTicketStatus }> = ({ status }) => {
    const colorClasses = {
        [ServiceTicketStatus.Open]: 'bg-red-100 text-red-800',
        [ServiceTicketStatus.InProgress]: 'bg-blue-100 text-blue-800',
        [ServiceTicketStatus.PendingClient]: 'bg-amber-100 text-amber-800',
        [ServiceTicketStatus.Closed]: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

const PriorityIcon: React.FC<{ priority: ServiceTicketPriority }> = ({ priority }) => {
    const icons = {
        [ServiceTicketPriority.Low]: <ArrowDownIcon className="text-green-500" />,
        [ServiceTicketPriority.Medium]: <EqualsIcon className="text-amber-500" />,
        [ServiceTicketPriority.High]: <ArrowUpIcon className="text-red-500" />,
        [ServiceTicketPriority.Urgent]: <ArrowUpIcon className="text-red-700 animate-pulse" />,
    };
    return <div title={priority}>{icons[priority]}</div>
};

const CreateTicketModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'lastUpdatedAt' | 'messages'>) => void;
    contacts: Contact[];
    agents: Agent[];
}> = ({ isOpen, onClose, onCreate, contacts, agents }) => {
    const [contactId, setContactId] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState<ServiceTicketCategory>(ServiceTicketCategory.General);
    const [priority, setPriority] = useState<ServiceTicketPriority>(ServiceTicketPriority.Medium);
    const [assignedToId, setAssignedToId] = useState('');

    const handleSubmit = () => {
        if (!contactId || !subject || !assignedToId) {
            alert('Please fill out all required fields.');
            return;
        }
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        onCreate({
            contact,
            subject,
            category,
            status: ServiceTicketStatus.Open,
            priority,
            assignedToId
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Create New Service Ticket</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon/></button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-textPrimary">Client/Contact</label>
                        <select id="contact" value={contactId} onChange={e => setContactId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                            <option value="">Select a contact</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-textPrimary">Subject</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-textPrimary">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as ServiceTicketCategory)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                                {Object.values(ServiceTicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-textPrimary">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as ServiceTicketPriority)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                                {Object.values(ServiceTicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="assignedToId" className="block text-sm font-medium text-textPrimary">Assign To</label>
                        <select id="assignedToId" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                             <option value="">Select an agent</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
                <footer className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end">
                    <button onClick={handleSubmit} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">Create Ticket</button>
                </footer>
            </div>
        </div>
    )
};


const Service: React.FC<ServiceProps> = ({ tickets, agents, contacts, onCreateTicket, onUpdateTicket }) => {
    const [activeStatusFilter, setActiveStatusFilter] = useState<ServiceTicketStatus | 'All'>('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(tickets.find(t => t.status === ServiceTicketStatus.Open) || tickets[0] || null);

    const kpiValues = useMemo(() => {
        const openTickets = tickets.filter(t => t.status !== ServiceTicketStatus.Closed).length;
        // Mock data for other KPIs
        return {
            openTickets: openTickets.toString(),
            avgResponseTime: "3.2h",
            resolutionRate: "92.5%",
            csat: "96%"
        }
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        if (activeStatusFilter === 'All') return tickets;
        return tickets.filter(t => t.status === activeStatusFilter);
    }, [tickets, activeStatusFilter]);

    const FilterButton: React.FC<{ label: ServiceTicketStatus | 'All' }> = ({ label }) => {
        const count = label === 'All' ? tickets.length : tickets.filter(t => t.status === label).length;
        return (
            <button
                onClick={() => setActiveStatusFilter(label)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center space-x-2 transition-colors ${
                    activeStatusFilter === label
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-textSecondary hover:bg-slate-100'
                }`}
            >
                <span>{label}</span>
                <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">{count}</span>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-textPrimary">Service Desk</h1>
                        <p className="text-textSecondary mt-1">Manage client inquiries, claims, and service requests.</p>
                    </div>
                     <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm">
                        <PlusIcon className="w-4 h-4" />
                        <span>Create Ticket</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Open Tickets" value={kpiValues.openTickets} />
                    <KpiCard title="Avg. Response Time" value={kpiValues.avgResponseTime} />
                    <KpiCard title="Resolution Rate" value={kpiValues.resolutionRate} />
                    <KpiCard title="CSAT" value={kpiValues.csat} />
                </div>
            </div>
            
            <div className="flex-grow flex overflow-hidden">
                {/* Left Column: Ticket List */}
                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200 flex-shrink-0">
                         <div className="flex items-center space-x-2">
                            <FilterButton label="All" />
                            <FilterButton label={ServiceTicketStatus.Open} />
                            <FilterButton label={ServiceTicketStatus.InProgress} />
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredTickets.map(ticket => (
                            <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b border-slate-100 cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-sm text-textPrimary pr-2">{ticket.subject}</p>
                                    <PriorityIcon priority={ticket.priority} />
                                </div>
                                <p className="text-xs text-primary-700 font-semibold mt-1">{ticket.ticketNumber}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center space-x-2">
                                        <img src={ticket.contact.avatarUrl} alt={ticket.contact.name} className="w-6 h-6 rounded-full" />
                                        <span className="text-xs font-medium text-textSecondary">{ticket.contact.name}</span>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detail View */}
                <div className="w-2/3 flex flex-col bg-white">
                    {selectedTicket ? (
                        <TicketDetailPanel key={selectedTicket.id} ticket={selectedTicket} agents={agents} onUpdateTicket={onUpdateTicket} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-textSecondary">
                            <p>Select a ticket to view its details.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={onCreateTicket} contacts={contacts} agents={agents} />
        </div>
    );
};

const TicketDetailPanel: React.FC<{ticket: ServiceTicket, agents: Agent[], onUpdateTicket: (ticket: ServiceTicket) => void}> = ({ ticket, agents, onUpdateTicket }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentTicket, setCurrentTicket] = useState(ticket);

    useEffect(() => {
        setCurrentTicket(ticket);
    }, [ticket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentTicket.messages]);
    
    const handleUpdate = (field: keyof ServiceTicket, value: any) => {
        const updatedTicket = { ...currentTicket, [field]: value };
        setCurrentTicket(updatedTicket);
        onUpdateTicket(updatedTicket);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        const agent = agents.find(a => a.name === "Jane Doe");
        const message: TicketMessage = {
            id: `msg-${Date.now()}`, sender: 'Agent',
            agentName: agent?.name, agentAvatarUrl: agent?.avatarUrl,
            content: newMessage, timestamp: new Date().toISOString(), isInternalNote,
        };
        const updatedTicket = { ...currentTicket, messages: [...currentTicket.messages, message] };
        handleUpdate('messages', updatedTicket.messages);
        setNewMessage(''); setIsInternalNote(false);
    };

    return (
         <>
            <header className="p-4 border-b border-slate-200 flex-shrink-0">
                <p className="text-sm text-primary-600 font-semibold">{currentTicket.ticketNumber}</p>
                <h2 className="text-lg font-bold text-textPrimary">{currentTicket.subject}</h2>
            </header>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-textSecondary">Status</label>
                        <select value={currentTicket.status} onChange={e => handleUpdate('status', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-md text-sm bg-white">
                            {Object.values(ServiceTicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-textSecondary">Priority</label>
                         <select value={currentTicket.priority} onChange={e => handleUpdate('priority', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-md text-sm bg-white">
                            {Object.values(ServiceTicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-textSecondary">Assigned To</label>
                        <select value={currentTicket.assignedToId} onChange={e => handleUpdate('assignedToId', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-md text-sm bg-white">
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    {currentTicket.messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'Agent' ? 'justify-end' : ''}`}>
                            {msg.sender === 'Client' && <img src={currentTicket.contact.avatarUrl} alt="contact" className="w-8 h-8 rounded-full" />}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.sender === 'Agent' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-100 border border-slate-200 text-textPrimary rounded-bl-none')}`}>
                                {msg.isInternalNote && <p className="text-xs font-bold mb-1 flex items-center gap-1"><UsersIcon className="w-4 h-4" /> Internal Note</p>}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={`text-xs mt-1 text-right ${msg.sender === 'Agent' && !msg.isInternalNote ? 'text-white/70' : 'text-slate-500'}`}>
                                    {msg.sender === 'Agent' ? msg.agentName : currentTicket.contact.name} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>
                            {msg.sender === 'Agent' && <img src={msg.agentAvatarUrl} alt="agent" className="w-8 h-8 rounded-full" />}
                        </div>
                    ))}
                     <div ref={messagesEndRef} />
                </div>
            </div>
             <footer className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="relative">
                    <textarea
                        rows={3} value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isInternalNote ? "Add an internal note..." : "Type your reply..."}
                        className={`w-full pr-12 py-2 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none ${isInternalNote ? 'bg-amber-50' : 'bg-white'}`}
                    />
                    <button onClick={handleSendMessage} className="absolute right-2 top-2 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-400 transition-colors">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <input type="checkbox" id="internalNote" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="h-4 w-4 text-amber-500 border-slate-300 rounded focus:ring-amber-400" />
                        <label htmlFor="internalNote" className="ml-2 text-sm font-medium text-textPrimary">Internal Note</label>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Service;