import React, { useState } from 'react';
import { SearchIcon, BellIcon, MenuIcon, ChevronDownIcon, SunIcon, MoonIcon } from './icons/IconComponents';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between h-20 bg-card text-card-foreground border-b border-border shadow-sm px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center flex-1">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground mr-2 md:hidden">
            <MenuIcon />
        </button>
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border bg-secondary border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button onClick={toggleTheme} className="p-2 text-muted-foreground rounded-full hover:bg-secondary hover:text-primary-500">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="p-2 text-muted-foreground rounded-full hover:bg-secondary hover:text-primary-500">
          <BellIcon />
        </button>
        <div className="relative">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img
                src={user?.avatarUrl || "https://picsum.photos/seed/user1/40/40"}
                alt="User avatar"
                className="w-10 h-10 rounded-full"
            />
            <div className="hidden sm:block">
                <p className="font-semibold">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.role || 'Member'}</p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-muted-foreground hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
            </div>
            {dropdownOpen && (
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary" role="menuitem">Profile</a>
                        <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary" role="menuitem">Settings</a>
                        <button 
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-popover-foreground hover:bg-secondary" role="menuitem"
                        >
                          Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
