


import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/app/Dashboard';
import Contacts from './pages/app/Contacts';
import Users from './pages/app/Users';
import Plans from './pages/app/Plans';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import WelcomePage from './pages/auth/WelcomePage';
import { LogoIcon, MenuIcon } from './components/icons/IconComponents';
import { View, AuthView } from './types';
import LoadingPage from './pages/LoadingPage';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('welcome');

  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!user) {
    switch (authView) {
      case 'login':
        return <LoginPage setAuthView={setAuthView} />;
      case 'register':
        return <RegisterPage setAuthView={setAuthView} />;
      default:
        return <WelcomePage setAuthView={setAuthView} />;
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Contacts':
        return <Contacts />;
      case 'Users':
        return <Users />;
      case 'Plans':
        return <Plans />;
      case 'Profile':
        return <ProfilePage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary text-foreground overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground mb-4 p-2 rounded-md hover:bg-muted">
              <MenuIcon />
          </button>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;