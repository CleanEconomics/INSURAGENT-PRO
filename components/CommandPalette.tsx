import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, DashboardIcon, LeadsIcon, PipelineIcon, ContactsIcon } from './icons';
import { Page, ClientLead, RecruitLead } from '../types';

interface CommandPaletteProps {
    onClose: () => void;
    setActivePage: (page: Page) => void;
    contacts: (ClientLead | RecruitLead)[];
}

const pages = [
    { name: Page.Dashboard, icon: <DashboardIcon className="w-5 h-5 text-slate-500" /> },
    { name: Page.Leads, icon: <LeadsIcon className="w-5 h-5 text-slate-500" /> },
    { name: Page.Pipeline, icon: <PipelineIcon className="w-5 h-5 text-slate-500" /> },
    { name: Page.Contacts, icon: <ContactsIcon className="w-5 h-5 text-slate-500" /> },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, setActivePage, contacts }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredPages = pages.filter(page => page.name.toLowerCase().includes(query.toLowerCase()));
    const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    const results = [...filteredPages, ...filteredContacts];

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = results[activeIndex];
                if (selected) {
                    if ('icon' in selected) { // It's a Page
                        setActivePage(selected.name);
                    } else { // It's a Contact/Lead
                        // In a real app, you'd navigate to the contact's detail page
                        alert(`Navigating to ${selected.name}'s profile...`);
                    }
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, activeIndex]);
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                        placeholder="Go to page, search contact, or perform action..."
                        className="w-full p-4 pl-12 text-lg bg-transparent focus:outline-none"
                    />
                    <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                 <div className="border-t border-slate-200 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                        <ul>
                            {results.map((item, index) => (
                                // FIX: The type guard `'name' in item` was always true, causing a type error for the `else` case. Using `'icon' in item` correctly distinguishes between page and contact/lead objects to provide a unique key.
                                <li key={'icon' in item ? item.name : item.id} 
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`p-4 flex items-center space-x-4 cursor-pointer ${activeIndex === index ? 'bg-primary-100' : ''}`}
                                >
                                    {'icon' in item ? item.icon : <img src={item.avatarUrl} className="w-8 h-8 rounded-full" alt={item.name} />}
                                    <span className="font-semibold text-textPrimary">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-8 text-center text-textSecondary">No results found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;