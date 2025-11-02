import React, { useState } from 'react';
import { TwilioIcon, MailchimpIcon } from './icons';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

interface SettingsProps {
    isGoogleCalendarConnected: boolean;
    onConnectGoogleCalendar: () => Promise<void>;
    onDisconnectGoogleCalendar: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isGoogleCalendarConnected, onConnectGoogleCalendar, onDisconnectGoogleCalendar }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const tabs = ['Profile', 'Notifications', 'Integrations', 'Billing', 'Team'];

  const TabButton: React.FC<{ label: string }> = ({ label }) => (
    <button
      onClick={() => setActiveTab(label)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === label
          ? 'bg-primary-600 text-white'
          : 'text-textSecondary hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  const ProfileSettings = () => (
    <div className="bg-surface p-8 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-textPrimary">Profile Settings</h2>
      <p className="text-sm text-textSecondary mt-1">Manage your personal information and password.</p>
      
      <div className="mt-8 space-y-8">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6">
          <img src="https://picsum.photos/seed/agent/100/100" alt="User Avatar" className="w-20 h-20 rounded-full" />
          <div>
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
              Upload New Picture
            </button>
            <p className="text-xs text-textSecondary mt-2">PNG, JPG, GIF up to 10MB.</p>
          </div>
        </div>
        
        <hr className="border-slate-200" />

        {/* Personal Information Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-textPrimary">Full Name</label>
              <input type="text" id="fullName" defaultValue="Jane Doe" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textPrimary">Email Address</label>
              <input type="email" id="email" defaultValue="jane.doe@insuragent.pro" readOnly className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-500 cursor-not-allowed" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-textPrimary">Phone Number</label>
              <input type="tel" id="phone" defaultValue="(555) 123-4567" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
          </div>
        </form>

        <hr className="border-slate-200" />
        
        {/* Password Change Form */}
        <div>
            <h3 className="text-lg font-semibold text-textPrimary">Change Password</h3>
            <form className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-textPrimary">New Password</label>
                        <input type="password" id="newPassword" placeholder="••••••••" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-textPrimary">Confirm New Password</label>
                        <input type="password" id="confirmPassword" placeholder="••••••••" className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                </div>
            </form>
        </div>

      </div>

       <div className="mt-10 flex justify-end">
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Save Changes
            </button>
        </div>
    </div>
  );

  const IntegrationSettings = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [driveConnected, setDriveConnected] = useState(false);
    const [twilioConnected, setTwilioConnected] = useState(false);
    const [mailchimpConnected, setMailchimpConnected] = useState(false);


    const handleConnect = async () => {
        setIsConnecting(true);
        await onConnectGoogleCalendar();
        setIsConnecting(false);
    };

    const handleDisconnect = () => {
        onDisconnectGoogleCalendar();
    };
    
    return (
        <div className="bg-surface p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-textPrimary">Integrations</h2>
            <p className="text-sm text-textSecondary mt-1">Connect your favorite apps to streamline your workflow.</p>
            
            <div className="mt-8 space-y-6">
                <div className="border border-slate-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <GoogleIcon className="w-10 h-10" />
                        <div>
                            <h3 className="font-bold text-textPrimary">Google Calendar</h3>
                            <p className="text-sm text-textSecondary">Sync your calendar for 2-way appointment scheduling. Events created here will appear in your Google Calendar, and vice-versa.</p>
                        </div>
                    </div>
                    {isGoogleCalendarConnected ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Connected</span>
                             <button onClick={handleDisconnect} className="bg-slate-200 hover:bg-slate-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                         <button 
                            onClick={handleConnect} 
                            disabled={isConnecting}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center w-36"
                          >
                            {isConnecting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <span>Connect</span>
                            )}
                        </button>
                    )}
                </div>

                <div className="border border-slate-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <GoogleIcon className="w-10 h-10" />
                        <div>
                            <h3 className="font-bold text-textPrimary">Google Drive</h3>
                            <p className="text-sm text-textSecondary">Access and store training materials and documents.</p>
                        </div>
                    </div>
                    {driveConnected ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Connected</span>
                             <button onClick={() => setDriveConnected(false)} className="bg-slate-200 hover:bg-slate-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                         <button onClick={() => setDriveConnected(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                            Connect
                        </button>
                    )}
                </div>

                <div className="border border-slate-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <TwilioIcon className="w-10 h-10" />
                        <div>
                            <h3 className="font-bold text-textPrimary">Twilio</h3>
                            <p className="text-sm text-textSecondary">Connect your Twilio account for integrated SMS texting and voice capabilities.</p>
                        </div>
                    </div>
                    {twilioConnected ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Connected</span>
                             <button onClick={() => setTwilioConnected(false)} className="bg-slate-200 hover:bg-slate-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                         <button onClick={() => setTwilioConnected(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                            Connect
                        </button>
                    )}
                </div>

                <div className="border border-slate-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <MailchimpIcon className="w-10 h-10 text-textPrimary" />
                        <div>
                            <h3 className="font-bold text-textPrimary">Mailchimp</h3>
                            <p className="text-sm text-textSecondary">Sync contact lists and manage mass email campaigns directly.</p>
                        </div>
                    </div>
                    {mailchimpConnected ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Connected</span>
                             <button onClick={() => setMailchimpConnected(false)} className="bg-slate-200 hover:bg-slate-300 text-textPrimary font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                         <button onClick={() => setMailchimpConnected(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                            Connect
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Settings</h1>
          <p className="text-textSecondary mt-1">Manage your workspace and personal preferences.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {tabs.map(tab => (
          <TabButton key={tab} label={tab} />
        ))}
      </div>

      <div>
        {activeTab === 'Profile' && <ProfileSettings />}
        {activeTab === 'Integrations' && <IntegrationSettings />}
        {activeTab !== 'Profile' && activeTab !== 'Integrations' && <div className="bg-surface p-8 rounded-xl shadow-sm"><p>The '{activeTab}' settings are coming soon.</p></div>}
      </div>
    </div>
  );
};

export default Settings;