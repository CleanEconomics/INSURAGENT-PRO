

import React, { useState, useRef, useEffect } from 'react';
import { EmailCampaign, Message, ClientLead, RecruitLead } from '../types';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloseIcon, AiSparkleIcon, SendIcon, PlusIcon } from './icons';
import { getAiCopilotResponse } from '../services/geminiService';

const mockCampaigns: EmailCampaign[] = [
  { 
    id: 'camp1', name: 'New Lead Welcome Series', subject: 'Welcome to Our Agency!', status: 'Active', sent: 1250, openRate: 45.2, clickRate: 12.1, bounceRate: 1.2, unsubscribeRate: 0.5, conversions: 25, lastModified: '2024-07-26',
    report: {
      performanceOverTime: [ { hour: '1h', opens: 150, clicks: 30 }, { hour: '3h', opens: 280, clicks: 55 }, { hour: '6h', opens: 450, clicks: 110 }, { hour: '12h', opens: 510, clicks: 135 }, { hour: '24h', opens: 565, clicks: 151 } ],
      clientBreakdown: { desktop: 35, mobile: 65 },
      linkPerformance: [ { url: 'our-website.com', clicks: 80 }, { url: 'schedule-call.com', clicks: 65 }, { url: 'learn-more.com', clicks: 6 } ],
      clickMap: [ { x: 50, y: 72, clicks: 80 }, { x: 50, y: 85, clicks: 65 } ]
    }
  },
  { id: 'camp2', name: 'Q4 Term Life Promotion', subject: 'Secure Your Family\'s Future', status: 'Draft', sent: 0, openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0, conversions: 0, lastModified: '2024-07-28' },
  { 
    id: 'camp3', name: 'Annual Policy Review Reminder', subject: 'It\'s Time for Your Annual Review', status: 'Active', sent: 850, openRate: 62.8, clickRate: 25.4, bounceRate: 0.8, unsubscribeRate: 0.2, conversions: 152, lastModified: '2024-07-20',
    report: {
      performanceOverTime: [ { hour: '1h', opens: 300, clicks: 100 }, { hour: '3h', opens: 410, clicks: 160 }, { hour: '6h', opens: 480, clicks: 195 }, { hour: '12h', opens: 515, clicks: 210 }, { hour: '24h', opens: 534, clicks: 216 } ],
      clientBreakdown: { desktop: 55, mobile: 45 },
      linkPerformance: [ { url: 'review-portal.com', clicks: 216 } ],
      clickMap: [ { x: 50, y: 80, clicks: 216 } ]
    }
  },
// FIX: Added missing `unsubscribeRate` property to conform to the EmailCampaign type.
    { id: 'camp6', name: 'P&C Renewal Reminders', subject: 'Your Policy is Expiring Soon!', status: 'Scheduled', sent: 0, openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0, conversions: 0, lastModified: '2024-07-29', scheduledAt: '2024-08-15T10:00:00' },
  { id: 'camp4', name: 'Client Birthday Greeting', subject: 'Happy Birthday From Us!', status: 'Active', sent: 5200, openRate: 75.1, clickRate: 30.5, bounceRate: 0.1, unsubscribeRate: 0, conversions: 0, lastModified: '2024-01-01' },
  { 
    id: 'camp5', name: 'Q3 Newsletter', subject: 'Your Mid-Year Insurance Update', status: 'Completed', sent: 4800, openRate: 35.6, clickRate: 8.2, bounceRate: 2.1, unsubscribeRate: 1.1, conversions: 5, lastModified: '2024-06-15',
    report: {
      performanceOverTime: [ { hour: '1h', opens: 800, clicks: 150 }, { hour: '3h', opens: 1200, clicks: 250 }, { hour: '6h', opens: 1500, clicks: 350 }, { hour: '12h', opens: 1650, clicks: 380 }, { hour: '24h', opens: 1708, clicks: 393 } ],
      clientBreakdown: { desktop: 40, mobile: 60 },
      linkPerformance: [ { url: 'blog/article-1', clicks: 250 }, { url: 'blog/article-2', clicks: 143 } ],
      clickMap: [ { x: 30, y: 40, clicks: 250 }, { x: 70, y: 40, clicks: 143 } ]
    }
  },
];

const kpiData = [
  { title: "Total Campaigns", value: "12" },
  { title: "Audience Size", value: "5,480" },
  { title: "Avg. Open Rate", value: "48.2%" },
  { title: "Avg. Click Rate", value: "15.7%" },
];

const KpiCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-surface p-6 rounded-xl shadow-sm">
    <p className="text-sm text-textSecondary font-medium">{title}</p>
    <p className="text-3xl font-bold text-textPrimary mt-2">{value}</p>
  </div>
);

const StatusBadge: React.FC<{ status: 'Active' | 'Draft' | 'Completed' | 'Scheduled' }> = ({ status }) => {
  const colorClasses = {
    Active: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-200 text-gray-800',
    Completed: 'bg-blue-100 text-blue-800',
    Scheduled: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const ReportKpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-background p-4 rounded-lg">
    <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-bold text-textPrimary mt-1">{value}</p>
  </div>
);

const CampaignReportModal: React.FC<{ campaign: EmailCampaign, onClose: () => void }> = ({ campaign, onClose }) => {
    const pieData = campaign.report ? [
        { name: 'Mobile', value: campaign.report.clientBreakdown.mobile },
        { name: 'Desktop', value: campaign.report.clientBreakdown.desktop },
    ] : [];

    const COLORS = ['#1E88E5', '#0D47A1'];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-surface/80 backdrop-blur-sm p-4 border-b border-gray-200 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary">{campaign.name}</h2>
                        <p className="text-sm text-textSecondary">Campaign Performance Report</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <ReportKpiCard title="Sent" value={campaign.sent.toLocaleString()} />
                        <ReportKpiCard title="Open Rate" value={`${campaign.openRate.toFixed(1)}%`} />
                        <ReportKpiCard title="Click Rate" value={`${campaign.clickRate.toFixed(1)}%`} />
                        <ReportKpiCard title="Conversions" value={campaign.conversions.toLocaleString()} />
                        <ReportKpiCard title="Unsubscribes" value={`${campaign.unsubscribeRate.toFixed(1)}%`} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-background p-4 rounded-lg">
                             <h3 className="font-semibold text-textPrimary mb-4">Engagement (First 24h)</h3>
                             <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={campaign.report?.performanceOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="hour" tick={{ fill: '#757575', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}/>
                                    <Legend iconType="circle" iconSize={8} />
                                    <Line type="monotone" dataKey="opens" stroke="#0D47A1" strokeWidth={2} name="Opens" />
                                    <Line type="monotone" dataKey="clicks" stroke="#FFC107" strokeWidth={2} name="Clicks" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-background p-4 rounded-lg">
                             <h3 className="font-semibold text-textPrimary mb-4">Client Breakdown</h3>
                             <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" iconSize={8} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-textPrimary mb-4">Visual Click Map</h3>
                        <div className="relative w-full aspect-[2/1] bg-gray-100 rounded-lg p-8 border border-gray-200">
                             <p className="text-center text-textSecondary text-sm mb-4">This is a simulation of the email body to show click hotspots.</p>
                             <div className="mx-auto w-full max-w-sm bg-white p-6 rounded-md shadow-inner space-y-4">
                                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-10 bg-primary/80 rounded-lg animate-pulse"></div>
                                <div className="h-10 bg-accent/80 rounded-lg animate-pulse"></div>
                             </div>
                             {campaign.report?.clickMap.map((spot, index) => {
                                const size = 20 + spot.clicks / 10;
                                return (
                                <div
                                    key={index}
                                    className="absolute bg-secondary/50 rounded-full flex items-center justify-center text-xs font-bold text-black animate-ping"
                                    style={{
                                    left: `${spot.x}%`,
                                    top: `${spot.y}%`,
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    transform: `translate(-50%, -50%)`,
                                    animation: `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite`
                                    }}
                                    title={`${spot.clicks} clicks`}
                                >
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MarketingProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onSendMessage: (lead: ClientLead | RecruitLead, type: 'SMS' | 'Email', content: string, subject?: string) => void;
    allLeads: (ClientLead | RecruitLead)[];
}

const Marketing: React.FC<MarketingProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'Campaigns' | 'Communication Log'>('Campaigns');
  
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
      
      <div className="flex items-center border-b border-gray-200">
        <TabButton label="Campaigns" />
        <TabButton label="Communication Log" />
      </div>

      <div>
        {activeTab === 'Campaigns' && <CampaignsView />}
        {activeTab === 'Communication Log' && <CommunicationLogView {...props} />}
      </div>
    </div>
  );
};

// #region CampaignsView
const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const handleCreateCampaign = (newCampaign: EmailCampaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
  };

  return (
     <div className="bg-surface p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-textPrimary">Email Campaigns</h2>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>Create Campaign</span>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Campaign Name</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Sent / Scheduled</th>
                        <th scope="col" className="px-6 py-3">Open Rate</th>
                        <th scope="col" className="px-6 py-3">Click Rate</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map(campaign => {
                        const isClickable = campaign.status !== 'Draft' && campaign.status !== 'Scheduled';
                        return (
                            <tr 
                                key={campaign.id} 
                                className={`bg-white border-b hover:bg-gray-50 ${isClickable ? 'cursor-pointer' : ''}`}
                                onClick={isClickable ? () => setSelectedCampaign(campaign) : undefined}
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    <div className="text-base font-semibold">{campaign.name}</div>
                                    <div className="font-normal text-gray-500 text-xs">{campaign.subject}</div>
                                </th>
                                <td className="px-6 py-4">
                                    <StatusBadge status={campaign.status} />
                                </td>
                                <td className="px-6 py-4">
                                    {campaign.status === 'Scheduled' && campaign.scheduledAt ? (
                                        <div className="text-xs font-medium">
                                            <p>{new Date(campaign.scheduledAt).toLocaleDateString()}</p>
                                            <p className="text-gray-500">{new Date(campaign.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    ) : (
                                        campaign.sent.toLocaleString()
                                    )}
                                </td>
                                <td className="px-6 py-4">{campaign.status === 'Scheduled' ? '-' : `${campaign.openRate.toFixed(1)}%`}</td>
                                <td className="px-6 py-4">{campaign.status === 'Scheduled' ? '-' : `${campaign.clickRate.toFixed(1)}%`}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); alert('Edit coming soon!'); }}
                                            className="font-medium text-primary-dark hover:underline disabled:text-gray-400 disabled:no-underline" 
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isClickable) {
                                                    setSelectedCampaign(campaign);
                                                }
                                            }} 
                                            className="font-medium text-primary-dark hover:underline disabled:text-gray-400 disabled:no-underline" 
                                            disabled={!isClickable}
                                        >
                                            Report
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      {selectedCampaign && <CampaignReportModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}
      {isCreateModalOpen && <CreateCampaignModal onCreate={handleCreateCampaign} onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
};

const CreateCampaignModal: React.FC<{ onCreate: (campaign: EmailCampaign) => void, onClose: () => void }> = ({ onCreate, onClose }) => {
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignSubject, setNewCampaignSubject] = useState('');
    const [newCampaignBody, setNewCampaignBody] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showAiPromptInput, setShowAiPromptInput] = useState(false);

    const resetCreateForm = () => {
        onClose();
    };

    const handleCreateCampaign = () => {
        if (!newCampaignName || !newCampaignSubject) {
            alert('Please provide a campaign name and subject.');
            return;
        }
        if (isScheduling && !scheduledAt) {
            alert('Please select a date and time to schedule the campaign.');
            return;
        }

        const newCampaign: EmailCampaign = {
            id: `camp${Date.now()}`,
            name: newCampaignName,
            subject: newCampaignSubject,
            status: isScheduling ? 'Scheduled' : 'Active',
            sent: isScheduling ? 0 : Math.floor(Math.random() * 500) + 50, // Simulate sending
            openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0, conversions: 0,
            lastModified: new Date().toISOString().split('T')[0],
            scheduledAt: isScheduling ? scheduledAt : null,
            aiPrompt: aiPrompt,
        };
        onCreate(newCampaign);
        resetCreateForm();
    };

    const handleAskAi = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);
        const fullPrompt = `Draft an email campaign to a generic recipient. The subject should be compelling and the body should be professional. The goal is to: "${aiPrompt}". Use markdown for formatting like bolding or bullet points where appropriate.`;
        try {
            // FIX: Correctly structure the 'contents' argument for the API call.
            const response = await getAiCopilotResponse([{ role: 'user', parts: [{ text: fullPrompt }] }], 'The user is creating an email marketing campaign.');
            // FIX: Check for function calls instead of the non-existent 'emailDraft' property.
            const draftCall = response.functionCalls?.find(fc => fc.name === 'draftEmail');
            if (draftCall) {
                // FIX: Use arguments from the function call to set the subject and body.
                setNewCampaignSubject(draftCall.args.subject as string);
                setNewCampaignBody(draftCall.args.body as string);
            } else if (response.chatResponse) {
                setNewCampaignBody(response.chatResponse);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate content with AI.");
        }
        setIsAiLoading(false);
    };
    
    const minDateTime = new Date().toISOString().slice(0, 16);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Create New Campaign</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    <div>
                        <label htmlFor="campaignName" className="block text-sm font-medium text-textPrimary">Campaign Name</label>
                        <input type="text" id="campaignName" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} placeholder="e.g., Q4 Term Life Promotion" className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="subject" className="block text-sm font-medium text-textPrimary">Subject Line</label>
                            <button 
                                type="button" 
                                onClick={() => setShowAiPromptInput(!showAiPromptInput)} 
                                className="flex items-center space-x-1 text-xs font-semibold text-primary-dark hover:text-primary-light"
                            >
                                <AiSparkleIcon className="w-4 h-4" />
                                <span>Ask AI</span>
                            </button>
                        </div>
                        <input type="text" id="subject" value={newCampaignSubject} onChange={e => setNewCampaignSubject(e.target.value)} placeholder="e.g., Secure Your Family's Future" className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                    </div>

                    {showAiPromptInput && (
                         <div className="p-3 bg-primary-light/10 rounded-lg">
                            <label className="text-sm font-medium text-primary-dark">Describe the goal of your campaign to draft the subject and body</label>
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., 'a campaign for a new auto insurance discount'" className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                                <button onClick={handleAskAi} disabled={isAiLoading} className="px-4 py-2 bg-primary text-white rounded-md font-semibold text-sm w-28">
                                    {isAiLoading ? 'Drafting...' : 'Ask AI'}
                                </button>
                            </div>
                        </div>
                    )}

                     <div>
                        <label htmlFor="body" className="block text-sm font-medium text-textPrimary">Email Body</label>
                        <textarea id="body" rows={8} value={newCampaignBody} onChange={e => setNewCampaignBody(e.target.value)} placeholder="Compose your email..." className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="p-4 bg-background rounded-lg space-y-4">
                        <div className="flex items-center">
                            <input type="checkbox" id="schedule" checked={isScheduling} onChange={(e) => setIsScheduling(e.target.checked)} className="h-4 w-4 text-primary rounded border-gray-300" />
                            <label htmlFor="schedule" className="ml-3 block text-sm font-medium text-textPrimary">Schedule for later</label>
                        </div>
                        {isScheduling && (
                            <div>
                                <label htmlFor="scheduledAt" className="block text-xs font-medium text-textSecondary">Schedule Date & Time</label>
                                <input type="datetime-local" id="scheduledAt" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} min={minDateTime} className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        )}
                    </div>
                </div>
                <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end items-center space-x-3">
                    <button onClick={resetCreateForm} className="bg-gray-200 hover:bg-gray-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    {isScheduling ? (
                        <button onClick={handleCreateCampaign} disabled={!scheduledAt} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-primary/50">Schedule Campaign</button>
                    ) : (
                        <button onClick={handleCreateCampaign} className="bg-accent hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Send Now</button>
                    )}
                </footer>
            </div>
        </div>
    )
}
// #endregion

// #region CommunicationLogView
const NewConversationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    leads: (ClientLead | RecruitLead)[];
    onSend: (lead: ClientLead | RecruitLead, type: 'SMS' | 'Email', content: string, subject?: string) => void;
}> = ({ isOpen, onClose, leads, onSend }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string>('');
    const [messageType, setMessageType] = useState<'SMS' | 'Email'>('SMS');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedLead = leads.find(l => l.id === selectedLeadId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSend = () => {
        if (!selectedLead || !body) {
            alert("Please select a lead and write a message.");
            return;
        }
        if (messageType === 'Email' && !subject) {
            alert("Please provide a subject for the email.");
            return;
        }
        onSend(selectedLead, messageType, body, subject);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">New Conversation</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50"><CloseIcon/></button>
                </header>
                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    <div className="relative" ref={searchRef}>
                        <label className="block text-sm font-medium text-textPrimary">Recipient</label>
                        <input
                            type="text"
                            value={selectedLead ? selectedLead.name : searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setSelectedLeadId('');
                                if (!isDropdownOpen) setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder="Search for a lead..."
                            className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm"
                        />
                        {isDropdownOpen && filteredLeads.length > 0 && (
                            <ul className="absolute z-10 w-full bg-surface border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                                {filteredLeads.map(lead => (
                                    <li key={lead.id} onClick={() => {
                                        setSelectedLeadId(lead.id);
                                        setSearchTerm(lead.name);
                                        setIsDropdownOpen(false);
                                    }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                        {lead.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex items-center border-b border-gray-200">
                        <button onClick={() => setMessageType('SMS')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${messageType === 'SMS' ? 'border-primary text-primary' : 'border-transparent text-textSecondary'}`}>SMS</button>
                        <button onClick={() => setMessageType('Email')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${messageType === 'Email' ? 'border-primary text-primary' : 'border-transparent text-textSecondary'}`}>Email</button>
                    </div>
                    {messageType === 'Email' && (
                        <div>
                            <label htmlFor="subject-new" className="block text-sm font-medium text-textPrimary">Subject</label>
                            <input type="text" id="subject-new" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="body-new" className="block text-sm font-medium text-textPrimary">Message</label>
                        <textarea id="body-new" value={body} onChange={e => setBody(e.target.value)} rows={messageType === 'SMS' ? 4 : 8} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
                <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end">
                    <button onClick={handleSend} disabled={!selectedLeadId || !body} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-primary/50">Send</button>
                </footer>
            </div>
        </div>
    )
}

const CommunicationLogView: React.FC<Pick<MarketingProps, 'messages' | 'setMessages' | 'onSendMessage' | 'allLeads'>> = ({ messages, setMessages, onSendMessage, allLeads }) => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(messages[0]?.leadId || null);
    const [reply, setReply] = useState('');
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversations = messages.reduce((acc, msg) => {
        if (!acc[msg.leadId]) {
            acc[msg.leadId] = {
                leadName: msg.leadName,
                leadAvatarUrl: msg.leadAvatarUrl,
                messages: [],
                lastMessageTimestamp: msg.timestamp,
                unreadCount: 0,
            };
        }
        acc[msg.leadId].messages.push(msg);
        if (msg.direction === 'incoming' && !msg.read) {
            acc[msg.leadId].unreadCount++;
        }
        if (new Date(msg.timestamp) > new Date(acc[msg.leadId].lastMessageTimestamp)) {
             acc[msg.leadId].lastMessageTimestamp = msg.timestamp;
        }
        return acc;
    }, {} as { [key: string]: { leadName: string, leadAvatarUrl: string, messages: Message[], lastMessageTimestamp: string, unreadCount: number } });

    const sortedConversations = Object.entries(conversations)
        .sort(([, a], [, b]) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    
    const activeConversationMessages = selectedConversationId ? conversations[selectedConversationId].messages.slice().sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];
    const activeConversationType = activeConversationMessages.length > 0 ? activeConversationMessages[0].type : 'SMS';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConversationMessages]);

    const handleSelectConversation = (leadId: string) => {
        setSelectedConversationId(leadId);
        setMessages(prev => prev.map(msg => msg.leadId === leadId && msg.direction === 'incoming' ? { ...msg, read: true } : msg));
    };

    const handleSendReply = () => {
        if (!reply || !selectedConversationId) return;
        const lead = allLeads.find(l => l.id === selectedConversationId);
        if (lead) {
            let replySubject: string | undefined = undefined;
            if (activeConversationType === 'Email') {
                const lastMessageWithSubject = [...activeConversationMessages].reverse().find(m => m.subject);
                if (lastMessageWithSubject?.subject) {
                    replySubject = lastMessageWithSubject.subject.startsWith('Re: ') ? lastMessageWithSubject.subject : `Re: ${lastMessageWithSubject.subject}`;
                }
            }
            onSendMessage(lead, activeConversationType, reply, replySubject);
            setReply('');
        }
    };
    
    return (
        <div className="bg-surface p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-textPrimary">Communication Log & Responses</h2>
                <button onClick={() => setIsNewMessageModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm">
                    <PlusIcon className="w-4 h-4"/>
                    <span>New Conversation</span>
                </button>
            </div>
            <div className="flex border border-gray-200 rounded-lg h-[600px]">
                {sortedConversations.length > 0 ? (
                <>
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-3 border-b border-gray-200 font-semibold text-sm">Conversations</div>
                    <div className="overflow-y-auto">
                        {sortedConversations.map(([leadId, convo]) => (
                            <div key={leadId} onClick={() => handleSelectConversation(leadId)}
                                className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-gray-100 ${selectedConversationId === leadId ? 'bg-primary-light/10' : 'hover:bg-gray-50'}`}>
                                <div className="relative">
                                    <img src={convo.leadAvatarUrl} alt={convo.leadName} className="w-10 h-10 rounded-full" />
                                    {convo.unreadCount > 0 && 
                                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-surface" />
                                    }
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-sm truncate">{convo.leadName}</p>
                                    <p className="text-xs text-textSecondary truncate">{convo.messages[convo.messages.length - 1].content}</p>
                                </div>
                                <div className="text-xs text-gray-400 flex-shrink-0">{new Date(convo.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-2/3 flex flex-col">
                    {selectedConversationId && conversations[selectedConversationId] ? (
                        <>
                        <div className="p-3 border-b border-gray-200 flex items-center space-x-2">
                           <img src={conversations[selectedConversationId].leadAvatarUrl} alt={conversations[selectedConversationId].leadName} className="w-8 h-8 rounded-full" />
                           <p className="font-semibold">{conversations[selectedConversationId].leadName}</p>
                        </div>
                        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50/50">
                            {activeConversationMessages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md p-3 rounded-2xl ${msg.direction === 'outgoing' ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-200 text-textPrimary rounded-bl-none'}`}>
                                        {msg.type === 'Email' && msg.subject && <p className="font-bold text-sm mb-1">{msg.subject}</p>}
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-xs mt-1 text-right ${msg.direction === 'outgoing' ? 'text-white/70' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-2 border-t border-gray-200 bg-white relative">
                             <input type="text" value={reply} onChange={(e) => setReply(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendReply()} placeholder={`Reply to ${conversations[selectedConversationId].leadName}...`} className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-light focus:outline-none pr-12" />
                             <button onClick={handleSendReply} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400 transition-colors">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-textSecondary">
                            <p>Select a conversation to view messages.</p>
                        </div>
                    )}
                </div>
                </>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center h-full text-center p-8">
                        <h3 className="text-lg font-semibold text-textPrimary">Your Inbox is Empty</h3>
                        <p className="text-textSecondary mt-2">Start a new conversation or send a message from a lead's profile to get started.</p>
                        <button onClick={() => setIsNewMessageModalOpen(true)} className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">
                            Start a New Conversation
                        </button>
                    </div>
                )}
            </div>
            {isNewMessageModalOpen && <NewConversationModal isOpen={isNewMessageModalOpen} onClose={() => setIsNewMessageModalOpen(false)} leads={allLeads} onSend={onSendMessage} />}
        </div>
    );
};
// #endregion

export default Marketing;
