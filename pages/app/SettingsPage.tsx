
import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
      <h1 className="text-3xl font-bold mb-4 text-card-foreground">Settings</h1>
      <p className="text-muted-foreground">
        Manage your application settings here. More options coming soon!
      </p>
    </div>
  );
};

export default SettingsPage;
