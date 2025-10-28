


import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/app/Dashboard';
import Contacts from './pages/app/Contacts';
import Plans from './pages/app/Plans';
import SettingsPage from './pages/app/SettingsPage';
import HistoryPage from './pages/app/HistoryPage';
import OrdersPage from './pages/app/OrdersPage';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import WelcomePage from './pages/auth/WelcomePage';
import { MenuIcon } from './components/icons/IconComponents';
import { View, AuthView, SettingsTab } from './types';
import LoadingPage from './pages/LoadingPage';

const App: React.FC = () => {
  const { user, isLoading, isLoggingOut } = useAuth();
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [viewPayload, setViewPayload] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('welcome');

  useEffect(() => {
    if (!user) {
      // When user logs out or session expires, reset to the welcome screen.
      setAuthView('welcome');
    }
  }, [user]);

  // While the AuthProvider performs its initial check for a user session,
  // or when logging out, we display a loading page. This prevents a flicker
  // and ensures a smooth login/logout experience.
  if (isLoading || isLoggingOut) {
    return <LoadingPage />;
  }
  
  const handleNavigation = (view: View, payload: any = null) => {
    setActiveView(view);
    setViewPayload(payload);
  };

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
      case 'Orders':
        return <OrdersPage />;
      case 'Plans':
        return <Plans />;
      case 'Settings':
        return <SettingsPage initialTab={viewPayload as SettingsTab | null} setActiveView={handleNavigation} />;
      case 'History':
        return <HistoryPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary text-foreground overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={handleNavigation}
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