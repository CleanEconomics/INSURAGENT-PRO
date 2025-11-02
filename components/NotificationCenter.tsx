import React from 'react';
import { LeadsIcon, CalendarIcon, BellIcon } from './icons';

const notifications = [
    { id: 1, type: 'lead', text: "New lead assigned: Emily White", time: "2m ago", read: false },
    { id: 2, type: 'appointment', text: "Appointment confirmed with Samantha Blue", time: "3h ago", read: false },
    { id: 3, type: 'task', text: "Task due today: Prepare quote for Maria Garcia", time: "8h ago", read: false },
    { id: 4, type: 'lead', text: "Lead 'David Lee' changed status to Quoted", time: "yesterday", read: true },
    { id: 5, type: 'system', text: "Your weekly performance summary is ready.", time: "2 days ago", read: true },
];

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    const icons = {
        lead: <LeadsIcon className="w-5 h-5 text-blue-500" />,
        appointment: <CalendarIcon className="w-5 h-5 text-green-500" />,
        task: <BellIcon className="w-5 h-5 text-amber-500" />,
        system: <BellIcon className="w-5 h-5 text-slate-500" />,
    };
    return <div className="flex-shrink-0 bg-slate-100 rounded-full p-2">{icons[type as keyof typeof icons] || icons.system}</div>
}

const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-xl shadow-2xl border border-slate-200 z-50">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-textPrimary">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                    <div key={notif.id} className={`flex items-start space-x-3 p-4 hover:bg-slate-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                        <NotificationIcon type={notif.type} />
                        <div className="flex-grow">
                            <p className="text-sm text-textPrimary">{notif.text}</p>
                            <p className="text-xs text-textSecondary mt-1">{notif.time}</p>
                        </div>
                         {!notif.read && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1 flex-shrink-0"></div>}
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-slate-200 text-center">
                <button className="text-sm font-semibold text-primary-600 hover:text-primary-800">
                    View All Notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationCenter;
