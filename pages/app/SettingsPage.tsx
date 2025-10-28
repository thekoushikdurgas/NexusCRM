import React, { useState } from 'react';
import { SettingsTab, View } from '../../types';
import ProfilePage from './ProfilePage';
import UsersPage from './Users';
import { IdentificationIcon, PaintBrushIcon, CreditCardIcon, UsersIcon, ShieldCheckIcon, BellIcon } from '../../components/icons/IconComponents';
import AppearanceSettings from './settings/AppearanceSettings';
import BillingSettings from './settings/BillingSettings';
import SecuritySettings from './settings/SecuritySettings';
import NotificationsSettings from './settings/NotificationsSettings';


interface SettingsPageProps {
  initialTab: SettingsTab | null;
  setActiveView: (view: View, payload?: any) => void;
}

const settingsTabs: { id: SettingsTab; label: string; icon: React.ReactElement<{ className?: string }> }[] = [
  { id: 'Profile', label: 'Profile', icon: <IdentificationIcon /> },
  { id: 'Appearance', label: 'Appearance', icon: <PaintBrushIcon /> },
  { id: 'Security', label: 'Security', icon: <ShieldCheckIcon /> },
  { id: 'Notifications', label: 'Notifications', icon: <BellIcon /> },
  { id: 'Billing', label: 'Billing', icon: <CreditCardIcon /> },
  { id: 'Team', label: 'Team', icon: <UsersIcon /> },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ initialTab, setActiveView }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'Profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfilePage />;
      case 'Appearance':
        return <AppearanceSettings />;
      case 'Security':
        return <SecuritySettings />;
      case 'Notifications':
        return <NotificationsSettings />;
      case 'Billing':
        return <BillingSettings setActiveView={setActiveView} />;
      case 'Team':
        return <UsersPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        
        <div className="border-b border-border">
            <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                {settingsTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-1 py-3 text-sm font-medium border-b-2 whitespace-nowrap group ${
                            activeTab === tab.id
                            ? 'border-primary text-primary font-semibold'
                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        {React.cloneElement(tab.icon, { className: 'w-5 h-5 mr-2 flex-shrink-0' })}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border min-h-[400px]">
            {renderContent()}
        </div>
    </div>
  );
};

export default SettingsPage;
