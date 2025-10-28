import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';

const SecuritySettings: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
        }
        if (password.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
        }
        
        setIsUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password });
        
        if (error) {
          alert(`Error updating password: ${error.message}`);
        } else {
          alert("Password updated successfully.");
          setPassword('');
          setConfirmPassword('');
        }
        setIsUpdatingPassword(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-card-foreground mb-6">Security</h2>
            <div className="space-y-8">
                <form onSubmit={handlePasswordUpdate}>
                    <h3 className="text-xl font-semibold mb-4 text-card-foreground">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="new-password"className="text-sm font-medium text-muted-foreground">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full max-w-sm px-3 py-2 mt-1 border bg-background border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="6+ characters"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password"className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full max-w-sm px-3 py-2 mt-1 border bg-background border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button type="submit" disabled={isUpdatingPassword} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>

                <div>
                     <h3 className="text-xl font-semibold mb-4 text-card-foreground">Two-Factor Authentication (2FA)</h3>
                     <div className="p-4 border border-border rounded-lg bg-secondary flex items-center justify-between">
                        <div>
                            <p className="font-medium text-card-foreground">2FA is currently disabled.</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                        </div>
                        <button className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                            Enable 2FA
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
