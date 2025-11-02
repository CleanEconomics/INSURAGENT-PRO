

import React, { useState } from 'react';
import { ClientLead, RecruitLead, LeadStatus, Activity, ActivityType } from '../types';
import { CloseIcon, PhoneIcon, EmailIcon, NoteIcon, StatusChangeIcon, CalendarIcon, CalendarPlusIcon, InfoIcon, EditIcon, CheckIcon } from './icons';
import CommunicationModal from './CommunicationModal';

interface LeadDetailViewProps {
  lead: ClientLead | RecruitLead;
  onClose: () => void;
  onUpdateLead: (lead: ClientLead | RecruitLead) => void;
  onConvertClientLead: (lead: ClientLead, details: { value: number; product: string; }) => void;
  onConvertRecruitLead: (lead: RecruitLead) => void;
  onSendMessage: (type: 'SMS' | 'Email', content: string, subject?: string) => void;
}

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const icons = {
        [ActivityType.Call]: <PhoneIcon className="w-4 h-4 text-blue-500" />,
        [ActivityType.Email]: <EmailIcon className="w-4 h-4 text-green-500" />,
        [ActivityType.Note]: <NoteIcon className="w-4 h-4 text-yellow-600" />,
        [ActivityType.StatusChange]: <StatusChangeIcon className="w-4 h-4 text-purple-500" />,
        [ActivityType.Appointment]: <CalendarIcon className="w-4 h-4 text-teal-500" />,
    };
    return <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">{icons[type]}</div>;
};

const CLIENT_SCORE_CRITERIA = {
  source: { 'Referral': 50, 'Web Form': 20, 'Facebook Ad': 10, 'Cold Call': 5, default: 0 },
  status: { [LeadStatus.Working]: 30, [LeadStatus.Contacted]: 20, [LeadStatus.New]: 10, [LeadStatus.Unqualified]: 0, [LeadStatus.Converted]: 0 }
};

const RECRUIT_SCORE_CRITERIA = {
  source: { 'Referral': 50, 'LinkedIn': 30, 'Indeed': 10, default: 0 },
  roleInterest: { 'P&C Producer': 30, 'Life & Health Agent': 25, 'Account Manager': 20, default: 15 },
  status: { [LeadStatus.Working]: 30, [LeadStatus.Contacted]: 20, [LeadStatus.New]: 10, [LeadStatus.Unqualified]: 0, [LeadStatus.Converted]: 0 }
};

const getPriorityFromScore = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
};

const ScoringRulesInfo: React.FC = () => (
  <div className="mt-4 p-4 bg-background rounded-lg text-xs text-textSecondary space-y-4 border border-gray-200">
    <p className="font-semibold text-textPrimary">Scoring Logic Explained</p>
    <div>
      <p className="font-medium text-textPrimary">Client Leads</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li><strong>Source:</strong> Referral (+50), Web Form (+20), Facebook Ad (+10), Cold Call (+5)</li>
        <li><strong>Status:</strong> Working (+30), Contacted (+20), New (+10)</li>
      </ul>
    </div>
    <div>
      <p className="font-medium text-textPrimary">Recruit Leads</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li><strong>Source:</strong> Referral (+50), LinkedIn (+30), Indeed (+10)</li>
        <li><strong>Role Interest:</strong> P&C Producer (+30), L&H Agent (+25), Acct. Manager (+20)</li>
        <li><strong>Status:</strong> Working (+30), Contacted (+20), New (+10)</li>
      </ul>
    </div>
  </div>
);

const ConvertClientLeadModal: React.FC<{ leadName: string, onCancel: () => void, onConfirm: (details: { value: number, product: string }) => void }> = ({ leadName, onCancel, onConfirm }) => {
    const [value, setValue] = useState('');
    const [product, setProduct] = useState('');

    const handleSubmit = () => {
        if (value && product && !isNaN(Number(value))) {
            onConfirm({ value: Number(value), product });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Convert Lead to Opportunity</h3>
                <p className="text-sm text-textSecondary mb-4">Create a new sales opportunity for <strong>{leadName}</strong>.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="opportunityValue" className="block text-sm font-medium text-textPrimary">Opportunity Value ($)</label>
                        <input type="number" id="opportunityValue" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g., 5000" className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"/>
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-textPrimary">Product</label>
                        <input type="text" id="product" value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g., Term Life Insurance" className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} disabled={!value || !product} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark disabled:bg-primary/50">Convert</button>
                </div>
            </div>
        </div>
    );
};


const LeadDetailView: React.FC<LeadDetailViewProps> = ({ lead, onClose, onUpdateLead, onConvertClientLead, onConvertRecruitLead, onSendMessage }) => {
  const [newNote, setNewNote] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showScoringRules, setShowScoringRules] = useState(false);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editedScore, setEditedScore] = useState(lead.score);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [commType, setCommType] = useState<'sms' | 'email'>('sms');


  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    const updatedLead = { ...lead, status: newStatus };
    
    const statusChangeActivity: Activity = {
      id: `act-${lead.id}-${lead.activities.length + 1}`,
      type: ActivityType.StatusChange,
      content: `Status changed to ${newStatus}.`,
      user: 'Jane Doe', // This would be the current user
      timestamp: new Date().toISOString(),
    };
    updatedLead.activities.unshift(statusChangeActivity);

    onUpdateLead(updatedLead);
  };

  const handleAddNote = () => {
    if (newNote.trim() === '') return;
    
    const noteActivity: Activity = {
      id: `act-${lead.id}-${lead.activities.length + 1}`,
      type: ActivityType.Note,
      content: newNote,
      user: 'Jane Doe', // This would be the current user
      timestamp: new Date().toISOString(),
    };
    
    const updatedLead = { ...lead, activities: [noteActivity, ...lead.activities] };
    onUpdateLead(updatedLead);
    setNewNote('');
  };

  const handleScheduleFollowUp = () => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 2); // 2 days from now
    const formattedDate = followUpDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const appointmentActivity: Activity = {
        id: `act-${lead.id}-${lead.activities.length + 1}`,
        type: ActivityType.Appointment,
        content: `Follow-up scheduled for ${formattedDate}.`,
        user: 'Jane Doe', // This would be the current user
        timestamp: new Date().toISOString(),
    };

    const updatedLead = { ...lead, activities: [appointmentActivity, ...lead.activities] };
    onUpdateLead(updatedLead);
    
    setConfirmationMessage('✅ Follow-up added to calendar!');
    setTimeout(() => {
        setConfirmationMessage('');
    }, 3000);
  };

  const getScoreBreakdown = () => {
    let breakdown: { criteria: string; value: string; points: number }[] = [];
    let totalScore = 0;

    if ('assignedTo' in lead) { // ClientLead
        const sourcePoints = CLIENT_SCORE_CRITERIA.source[lead.source as keyof typeof CLIENT_SCORE_CRITERIA.source] || CLIENT_SCORE_CRITERIA.source.default;
        breakdown.push({ criteria: 'Source', value: lead.source, points: sourcePoints });
        totalScore += sourcePoints;

        const statusPoints = CLIENT_SCORE_CRITERIA.status[lead.status] || 0;
        breakdown.push({ criteria: 'Status', value: lead.status, points: statusPoints });
        totalScore += statusPoints;
    } else { // RecruitLead
        const sourcePoints = RECRUIT_SCORE_CRITERIA.source[lead.source as keyof typeof RECRUIT_SCORE_CRITERIA.source] || RECRUIT_SCORE_CRITERIA.source.default;
        breakdown.push({ criteria: 'Source', value: lead.source, points: sourcePoints });
        totalScore += sourcePoints;

        const rolePoints = RECRUIT_SCORE_CRITERIA.roleInterest[lead.roleInterest as keyof typeof RECRUIT_SCORE_CRITERIA.roleInterest] || RECRUIT_SCORE_CRITERIA.roleInterest.default;
        breakdown.push({ criteria: 'Role Interest', value: lead.roleInterest, points: rolePoints });
        totalScore += rolePoints;

        const statusPoints = RECRUIT_SCORE_CRITERIA.status[lead.status] || 0;
        breakdown.push({ criteria: 'Status', value: lead.status, points: statusPoints });
        totalScore += statusPoints;
    }

    return { breakdown, totalScore };
  };

  const handleSaveScore = () => {
    const newPriority = getPriorityFromScore(editedScore);
    const updatedLead = { ...lead, score: editedScore, priority: newPriority };
    onUpdateLead(updatedLead);
    setIsEditingScore(false);
  };

  const handleConvert = () => {
    if ('assignedTo' in lead) {
        setIsConvertModalOpen(true);
    } else {
        if (window.confirm(`Are you sure you want to convert ${lead.name} to a candidate?`)) {
            onConvertRecruitLead(lead);
            onClose();
        }
    }
  };
  
  const handleConfirmClientConversion = (details: { value: number, product: string }) => {
    if ('assignedTo' in lead) {
        onConvertClientLead(lead, details);
        setIsConvertModalOpen(false);
        onClose();
    }
  };

  const { breakdown } = getScoreBreakdown();
  const isClientLead = 'assignedTo' in lead;
  const showFollowUpAction = lead.status === LeadStatus.New || lead.status === LeadStatus.Contacted;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-surface flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src={lead.avatarUrl} alt={lead.name} className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-lg font-bold text-textPrimary">{lead.name}</h2>
              <p className="text-sm text-textSecondary">{isClientLead ? 'Client Lead' : 'Recruit Lead'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
            <CloseIcon className="w-6 h-6 text-textSecondary" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {/* Lead Details */}
          <div className="bg-surface p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-textPrimary mb-4">Lead Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="text-textSecondary">Email</div><div className="text-textPrimary font-medium truncate">{lead.email}</div>
              <div className="text-textSecondary">Phone</div><div className="text-textPrimary font-medium">{lead.phone}</div>
              <div className="text-textSecondary">Source</div><div className="text-textPrimary font-medium">{lead.source}</div>
              {isClientLead ? (
                <>
                  <div className="text-textSecondary">Assigned To</div><div className="text-textPrimary font-medium">{lead.assignedTo}</div>
                </>
              ) : (
                <>
                  <div className="text-textSecondary">Role Interest</div><div className="text-textPrimary font-medium">{lead.roleInterest}</div>
                </>
              )}
               <div className="text-textSecondary">Created</div><div className="text-textPrimary font-medium">{new Date(lead.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Lead Scoring */}
          <div className="bg-surface p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-textPrimary">Lead Scoring</h3>
                <button onClick={() => setShowScoringRules(!showScoringRules)} className="p-1 rounded-full hover:bg-gray-200/50" title="Show scoring logic">
                    <InfoIcon className="w-5 h-5 text-textSecondary" />
                </button>
            </div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-textSecondary uppercase">Score Breakdown</p>
                    <ul className="mt-2 space-y-1 text-sm">
                        {breakdown.map((item, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>{item.criteria}: <span className="text-textSecondary">{item.value}</span></span>
                                <span className="font-semibold text-primary-dark ml-4">+{item.points}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs text-textSecondary uppercase">Total Score</p>
                    <p className="text-4xl font-bold text-primary-dark">{lead.score}</p>
                </div>
            </div>
            <hr className="my-4 border-gray-200" />
            <div>
                <label htmlFor="leadScore" className="block text-sm font-medium text-textPrimary">Score Override</label>
                <p className="text-xs text-textSecondary mb-2">Manually adjust the score. Priority will update automatically.</p>
                {isEditingScore ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            id="leadScore"
                            value={editedScore}
                            onChange={(e) => setEditedScore(parseInt(e.target.value, 10) || 0)}
                            className="block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
                        />
                         <button onClick={handleSaveScore} className="p-2 rounded-md bg-green-100 hover:bg-green-200 text-green-700" title="Save Score">
                            <CheckIcon className="w-5 h-5" />
                         </button>
                         <button onClick={() => setIsEditingScore(false)} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700" title="Cancel">
                            <CloseIcon className="w-5 h-5" />
                         </button>
                    </div>
                ) : (
                     <div className="flex items-center justify-between p-2 bg-background rounded-md border border-gray-200">
                        <span className="font-semibold text-textPrimary">{lead.score} (Priority: {lead.priority})</span>
                        <button onClick={() => setIsEditingScore(true)} className="flex items-center space-x-1 text-xs font-semibold text-primary-dark hover:text-primary-light">
                            <EditIcon />
                            <span>Edit</span>
                        </button>
                    </div>
                )}
            </div>
             {showScoringRules && <ScoringRulesInfo />}
          </div>

          {/* Status Updater */}
          <div className="bg-surface p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="leadStatus" className="block text-sm font-medium text-textPrimary">Lead Status</label>
            </div>
            <select
              id="leadStatus"
              value={lead.status}
              onChange={handleStatusChange}
              className="block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
            >
              {Object.values(LeadStatus).filter(s => s !== LeadStatus.Converted).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

           {/* Quick Actions */}
           <div className="bg-surface p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-textPrimary mb-3">Actions</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { setCommType('sms'); setIsCommModalOpen(true); }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-textPrimary bg-white hover:bg-gray-50">
                            <PhoneIcon />
                            <span>Send SMS</span>
                        </button>
                         <button 
                            onClick={() => { setCommType('email'); setIsCommModalOpen(true); }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-textPrimary bg-white hover:bg-gray-50">
                            <EmailIcon />
                            <span>Send Email</span>
                        </button>
                    </div>

                    {lead.status === LeadStatus.Working && (
                         <button 
                            onClick={handleConvert}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                           <span>Convert Lead</span>
                        </button>
                    )}
                    {showFollowUpAction && (
                        <button 
                            onClick={handleScheduleFollowUp}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-textPrimary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
                        >
                            <CalendarPlusIcon className="w-5 h-5" />
                            <span>Schedule Follow-up</span>
                        </button>
                    )}
                </div>
                 {confirmationMessage && (
                    <p className="text-center text-sm text-green-600 mt-3 transition-opacity duration-300">{confirmationMessage}</p>
                )}
            </div>


          {/* Activity Feed */}
          <div>
            <h3 className="font-semibold text-textPrimary mb-4">Activity</h3>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {lead.activities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== lead.activities.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <ActivityIcon type={activity.type} />
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-textSecondary">
                              {activity.content}
                            </p>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()} by {activity.user}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer for adding notes */}
        <footer className="p-4 bg-surface border-t border-gray-200 flex-shrink-0">
          <div className="relative">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full pr-24 py-2 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none resize-none"
            />
            <button
              onClick={handleAddNote}
              className="absolute right-2 bottom-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
            >
              Add Note
            </button>
          </div>
        </footer>
      </div>
      {isConvertModalOpen && 'assignedTo' in lead && (
        <ConvertClientLeadModal 
            leadName={lead.name}
            onCancel={() => setIsConvertModalOpen(false)}
            onConfirm={handleConfirmClientConversion}
        />
      )}
      {isCommModalOpen && (
        <CommunicationModal
            show={isCommModalOpen}
            onClose={() => setIsCommModalOpen(false)}
            lead={lead}
            initialType={commType}
            onSend={(type, content, subject) => onSendMessage(type, content, subject)}
        />
      )}
    </>
  );
};

export default LeadDetailView;