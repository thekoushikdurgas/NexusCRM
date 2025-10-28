
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { User } from '../../types';

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const roleClasses = {
    Admin: "bg-red-400/20 text-red-500",
    Manager: "bg-purple-400/20 text-purple-500",
    Member: "bg-blue-400/20 text-blue-500",
  };
  return <span className={`${baseClasses} ${roleClasses[role]}`}>{role}</span>;
};

const ProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    let avatarUrl = user.avatarUrl;

    if (avatarFile) {
        setIsUploading(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            alert(`Error uploading avatar: ${uploadError.message}`);
            setIsUploading(false);
            setIsUpdatingProfile(false);
            return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
        setIsUploading(false);
    }
    
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, avatar_url: avatarUrl })
        .eq('id', user.id);

    if (profileError) {
        alert(`Error updating profile: ${profileError.message}`);
    } else {
        await refreshUserProfile();
        alert('Profile updated successfully!');
    }
    setIsUpdatingProfile(false);
  };
  
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


  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <div className="bg-card p-6 rounded-lg shadow-md border border-border text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img src={avatarPreview || user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                Change
              </label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <RoleBadge role={user.role} />
            </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleProfileUpdate} className="bg-card p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Personal Information</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border bg-background border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 mt-1 border bg-secondary border-border rounded-md shadow-sm text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" disabled={isUpdatingProfile} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {isUploading ? 'Uploading...' : isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="bg-card p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="new-password"className="text-sm font-medium text-muted-foreground">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border bg-background border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                            className="w-full px-3 py-2 mt-1 border bg-background border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" disabled={isUpdatingPassword} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
