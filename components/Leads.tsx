

import React, { useState } from 'react';
import { ClientLead, RecruitLead, LeadStatus, Activity, ActivityType, AiLeadMappingResponse } from '../types';
import { getAiLeadMapping } from '../services/geminiService';
import LeadDetailView from './LeadDetailView';
import { UploadIcon, CloseIcon } from './icons';

const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const colorClasses = {
    [LeadStatus.New]: 'bg-blue-100 text-blue-800',
    [LeadStatus.Contacted]: 'bg-sky-100 text-sky-800',
    [LeadStatus.Working]: 'bg-indigo-100 text-indigo-800',
    [LeadStatus.Unqualified]: 'bg-red-100 text-red-800',
    [LeadStatus.Converted]: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: 'Low' | 'Medium' | 'High' }> = ({ priority }) => {
  const colorClasses = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-amber-100 text-amber-800',
    High: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[priority]}`}>
      {priority}
    </span>
  );
};

interface LeadsProps {
  clientLeads: ClientLead[];
  recruitLeads: RecruitLead[];
  onUpdateLead: (lead: ClientLead | RecruitLead) => void;
  onConvertClientLead: (lead: ClientLead, details: { value: number; product: string; }) => void;
  onConvertRecruitLead: (lead: RecruitLead) => void;
  onAddBulkLeads: (newLeads: { clients: ClientLead[], recruits: RecruitLead[] }) => void;
  onSendMessage: (lead: ClientLead | RecruitLead, type: 'SMS' | 'Email', content: string, subject?: string) => void;
  setToast: (toast: { message: string } | null) => void;
}

// Mock CSV data to simulate file uploads
const MOCK_CLIENT_CSV = `Full Name,Email Address,Contact Number,Source of Lead,Assigned Agent
John Doe,john.d@example.com,555-1111,Referral,Jane Doe
Jane Smith,jane.s@example.com,555-2222,Web Form,John Smith`;

const MOCK_RECRUIT_CSV = `Candidate,Email,Phone,Source,Position
Peter Jones,peter.j@example.com,555-3333,LinkedIn,P&C Producer
Mary Johnson,mary.j@example.com,555-4444,Indeed,Life & Health Agent`;


const Leads: React.FC<LeadsProps> = ({ clientLeads, recruitLeads, onUpdateLead, onConvertClientLead, onConvertRecruitLead, onAddBulkLeads, onSendMessage, setToast }) => {
    const [activeTab, setActiveTab] = useState<'Client Leads' | 'Recruit Leads'>('Client Leads');
    const [clientStatusFilter, setClientStatusFilter] = useState<LeadStatus | 'All'>('All');
    const [recruitStatusFilter, setRecruitStatusFilter] = useState<LeadStatus | 'All'>('All');
    const [selectedLead, setSelectedLead] = useState<ClientLead | RecruitLead | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const TabButton: React.FC<{ label: 'Client Leads' | 'Recruit Leads' }> = ({ label }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === label
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary hover:border-gray-300 hover:text-textPrimary'
            }`}
        >
            {label} ({label === 'Client Leads' ? clientLeads.filter(l => l.status !== LeadStatus.Converted).length : recruitLeads.filter(l => l.status !== LeadStatus.Converted).length})
        </button>
    );

    const FilterButton: React.FC<{ 
        label: LeadStatus | 'All'; 
        isActive: boolean;
        onClick: () => void;
    }> = ({ label, isActive, onClick }) => (
      <button 
        onClick={onClick}
        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${isActive ? 'bg-primary-light/20 text-primary-dark' : 'bg-gray-100 text-textSecondary hover:bg-gray-200'}`}
      >
          {label}
      </button>
    );

    const filteredClientLeads = clientLeads.filter(lead => 
        (clientStatusFilter === 'All' ? lead.status !== LeadStatus.Converted : lead.status === clientStatusFilter)
    );

    const filteredRecruitLeads = recruitLeads.filter(lead =>
        (recruitStatusFilter === 'All' ? lead.status !== LeadStatus.Converted : lead.status === recruitStatusFilter)
    );

    const handleSelectLead = (lead: ClientLead | RecruitLead) => {
        if (lead.status !== LeadStatus.Converted) {
            setSelectedLead(lead);
        }
    };

    const UploadModal = () => {
        const [uploadStep, setUploadStep] = useState<'idle' | 'mapping' | 'importing' | 'error'>('idle');
        const [fileName, setFileName] = useState('');
        const [progress, setProgress] = useState({ current: 0, total: 0 });
        const [errorMessage, setErrorMessage] = useState('');

        const parseCSV = (csvText: string) => {
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index].trim();
                    return obj;
                }, {} as { [key: string]: string });
            });
            return { headers, rows };
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                setFileName(e.target.files[0].name);
            }
        };

        const handleStartImport = async () => {
            // This is a simulation. In a real app, you'd read the file content.
            // We'll randomly pick between a client or recruit CSV mock.
            const isClientMock = Math.random() > 0.5;
            const mockData = isClientMock ? MOCK_CLIENT_CSV : MOCK_RECRUIT_CSV;

            try {
                const { headers, rows } = parseCSV(mockData);
                setProgress({ current: 0, total: rows.length });
                setUploadStep('mapping');

                const { leadType, mapping } = await getAiLeadMapping(headers);

                setUploadStep('importing');

                const newLeads: { clients: ClientLead[], recruits: RecruitLead[] } = { clients: [], recruits: [] };
                
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing delay
                    
                    // FIX: Add avatarUrl to satisfy the Lead types. Use the lead's name to seed a placeholder image.
                    const leadName = row[mapping.name || ''] || `Lead ${Date.now() + i}`;
                    const baseLead = {
                        id: `bulk-${Date.now()}-${i}`,
                        name: leadName,
                        avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(leadName)}/40/40`,
                        email: row[mapping.email || ''] || 'N/A',
                        phone: row[mapping.phone || ''] || 'N/A',
                        source: row[mapping.source || ''] || 'Bulk Import',
                        status: (row[mapping.status || ''] as LeadStatus) || LeadStatus.New,
                        createdAt: new Date().toISOString(),
                        activities: [{ id: 'act1', type: ActivityType.StatusChange, content: 'Lead created via bulk import.', user: 'System', timestamp: new Date().toISOString() }],
                        score: 30,
                        priority: 'Low' as 'Low',
                    };

                    if (leadType === 'client') {
                        newLeads.clients.push({
                            ...baseLead,
                            assignedTo: row[mapping.assignedTo || ''] || 'Unassigned',
                        });
                    } else {
                        newLeads.recruits.push({
                            ...baseLead,
                            roleInterest: row[mapping.roleInterest || ''] || 'N/A',
                        });
                    }
                    setProgress(p => ({ ...p, current: i + 1 }));
                }

                onAddBulkLeads(newLeads);
                setIsUploadModalOpen(false);
                const totalAdded = newLeads.clients.length + newLeads.recruits.length;
                setToast({ message: `✅ Upload complete! ${totalAdded} new ${leadType} leads added.` });

            } catch (error) {
                console.error(error);
                setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
                setUploadStep('error');
            }
        };

        const renderContent = () => {
            switch (uploadStep) {
                case 'idle':
                    return (
                        <>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-dark hover:text-primary-light focus-within:outline-none">
                                            <span>{fileName ? 'Change file' : 'Upload a file'}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{fileName || 'CSV, XLSX up to 10MB'}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-primary-light/10 rounded-lg text-sm text-primary-dark">
                                Our AI will automatically map your columns for Name, Email, Phone, Source, and Role Interest (for recruits). Please ensure your file has headers.
                            </div>
                        </>
                    );
                case 'mapping':
                case 'importing':
                    const statusText = uploadStep === 'mapping' ? 'Mapping columns with AI...' : `Importing leads... (${progress.current}/${progress.total})`;
                    const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
                    return (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 font-semibold text-textPrimary">{statusText}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                case 'error':
                    return (
                        <div className="text-center py-8">
                             <p className="mt-4 font-semibold text-red-600">Import Failed</p>
                             <p className="text-sm text-textSecondary mt-2">{errorMessage}</p>
                        </div>
                    );
            }
        };

        return (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsUploadModalOpen(false)}>
                <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-textPrimary">Bulk Import Leads</h2>
                        <button onClick={() => setIsUploadModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200/50">
                            <CloseIcon className="w-6 h-6 text-textSecondary" />
                        </button>
                    </header>
                    <div className="p-6">{renderContent()}</div>
                    <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end">
                        {uploadStep === 'idle' && (
                            <button onClick={handleStartImport} disabled={!fileName} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-primary/50">Start Import</button>
                        )}
                        {uploadStep === 'error' && (
                            <button onClick={() => setUploadStep('idle')} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Try Again</button>
                        )}
                    </footer>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 relative">
            <div className="bg-surface p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center border-b border-gray-200">
                        <TabButton label="Client Leads" />
                        <TabButton label="Recruit Leads" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsUploadModalOpen(true)} className="bg-primary-light/20 hover:bg-primary-light/30 text-primary-dark font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm">
                            <UploadIcon className="w-4 h-4" />
                            <span>Bulk Upload</span>
                        </button>
                        <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                            Add Lead
                        </button>
                    </div>
                </div>

                {activeTab === 'Client Leads' && (
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <FilterButton label="All" isActive={clientStatusFilter === 'All'} onClick={() => setClientStatusFilter('All')} />
                            {Object.values(LeadStatus).filter(s => s !== LeadStatus.Converted).map(status => (
                                <FilterButton key={status} label={status} isActive={clientStatusFilter === status} onClick={() => setClientStatusFilter(status)} />
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                 <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Score</th>
                                        <th scope="col" className="px-6 py-3">Priority</th>
                                        <th scope="col" className="px-6 py-3">Source</th>
                                        <th scope="col" className="px-6 py-3">Assigned To</th>
                                        <th scope="col" className="px-6 py-3">Date Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClientLeads.map(lead => (
                                        <tr key={lead.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                                <img className="w-10 h-10 rounded-full" src={lead.avatarUrl} alt={`${lead.name} avatar`} />
                                                <div className="pl-3">
                                                    <div className="text-base font-semibold">{lead.name}</div>
                                                    <div className="font-normal text-gray-500">{lead.email}</div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                                            <td className="px-6 py-4 font-semibold text-textPrimary">{lead.score}</td>
                                            <td className="px-6 py-4"><PriorityBadge priority={lead.priority} /></td>
                                            <td className="px-6 py-4">{lead.source}</td>
                                            <td className="px-6 py-4">{lead.assignedTo}</td>
                                            <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Recruit Leads' && (
                     <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <FilterButton label="All" isActive={recruitStatusFilter === 'All'} onClick={() => setRecruitStatusFilter('All')} />
                            {Object.values(LeadStatus).filter(s => s !== LeadStatus.Converted).map(status => (
                                <FilterButton key={status} label={status} isActive={recruitStatusFilter === status} onClick={() => setRecruitStatusFilter(status)} />
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                 <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Score</th>
                                        <th scope="col" className="px-6 py-3">Priority</th>
                                        <th scope="col" className="px-6 py-3">Source</th>
                                        <th scope="col" className="px-6 py-3">Role Interest</th>
                                        <th scope="col" className="px-6 py-3">Date Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecruitLeads.map(lead => (
                                        <tr key={lead.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                                <img className="w-10 h-10 rounded-full" src={lead.avatarUrl} alt={`${lead.name} avatar`} />
                                                <div className="pl-3">
                                                    <div className="text-base font-semibold">{lead.name}</div>
                                                    <div className="font-normal text-gray-500">{lead.email}</div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                                            <td className="px-6 py-4 font-semibold text-textPrimary">{lead.score}</td>
                                            <td className="px-6 py-4"><PriorityBadge priority={lead.priority} /></td>
                                            <td className="px-6 py-4">{lead.source}</td>
                                            <td className="px-6 py-4">{lead.roleInterest}</td>
                                            <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {selectedLead && (
                <LeadDetailView 
                    key={selectedLead.id} // Add key to force re-mount on lead change
                    lead={selectedLead} 
                    onClose={() => setSelectedLead(null)}
                    onUpdateLead={onUpdateLead}
                    onConvertClientLead={onConvertClientLead}
                    onConvertRecruitLead={onConvertRecruitLead}
                    onSendMessage={(type, content, subject) => onSendMessage(selectedLead, type, content, subject)}
                />
            )}
            {isUploadModalOpen && <UploadModal />}
        </div>
    );
};

export default Leads;