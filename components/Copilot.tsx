
import React, { useState, useRef, useEffect } from 'react';
import { AiSparkleIcon, CloseIcon, SendIcon, CopyIcon, BookOpenIcon } from './icons';
import { getAiCopilotResponse } from '../services/geminiService';
import { Page, EmailDraft, KnowledgeResource, ClientLead, RecruitLead, LeadStatus } from '../types';
import { Content, Part } from '@google/genai';

interface DisplayMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  draft?: EmailDraft;
  searchResults?: KnowledgeResource[];
  functionResult?: { name: string; result: any; };
  isLoading?: boolean;
}

interface CopilotProps {
    activePage: Page;
    knowledgeResources: KnowledgeResource[];
    clientLeads: ClientLead[];
    recruitLeads: RecruitLead[];
    handleSearchKnowledgeHub: (query: string) => KnowledgeResource[] | string;
    handleCreateClientLead: (details: { name: string, email: string, phone?: string, source?: string }) => { success: boolean, message: string, leadId?: string };
    handleUpdateClientLead: (details: { leadName: string, newStatus?: any, newPhone?: string, newEmail?: string }) => { success: boolean, message: string };
    handleCreateRecruitLead: (details: { name: string, email: string, phone?: string, source?: string, roleInterest: string }) => { success: boolean, message: string, leadId?: string };
    handleUpdateRecruitLead: (details: { leadName: string, newStatus?: any, newPhone?: string, newEmail?: string }) => { success: boolean, message: string };
    handleScheduleAppointment: (details: { leadName: string, title: string, startDateTimeISO: string, durationMinutes: number }) => { success: boolean, message: string, appointmentId?: string };
}

const tones = ['Friendly', 'Formal', 'Persuasive', 'Concise'] as const;
type Tone = typeof tones[number];


const EmailDraftCard: React.FC<{ draft: EmailDraft }> = ({ draft }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const emailContent = `To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`;
        navigator.clipboard.writeText(emailContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white text-textPrimary rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-200">
                <p className="text-xs text-gray-500">To: <span className="font-medium text-textPrimary">{draft.recipient}</span></p>
                <p className="text-xs text-gray-500 mt-1">Subject: <span className="font-medium text-textPrimary">{draft.subject}</span></p>
            </div>
            <div className="p-3">
                <p className="text-sm whitespace-pre-wrap">{draft.body}</p>
            </div>
            <div className="p-2 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-primary-dark hover:text-primary-light transition-colors"
                >
                    <CopyIcon className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
            </div>
        </div>
    );
};

const SearchResultsCard: React.FC<{ results: KnowledgeResource[] }> = ({ results }) => (
    <div className="bg-white text-textPrimary rounded-2xl rounded-bl-none shadow-sm border border-gray-200 p-3 space-y-2">
        <p className="font-semibold text-sm">Here's what I found in the Knowledge Hub:</p>
        {results.map(res => (
            <div key={res.id} className="p-2 bg-background rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                    <BookOpenIcon className="w-4 h-4 text-primary-dark" />
                    <p className="font-semibold text-sm">{res.title}</p>
                </div>
                <p className="text-xs text-textSecondary mt-1">{res.description}</p>
            </div>
        ))}
    </div>
);

const Copilot: React.FC<CopilotProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Content[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>('Friendly');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [displayMessages]);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && displayMessages.length === 0) {
        const welcomeMessage: DisplayMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: `Hello! I'm your AI Copilot. How can I help you with the ${props.activePage} today? \n\nI can perform tasks like:\n- "Search for compliance documents"\n- "Create a new client lead for John Doe"\n- "Schedule a meeting with Maria Garcia tomorrow at 2pm"` };
        setDisplayMessages([welcomeMessage]);
        setHistory([{ role: 'model', parts: [{ text: welcomeMessage.text || '' }] }]);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessageText = input;
    const userMessageId = `user-${Date.now()}`;
    setInput('');
    
    // Add user message to UI and history
    setDisplayMessages(prev => [...prev, { id: userMessageId, sender: 'user', text: userMessageText }]);
    const newHistory: Content[] = [...history, { role: 'user', parts: [{ text: userMessageText }] }];
    setHistory(newHistory);
    setIsLoading(true);

    // Add loading indicator
    const loadingMessageId = `ai-loading-${Date.now()}`;
    setDisplayMessages(prev => [...prev, { id: loadingMessageId, sender: 'ai', isLoading: true }]);

    // First API call
    const response = await getAiCopilotResponse(newHistory, `The user is currently on the ${props.activePage} page.`);

    // Remove loading indicator
    setDisplayMessages(prev => prev.filter(m => m.id !== loadingMessageId));

    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0]; // Assuming one call for now
      const functionResponses: Part[] = [];

      // Add model's turn (the function call) to history
      const modelTurn: Content = { role: 'model', parts: [{ functionCall }] };
      const historyAfterModelTurn = [...newHistory, modelTurn];

      // Execute functions and collect results
      for (const call of response.functionCalls) {
        let result: any;
        let displayResult: Partial<DisplayMessage> = {};

        switch (call.name) {
          case 'searchKnowledgeHub':
            result = props.handleSearchKnowledgeHub(call.args.query as string);
            if(Array.isArray(result)) {
                displayResult = { searchResults: result };
            }
            break;
          case 'createClientLead':
            // FIX: Cast `call.args` to the expected type.
            result = props.handleCreateClientLead(call.args as { name: string; email: string; phone?: string; source?: string; });
            break;
          case 'updateClientLead':
            // FIX: Cast `call.args` to the expected type.
            result = props.handleUpdateClientLead(call.args as { leadName: string; newStatus?: LeadStatus; newPhone?: string; newEmail?: string; });
            break;
          case 'createRecruitLead':
            // FIX: Cast `call.args` to the expected type.
            result = props.handleCreateRecruitLead(call.args as { name: string; email: string; phone?: string; source?: string; roleInterest: string; });
            break;
          case 'updateRecruitLead':
            // FIX: Cast `call.args` to the expected type.
            result = props.handleUpdateRecruitLead(call.args as { leadName: string; newStatus?: LeadStatus; newPhone?: string; newEmail?: string; });
            break;
          case 'scheduleAppointment':
            // FIX: Cast `call.args` to the expected type.
            result = props.handleScheduleAppointment(call.args as { leadName: string; title: string; startDateTimeISO: string; durationMinutes: number; });
            break;
          case 'draftEmail':
            result = { success: true, message: 'Email drafted for you to review.' };
            // FIX: Cast `call.args` to EmailDraft type.
            displayResult = { draft: call.args as unknown as EmailDraft };
            break;
          default:
            result = { error: `Unknown function ${call.name}` };
        }
        
        // Display function result card if needed
        if (displayResult.searchResults || displayResult.draft) {
             setDisplayMessages(prev => [...prev, { id: `ai-fn-res-${Date.now()}`, sender: 'ai', ...displayResult }]);
        }

        functionResponses.push({ functionResponse: { name: call.name, response: { result: result } } });
      }

      // Add function responses to history
      const historyWithFunctionResults: Content[] = [...historyAfterModelTurn, { role: 'function', parts: functionResponses }];
      setHistory(historyWithFunctionResults);

      // Second API call to get natural language response
      setIsLoading(true);
      const loadingId2 = `ai-loading-2-${Date.now()}`;
      setDisplayMessages(prev => [...prev, { id: loadingId2, sender: 'ai', isLoading: true }]);
      
      const finalResponse = await getAiCopilotResponse(historyWithFunctionResults);
      
      setDisplayMessages(prev => prev.filter(m => m.id !== loadingId2));

      if (finalResponse.chatResponse) {
        const finalMessage: DisplayMessage = { id: `ai-final-${Date.now()}`, sender: 'ai', text: finalResponse.chatResponse };
        setDisplayMessages(prev => [...prev, finalMessage]);
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: finalResponse.chatResponse! }] }]);
      }

    } else if (response.chatResponse) {
      const aiMessage: DisplayMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: response.chatResponse };
      setDisplayMessages(prev => [...prev, aiMessage]);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: response.chatResponse! }] }]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const CopilotWindow = () => (
    <div className="fixed bottom-24 right-8 w-96 h-[32rem] bg-surface rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50">
        <header className="flex items-center justify-between p-4 bg-primary text-white rounded-t-2xl">
            <div className="flex items-center space-x-2">
                <AiSparkleIcon className="w-6 h-6" />
                <h3 className="font-semibold">InsurAgent Copilot</h3>
            </div>
            <button onClick={handleToggle} className="p-1 rounded-full hover:bg-white/20">
                <CloseIcon className="w-5 h-5" />
            </button>
        </header>
        <div className="flex-grow p-4 overflow-y-auto bg-background">
            <div className="space-y-4">
            {displayMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs ${msg.sender === 'user' ? 'px-4 py-2 rounded-2xl bg-primary-light text-white rounded-br-none' : ''}`}>
                         {msg.text && <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />}
                         {msg.draft && <EmailDraftCard draft={msg.draft} />}
                         {msg.searchResults && <SearchResultsCard results={msg.searchResults} />}
                         {msg.isLoading && (
                            <div className="max-w-xs px-4 py-2 rounded-2xl bg-white text-textPrimary rounded-bl-none shadow-sm flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                         )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl space-y-3">
             <div>
                <label className="text-xs font-semibold text-textSecondary mb-2 block">Email Tone (for drafts)</label>
                <div className="flex items-center space-x-2">
                    {tones.map(tone => (
                        <button 
                            key={tone} 
                            onClick={() => setSelectedTone(tone)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${selectedTone === tone ? 'bg-primary-light/20 text-primary-dark' : 'bg-gray-100 text-textSecondary hover:bg-gray-200'}`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything or give a command..."
                    className="w-full pr-12 py-2 pl-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-light focus:outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400 transition-colors"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  )

  return (
    <>
      {isOpen && <CopilotWindow />}
      <button
        onClick={handleToggle}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 ring-4 ring-blue-400/30 animate-pulse-soft"
        aria-label="Toggle AI Copilot"
        title="AI Copilot - Ask me anything!"
      >
        {isOpen ? <CloseIcon className="w-8 h-8" /> : <AiSparkleIcon className="w-8 h-8 animate-bounce-subtle" />}
      </button>
    </>
  );
};

export default Copilot;
