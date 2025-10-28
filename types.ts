
export type View = 'Dashboard' | 'Contacts' | 'Plans' | 'Profile' | 'Settings';
export type AuthView = 'welcome' | 'login' | 'register';

export interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: 'Lead' | 'Customer' | 'Archived';
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Member';
  lastLogin: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface Plan {
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
}

export interface ChartData {
  name: string;
  value: number;
}
