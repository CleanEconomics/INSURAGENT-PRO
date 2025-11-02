import React, { useState } from 'react';
import { CloseIcon, LeadsIcon, PipelineIcon, CalendarIcon } from './icons';

interface QuickCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'Lead' | 'Opportunity' | 'Appointment'>('Lead');

    if (!isOpen) return null;

    const TabButton: React.FC<{ label: typeof activeTab; icon: React.ReactNode }> = ({ label, icon }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === label
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-textSecondary hover:border-slate-300 hover:text-textPrimary'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const LeadForm = () => (
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-textPrimary">Full Name</label>
                <input type="text" placeholder="John Doe" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-textPrimary">Email Address</label>
                <input type="email" placeholder="john.doe@example.com" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm" />
            </div>
             <div>
                <label className="block text-sm font-medium text-textPrimary">Phone Number</label>
                <input type="tel" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm" />
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Quick Create</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="border-b border-slate-200 px-4">
                    <nav className="flex items-center -mb-px">
                        <TabButton label="Lead" icon={<LeadsIcon className="w-5 h-5" />} />
                        <TabButton label="Opportunity" icon={<PipelineIcon className="w-5 h-5" />} />
                        <TabButton label="Appointment" icon={<CalendarIcon className="w-5 h-5" />} />
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'Lead' && <LeadForm />}
                    {activeTab === 'Opportunity' && <p>Opportunity form coming soon.</p>}
                    {activeTab === 'Appointment' && <p>Appointment form coming soon.</p>}
                </div>
                <footer className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end">
                    <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Create</button>
                </footer>
            </div>
        </div>
    );
};

export default QuickCreateModal;
