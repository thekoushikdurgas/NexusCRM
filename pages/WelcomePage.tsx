import React from 'react';
import { LogoIcon } from '../components/icons/IconComponents';
// FIX: AuthView is exported from types.ts, not App.tsx
import { AuthView } from '../types';

interface WelcomePageProps {
  setAuthView: (view: AuthView) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ setAuthView }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-2xl">
        <div className="inline-block p-4 mb-6 bg-card rounded-full shadow-lg border border-border">
          <LogoIcon className="w-20 h-20 text-primary-500" />
        </div>
        <h1 className="text-5xl font-extrabold text-foreground sm:text-6xl">
          Your Nexus for Client Relationships
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Streamline your contact management, track interactions, and grow your business with NexusCRM. All your contacts, in one organized place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-y-4 gap-x-6">
          <button
            onClick={() => setAuthView('register')}
            className="rounded-md bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-transform transform hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={() => setAuthView('login')}
            className="text-lg font-semibold leading-6 text-foreground hover:text-primary-500 transition-colors"
          >
            Sign In <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <footer className="absolute bottom-0 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NexusCRM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;