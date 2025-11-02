import React, { useState, useEffect } from 'react';
import { Page, Appointment, Contact } from '../types';
import { SettingsIcon, CloseIcon } from './icons';

interface CalendarProps {
    isGoogleCalendarConnected: boolean;
    setActivePage: (page: Page) => void;
    appointments: Appointment[];
    contacts: Contact[];
    onAddAppointment: (newAppointment: Omit<Appointment, 'id'>) => void;
}

const AddAppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id'>) => void;
    contacts: Contact[];
    initialDate?: Date;
}> = ({ isOpen, onClose, onSave, contacts, initialDate }) => {
    
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getInitialStart = () => {
        const d = initialDate ? new Date(initialDate) : new Date();
        if (!initialDate) d.setHours(9, 0, 0, 0); // Default to 9:00 AM if no specific date
        return d;
    }
    
    const getInitialEnd = () => {
        const d = getInitialStart();
        d.setHours(d.getHours() + 1); // Default to 1 hour duration
        return d;
    }

    const [title, setTitle] = useState('');
    const [contactName, setContactName] = useState(contacts[0]?.name || '');
    const [start, setStart] = useState(formatDateForInput(getInitialStart()));
    const [end, setEnd] = useState(formatDateForInput(getInitialEnd()));
    const [type, setType] = useState<'Meeting' | 'Call' | 'Follow-up'>('Meeting');

    useEffect(() => {
        if (initialDate) {
            const startDate = new Date(initialDate);
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            setStart(formatDateForInput(startDate));
            setEnd(formatDateForInput(endDate));
        }
    }, [initialDate]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !contactName || !start || !end) {
            alert("Please fill out all fields.");
            return;
        }
        if (new Date(start) >= new Date(end)) {
            alert("End time must be after start time.");
            return;
        }
        onSave({ title, contactName, start: new Date(start), end: new Date(end), type });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-textPrimary">New Appointment</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                            <CloseIcon className="w-6 h-6 text-textSecondary" />
                        </button>
                    </header>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-textPrimary">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="contact" className="block text-sm font-medium text-textPrimary">Contact</label>
                                <select id="contact" value={contactName} onChange={e => setContactName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                    <option value="Internal">Internal</option>
                                    <option value="Multiple">Multiple</option>
                                    {contacts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-textPrimary">Type</label>
                                <select id="type" value={type} onChange={e => setType(e.target.value as any)} required className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                    <option value="Meeting">Meeting</option>
                                    <option value="Call">Call</option>
                                    <option value="Follow-up">Follow-up</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start" className="block text-sm font-medium text-textPrimary">Start Time</label>
                                <input type="datetime-local" id="start" value={start} onChange={e => setStart(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="end" className="block text-sm font-medium text-textPrimary">End Time</label>
                                <input type="datetime-local" id="end" value={end} onChange={e => setEnd(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </div>
                    </div>
                    <footer className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm transition-colors">Cancel</button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Save Appointment</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const Calendar: React.FC<CalendarProps> = ({ isGoogleCalendarConnected, setActivePage, appointments, contacts, onAddAppointment }) => {
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 5)); // Start on a Monday
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handlePrev = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (view === 'week') {
            setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
        } else {
             setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (view === 'week') {
             setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
        } else {
             setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleCellClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleNewAppointmentClick = () => {
        setSelectedDate(new Date());
        setIsModalOpen(true);
    }

    const ConnectionBanner = () => (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg mb-6 flex items-center justify-between shadow-sm">
            <div>
                <h3 className="font-bold">Enhance Your Scheduling</h3>
                <p className="text-sm">Connect your Google Calendar for a seamless two-way sync to manage all your appointments in one place and avoid double-booking.</p>
            </div>
            <button
                onClick={() => setActivePage(Page.Settings)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm flex-shrink-0 ml-4"
            >
                <SettingsIcon className="w-4 h-4" />
                <span>Go to Settings</span>
            </button>
        </div>
    );
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const renderMonthView = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const calendarDays = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-slate-200 bg-slate-50/50"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const appointmentsForDay = appointments.filter(app => 
                app.start.getFullYear() === year &&
                app.start.getMonth() === month &&
                app.start.getDate() === day
            ).sort((a,b) => a.start.getTime() - b.start.getTime());

            calendarDays.push(
                <div key={day} onClick={() => handleCellClick(date)} className="border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col hover:bg-sky-50 transition-colors cursor-pointer">
                    <div className="font-semibold text-sm text-right text-slate-600">{day}</div>
                    <div className="space-y-1 mt-1 flex-grow overflow-y-auto">
                        {appointmentsForDay.map(app => (
                            <div key={app.id} className="bg-primary-200 text-primary-800 rounded px-1.5 py-0.5 text-xs truncate" title={`${app.title} with ${app.contactName}`}>
                                <strong>{app.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong> {app.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <>
                <div className="grid grid-cols-7 text-center text-xs font-bold text-textSecondary uppercase">
                    {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 border-t border-l border-slate-200 flex-grow">
                    {calendarDays}
                </div>
            </>
        )
    };
    
    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const days = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
        const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

        return (
            <div className="flex-grow flex flex-col">
                <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] text-center text-xs font-bold text-textSecondary">
                    <div className="py-2 border-b border-slate-200"></div>
                    {days.map(day => <div key={day.toISOString()} className="py-2 border-b border-l border-slate-200">{day.toLocaleDateString('en-US', { weekday: 'short' })} <span className="text-lg font-bold">{day.getDate()}</span></div>)}
                </div>
                <div className="flex-grow overflow-y-auto">
                     <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] flex-grow">
                        {/* Time column */}
                        <div className="text-right text-xs text-textSecondary pr-2">
                            {hours.map(hour => <div key={hour} className="h-16 flex items-start justify-end -mt-2.5">{hour > 12 ? hour-12 : hour}{hour >= 12 ? 'pm' : 'am'}</div>)}
                        </div>
                        {/* Day columns */}
                        {days.map(day => (
                            <div key={day.toISOString()} className="relative border-l border-slate-200">
                                {hours.map(hour => <div key={hour} className="h-16 border-b border-slate-200" onClick={() => handleCellClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))}></div>)}
                                {appointments.filter(app => app.start.toDateString() === day.toDateString()).map(app => {
                                    const startHour = app.start.getHours() + app.start.getMinutes() / 60;
                                    const endHour = app.end.getHours() + app.end.getMinutes() / 60;
                                    const top = ((startHour - 7) * 4) + 'rem';
                                    const height = ((endHour - startHour) * 4) + 'rem';

                                    return (
                                        <div key={app.id} style={{ top, height }} className="absolute left-1 right-1 bg-primary-200 text-primary-800 p-2 rounded-lg text-xs overflow-hidden cursor-pointer hover:bg-primary-300">
                                            <p className="font-bold">{app.title}</p>
                                            <p>{app.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {app.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    };

    const renderDayView = () => <div className="text-center p-8">Day view is coming soon!</div>;


    const ViewToggle = () => (
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setView('month')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-white shadow text-primary-600' : 'text-textSecondary hover:bg-slate-200'}`}>Month</button>
            <button onClick={() => setView('week')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-white shadow text-primary-600' : 'text-textSecondary hover:bg-slate-200'}`}>Week</button>
            <button onClick={() => setView('day')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'day' ? 'bg-white shadow text-primary-600' : 'text-textSecondary hover:bg-slate-200'}`}>Day</button>
        </div>
    );
    
    return (
        <div className="p-8 h-full flex flex-col">
            {!isGoogleCalendarConnected && <ConnectionBanner />}
            <div className="bg-surface p-6 rounded-xl shadow-sm flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold text-textPrimary">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                         <div className="flex items-center space-x-1">
                            <button onClick={handlePrev} className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Previous">
                                <svg className="w-5 h-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button onClick={handleNext} className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Next">
                                <svg className="w-5 h-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                         <button onClick={handleToday} className="px-3 py-1 border border-slate-300 rounded-md text-sm font-semibold text-textPrimary hover:bg-slate-100 transition-colors">
                            Today
                        </button>
                    </div>
                     <ViewToggle />
                    <button onClick={handleNewAppointmentClick} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        New Appointment
                    </button>
                </div>

                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </div>
             {isModalOpen && (
                <AddAppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onAddAppointment}
                    contacts={contacts}
                    initialDate={selectedDate || undefined}
                />
            )}
        </div>
    );
};

export default Calendar;