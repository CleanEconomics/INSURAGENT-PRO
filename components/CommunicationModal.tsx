
import React, { useState, useEffect } from 'react';
import { ClientLead, RecruitLead } from '../types';
import { CloseIcon, AiSparkleIcon } from './icons';
import { getAiCopilotResponse } from '../services/geminiService';

interface CommunicationModalProps {
  show: boolean;
  onClose: () => void;
  lead: ClientLead | RecruitLead;
  initialType: 'sms' | 'email';
  onSend: (type: 'SMS' | 'Email', content: string, subject?: string) => void;
}

const templates = {
    sms: [
        { name: 'Initial Outreach', content: 'Hi {{lead.name}}, this is Jane from InsurAgent Pro. Thanks for your interest! Are you free for a quick chat this week?' },
        { name: 'Follow-up', content: 'Hi {{lead.name}}, just following up on our conversation. Let me know if you have any questions.' },
        { name: 'Scheduling Link', content: 'Hi {{lead.name}}, feel free to book a time on my calendar that works for you: [Your Link Here]' }
    ],
    email: [
        { name: 'Welcome Email', subject: 'Welcome to InsurAgent Pro!', body: 'Hi {{lead.name}},\n\nThanks for connecting with us! We\'re excited to help you with your insurance needs.\n\nBest regards,\nJane Doe' },
        { name: 'Quote Follow-up', subject: 'Following up on your insurance quote', body: 'Hi {{lead.name}},\n\nI hope you\'ve had a chance to review the quote I sent over. Please let me know if you have any questions or if you\'re ready to move forward.\n\nBest,\nJane Doe' },
        { name: 'Post-Meeting Recap', subject: 'Great speaking with you', body: 'Hi {{lead.name}},\n\nIt was great speaking with you today. As discussed, I\'ve attached the documents we went over.\n\nLooking forward to hearing from you,\nJane Doe' }
    ]
};

const CommunicationModal: React.FC<CommunicationModalProps> = ({ show, onClose, lead, initialType, onSend }) => {
    const [currentType, setCurrentType] = useState(initialType);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [showAiInput, setShowAiInput] = useState(false);

    useEffect(() => {
        setCurrentType(initialType);
        setSubject('');
        setBody('');
        setShowAiInput(false);
    }, [show, initialType]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) return;

        if (currentType === 'email') {
            const template = templates.email.find(t => t.name === value);
            if (template) {
                setSubject(template.subject.replace('{{lead.name}}', lead.name));
                setBody(template.body.replace('{{lead.name}}', lead.name));
            }
        } else {
            const template = templates.sms.find(t => t.name === value);
            if (template) {
                setBody(template.content.replace('{{lead.name}}', lead.name));
            }
        }
    };

    const handleAskAi = async () => {
        if (!aiPrompt) return;
        setIsLoadingAi(true);
        try {
            const fullPrompt = `Draft a short and professional ${currentType} to a lead named ${lead.name}. The goal is to: ${aiPrompt}`;
            // FIX: Argument to getAiCopilotResponse must be of type Content[].
            const response = await getAiCopilotResponse([{ role: 'user', parts: [{ text: fullPrompt }] }]);
            const draftCall = response.functionCalls?.find(fc => fc.name === 'draftEmail');
            if (draftCall) {
                if (currentType === 'email' && draftCall.args.subject) {
                    setSubject(draftCall.args.subject as string);
                }
                if (draftCall.args.body) {
                    setBody(draftCall.args.body as string);
                }
            } else if (response.chatResponse) {
                setBody(response.chatResponse);
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Failed to get AI response.");
        } finally {
            setIsLoadingAi(false);
            setShowAiInput(false);
            setAiPrompt('');
        }
    };

    const handleSendClick = () => {
        if (!body) return;
        onSend(currentType === 'sms' ? 'SMS' : 'Email', body, subject);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Send Message to {lead.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                    <div className="flex items-center border-b border-gray-200">
                        <button onClick={() => setCurrentType('sms')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${currentType === 'sms' ? 'border-primary text-primary' : 'border-transparent text-textSecondary'}`}>SMS</button>
                        <button onClick={() => setCurrentType('email')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${currentType === 'email' ? 'border-primary text-primary' : 'border-transparent text-textSecondary'}`}>Email</button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="template" className="block text-sm font-medium text-textPrimary">Use a Template</label>
                            <select id="template" onChange={handleTemplateChange} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                                <option value="">Select a template...</option>
                                {(currentType === 'sms' ? templates.sms : templates.email).map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="pt-6">
                            <button onClick={() => setShowAiInput(true)} disabled={isLoadingAi} className="flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark">
                                <AiSparkleIcon className="w-5 h-5" />
                                <span>Ask AI</span>
                            </button>
                        </div>
                    </div>

                    {showAiInput && (
                        <div className="p-3 bg-primary-light/10 rounded-lg">
                            <label className="text-sm font-medium text-primary-dark">What's the goal of this message?</label>
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., 'ask for a good time to call'" className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                                <button onClick={handleAskAi} className="px-4 py-2 bg-primary text-white rounded-md font-semibold text-sm">Draft</button>
                                <button onClick={() => setShowAiInput(false)} className="px-4 py-2 bg-gray-200 text-textPrimary rounded-md font-semibold text-sm">Cancel</button>
                            </div>
                        </div>
                    )}
                    
                    {isLoadingAi && <div className="text-center p-4">Drafting with AI...</div>}

                    {currentType === 'email' && (
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-textPrimary">Subject</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    )}

                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-textPrimary">Message Body</label>
                        <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={currentType === 'sms' ? 4 : 8} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm" />
                        {currentType === 'sms' && <p className="text-xs text-textSecondary mt-1 text-right">{body.length} / 160</p>}
                    </div>

                </div>
                <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end">
                    <button onClick={handleSendClick} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">Send</button>
                </footer>
            </div>
        </div>
    );
};

export default CommunicationModal;
