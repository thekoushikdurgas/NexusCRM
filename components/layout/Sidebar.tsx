
import React, { useState } from 'react';
import { DashboardIcon, ContactsIcon, UsersIcon, PlansIcon, LogoIcon, SearchIcon, SettingsIcon, MoonIcon, SunIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon, HistoryIcon, OrdersIcon } from '../icons/IconComponents';
import { View } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View, payload?: any) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => (
  <li title={isCollapsed ? label : undefined}>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 group ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6 flex-shrink-0' })}
      <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
        {label}
      </span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setOpen, isCollapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleNavigation = (view: View, payload?: any) => {
        setActiveView(view, payload);
        if (window.innerWidth < 768) {
          setOpen(false); // Close sidebar on mobile after navigation
        }
        setUserMenuOpen(false);
    };

    const navItems: { view: View; icon: React.ReactElement; label: string }[] = [
        { view: 'Dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { view: 'Contacts', icon: <ContactsIcon />, label: 'Contacts' },
        { view: 'Orders', icon: <OrdersIcon />, label: 'Orders' },
        { view: 'History', icon: <HistoryIcon />, label: 'History' },
        { view: 'Plans', icon: <PlansIcon />, label: 'Plans' },
        { view: 'Settings', icon: <SettingsIcon />, label: 'Settings' },
    ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full bg-card border-r border-border flex flex-col z-40 transition-transform md:transition-width duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        <div className={`flex items-center h-20 px-4 border-b border-border flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <LogoIcon className="w-10 h-10 text-primary-500 flex-shrink-0"/>
          <h1 className={`text-2xl font-bold ml-2 text-foreground whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
            Nexus
          </h1>
        </div>
        
        <div className={`p-4 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className={`w-full pl-10 pr-4 py-2 border bg-background border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0 md:invisible' : 'opacity-100'}`}
              />
            </div>
        </div>

        <nav className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <ul>
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                isActive={activeView === item.view}
                onClick={() => handleNavigation(item.view)}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-border flex-shrink-0">
            <div className="relative">
                {userMenuOpen && (
                    <div className={`absolute bottom-full left-0 right-0 mb-2 bg-popover rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-1 ${isCollapsed ? 'w-48' : ''}`}>
                        <button onClick={() => handleNavigation('Settings', 'Profile')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-popover-foreground hover:bg-secondary">
                            <UsersIcon className="w-5 h-5"/> Profile
                        </button>
                        <button onClick={toggleTheme} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-popover-foreground hover:bg-secondary">
                          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <hr className="my-1 border-border" />
                        <button onClick={logout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-popover-foreground hover:bg-secondary">
                            <LogoutIcon className="w-5 h-5"/> Sign Out
                        </button>
                    </div>
                )}
                <div 
                    className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-secondary ${isCollapsed ? 'justify-center' : ''}`}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                    <img
                        src={user?.avatarUrl || "https://picsum.photos/seed/user1/40/40"}
                        alt="User avatar"
                        className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className={`ml-3 w-full overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
                        <p className="font-semibold text-sm text-foreground truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                    </div>
                </div>
            </div>
             <button onClick={() => setCollapsed(!isCollapsed)} className="hidden md:flex items-center justify-center w-full mt-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;