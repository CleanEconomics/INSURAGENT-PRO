

import React from 'react';
import { Page } from '../types';
import { 
    DashboardIcon, LeadsIcon, PipelineIcon, ContactsIcon, CalendarIcon, SettingsIcon, 
    AiSparkleIcon, RecruitingIcon, CommissionsIcon, MarketingIcon, AnalyticsIcon, ServiceIcon, 
    TrainingIcon, TrophyIcon, UsersIcon, BookOpenIcon, AiAgentsIcon, TasksIcon, EmailIcon
} from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
      isActive
        ? 'bg-primary-100 text-primary-700 font-semibold'
        : 'text-textSecondary hover:bg-slate-100 hover:text-textPrimary'
    } ${isCollapsed ? 'justify-center' : ''}`}
  >
    {icon}
    <span className={`text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{label}</span>
     {!isCollapsed && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-primary-800 text-white text-xs invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 hidden lg:block">
          {label}
        </div>
      )}
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const coreNavItems = [
    { id: Page.Dashboard, icon: <DashboardIcon className="w-5 h-5" />, label: 'Dashboard' },
    { id: Page.Leads, icon: <LeadsIcon className="w-5 h-5" />, label: 'Leads' },
    { id: Page.Pipeline, icon: <PipelineIcon className="w-5 h-5" />, label: 'Pipeline' },
    { id: Page.Contacts, icon: <ContactsIcon className="w-5 h-5" />, label: 'Contacts' },
    { id: Page.Team, icon: <UsersIcon className="w-5 h-5" />, label: 'Team' },
    { id: Page.Recruiting, icon: <RecruitingIcon className="w-5 h-5" />, label: 'Recruiting' },
    { id: Page.Commissions, icon: <CommissionsIcon className="w-5 h-5" />, label: 'Commissions' },
    { id: Page.Leaderboard, icon: <TrophyIcon className="w-5 h-5" />, label: 'Leaderboard' },
  ];

  const toolsNavItems = [
    { id: Page.Inbox, icon: <EmailIcon className="w-5 h-5" />, label: 'Email Inbox' },
    { id: Page.Calendar, icon: <CalendarIcon className="w-5 h-5" />, label: 'Calendar' },
    { id: Page.Tasks, icon: <TasksIcon className="w-5 h-5" />, label: 'Tasks' },
    { id: Page.AiAgents, icon: <AiAgentsIcon className="w-5 h-5" />, label: 'AI Agents' },
  ];
  
  const growthNavItems = [
    { id: Page.Marketing, icon: <MarketingIcon className="w-5 h-5" />, label: 'Marketing' },
    { id: Page.Training, icon: <TrainingIcon className="w-5 h-5" />, label: 'Training' },
    { id: Page.KnowledgeHub, icon: <BookOpenIcon className="w-5 h-5" />, label: 'Knowledge Hub' },
    { id: Page.Analytics, icon: <AnalyticsIcon className="w-5 h-5" />, label: 'Analytics' },
    { id: Page.Service, icon: <ServiceIcon className="w-5 h-5" />, label: 'Service Desk' },
  ];

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const NavGroup: React.FC<{title: string, items: typeof coreNavItems}> = ({title, items}) => (
    <>
      <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{title}</p>
        <ul className="space-y-1">
          {items.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.id}
              isCollapsed={isCollapsed}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </ul>
    </>
  )

  return (
    <>
    {/* Mobile Overlay */}
    <div className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

    <aside className={`bg-surface h-screen flex flex-col p-4 border-r border-slate-200 fixed top-0 left-0 transition-all duration-300 z-40 
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center space-x-2 overflow-hidden`}>
            <div className="bg-primary-600 p-2 rounded-lg flex-shrink-0">
                <AiSparkleIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-xl font-bold text-primary-800 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>InsurAgent Pro</h1>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-slate-100 hidden lg:block">
            <svg className="w-6 h-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isCollapsed ? "M4 6h16M4 12h16M4 18h7" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
        </button>
      </div>


      <nav className="flex-grow overflow-y-auto -mr-4 pr-4">
        <NavGroup title="Core" items={coreNavItems} />
        <div className="mt-4"><NavGroup title="Tools" items={toolsNavItems} /></div>
        <div className="mt-4"><NavGroup title="Growth" items={growthNavItems} /></div>
      </nav>

      <div className="border-t border-slate-200 -mx-4 mt-4 pt-4 px-4">
         <NavItem
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Settings"
            isActive={activePage === Page.Settings}
            isCollapsed={isCollapsed}
            onClick={() => handleNavClick(Page.Settings)}
          />
        <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 mt-2 ${isCollapsed ? 'justify-center' : ''}`}>
           <img src="https://picsum.photos/seed/agent/40/40" alt="User Avatar" className="w-10 h-10 rounded-full flex-shrink-0" />
           <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                <p className="font-semibold text-sm text-textPrimary whitespace-nowrap">Jane Doe</p>
                <p className="text-xs text-textSecondary whitespace-nowrap">Agent/Producer</p>
           </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;