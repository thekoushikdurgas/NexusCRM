import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';

const NotificationsSettings: React.FC = () => {
    const { user, refreshUserProfile } = useAuth();
    const [prefs, setPrefs] = useState(user?.notifications || { weeklyReports: true, newLeadAlerts: true });
    const [isSaving, setIsSaving] = useState(false);
    
    const handleToggle = (key: 'weeklyReports' | 'newLeadAlerts') => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ notifications: prefs })
            .eq('id', user.id);
    
        if (error) {
            alert('Failed to save notification settings.');
        } else {
            await refreshUserProfile();
            alert('Settings saved!');
        }
        setIsSaving(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-card-foreground mb-6">Notifications</h2>
            <p className="text-muted-foreground mb-6">
                Manage how you receive notifications from NexusCRM.
            </p>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary">
                    <div>
                        <p className="font-medium text-card-foreground">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive a summary of your contact activity every week.</p>
                    </div>
                    <button onClick={() => handleToggle('weeklyReports')} className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.weeklyReports ? 'bg-primary' : 'bg-muted'}`}>
                        <span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${prefs.weeklyReports ? 'translate-x-6' : 'translate-x-0'}`}/>
                    </button>
                </div>
                 <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary">
                    <div>
                        <p className="font-medium text-card-foreground">New Lead Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified immediately when a new lead is added.</p>
                    </div>
                    <button onClick={() => handleToggle('newLeadAlerts')} className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.newLeadAlerts ? 'bg-primary' : 'bg-muted'}`}>
                        <span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${prefs.newLeadAlerts ? 'translate-x-6' : 'translate-x-0'}`}/>
                    </button>
                </div>
            </div>
             <div className="mt-6 text-right">
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

export default NotificationsSettings;
