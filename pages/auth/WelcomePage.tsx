import React from 'react';
import { LogoIcon, ContactsIcon, UsersIcon, DashboardIcon, UploadIcon, ShieldCheckIcon, PlansIcon, ArrowRightIcon } from '../../components/icons/IconComponents';
import { AuthView } from '../../types';

interface WelcomePageProps {
  setAuthView: (view: AuthView) => void;
}

// Header Component
const WelcomeHeader: React.FC<WelcomePageProps> = ({ setAuthView }) => (
  <header className="absolute top-0 left-0 right-0 z-20">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <LogoIcon className="w-10 h-10 text-primary-500" />
        <span className="ml-3 text-2xl font-bold text-foreground">Appointment360</span>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={() => setAuthView('login')}
          className="font-medium text-foreground hover:text-primary-500 transition-colors px-4 py-2 rounded-lg"
        >
          Login
        </button>
        <button
          onClick={() => setAuthView('register')}
          className="px-5 py-2 text-md font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
    </nav>
  </header>
);

// FIX: Changed icon type from React.ReactNode to React.ReactElement for proper prop typing with cloneElement.
// FIX: Specify props for React.ReactElement to allow cloning with className.
const FeatureCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border text-center transform transition-transform duration-300 hover:-translate-y-2 flex flex-col items-center">
    <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-lg">
      {React.cloneElement(icon, { className: 'w-8 h-8 text-primary-500' })}
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const WelcomePage: React.FC<WelcomePageProps> = ({ setAuthView }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      <WelcomeHeader setAuthView={setAuthView} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 pt-32 pb-16">
        <section className="text-center max-w-4xl">
          <h1 className="text-5xl font-extrabold text-foreground sm:text-6xl md:text-7xl !leading-tight">
            Your All-in-One <span className="text-primary-500">Appointment & Contact</span> Hub
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Organize contacts, manage appointments, and grow your business with Appointment360.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-y-4 gap-x-6">
            <button
              onClick={() => setAuthView('register')}
              className="rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => setAuthView('login')}
              className="group flex items-center gap-2 text-lg font-semibold leading-6 text-foreground hover:text-primary-500 transition-colors"
            >
              Sign In <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        <section id="features" className="w-full max-w-6xl mx-auto mt-24 sm:mt-32">
          <div className="text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-2">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Streamline Your Workflow</h2>
             <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Everything you need in a modern, integrated platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ContactsIcon />}
              title="Contact Management"
              description="Store and organize all your contacts in one place with advanced filtering and search capabilities."
            />
            <FeatureCard
              icon={<UploadIcon />}
              title="Bulk Import"
              description="Import thousands of contacts via CSV with automatic data mapping and validation."
            />
             <FeatureCard
              icon={<UsersIcon />}
              title="User Management"
              description="Manage multiple users with role-based access control and detailed permissions."
            />
            <FeatureCard
              icon={<PlansIcon />}
              title="Flexible Plans"
              description="Choose from multiple subscription plans tailored to your business needs."
            />
            <FeatureCard
              icon={<DashboardIcon />}
              title="Analytics Dashboard"
              description="Track your contact growth and manage your business with detailed analytics."
            />
            <FeatureCard
              icon={<ShieldCheckIcon />}
              title="Secure & Reliable"
              description="Your data is protected with enterprise-grade security and regular backups."
            />
          </div>
        </section>
      </main>
      
      <footer className="w-full py-6 text-center text-muted-foreground z-10 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>&copy; {new Date().getFullYear()} Appointment360. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
                <a href="#" className="hover:underline underline-offset-4">Terms of Service</a>
                <a href="#" className="hover:underline underline-offset-4">Privacy</a>
            </nav>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;