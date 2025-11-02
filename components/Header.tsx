

import React, { useState } from 'react';
import { Page } from '../types';
import { BellIcon, ChevronDownIcon, CommandIcon, PlusCircleIcon, MenuIcon } from './icons';
import NotificationCenter from './NotificationCenter';
import QuickCreateModal from './QuickCreateModal';

interface HeaderProps {
  activePage: Page;
  sidebarCollapsed: boolean;
  onToggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onToggleMobileMenu }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <>
      <header className="bg-surface p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
            <button onClick={onToggleMobileMenu} className="p-2 rounded-full hover:bg-slate-100 lg:hidden" aria-label="Open menu">
                <MenuIcon className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-textPrimary">{activePage}</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-6">
          <div className="relative hidden md:block">
            <div className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border border-slate-300 flex items-center space-x-2 text-textSecondary w-64">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search...</span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-xs font-semibold">
                    <CommandIcon className="w-4 h-4" />
                    <span>K</span>
                </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsQuickCreateOpen(true)} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors">
                <PlusCircleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Quick Create</span>
            </button>
            
            <div className="relative">
                <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-100 cursor-pointer relative">
                    <BellIcon className="w-6 h-6 text-textSecondary" />
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-surface" />
                </button>
                {isNotificationsOpen && <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />}
            </div>

            <div className="hidden sm:flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-100">
              <img src="https://picsum.photos/seed/agent/40/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
              <div className="hidden lg:block">
                  <p className="font-semibold text-sm text-textPrimary">Jane Doe</p>
                  <p className="text-xs text-textSecondary">Agent/Producer</p>
              </div>
              <ChevronDownIcon className="w-5 h-5 text-textSecondary hidden lg:block" />
            </div>
          </div>
        </div>
      </header>
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
    </>
  );
};

export default Header;