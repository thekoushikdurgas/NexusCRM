
import { Plan, ChartData, Contact } from '../types';

// FIX: Export MOCK_CONTACTS to be used in Dashboard.tsx
export const MOCK_CONTACTS: Contact[] = [
  { id: 1, name: 'John Doe', email: 'john.d@example.com', company: 'Example Corp', phone: '123-456-7890', status: 'Customer', avatarUrl: 'https://picsum.photos/seed/1/40/40' },
  { id: 2, name: 'Jane Smith', email: 'jane.s@example.com', company: 'Innovate LLC', phone: '234-567-8901', status: 'Lead', avatarUrl: 'https://picsum.photos/seed/2/40/40' },
  { id: 3, name: 'Sam Wilson', email: 'sam.w@example.com', company: 'Tech Solutions', phone: '345-678-9012', status: 'Customer', avatarUrl: 'https://picsum.photos/seed/3/40/40' },
  { id: 4, name: 'Alice Johnson', email: 'alice.j@example.com', company: 'Creative Minds', phone: '456-789-0123', status: 'Lead', avatarUrl: 'https://picsum.photos/seed/4/40/40' },
  { id: 5, name: 'Bob Brown', email: 'bob.b@example.com', company: 'Data Systems', phone: '567-890-1234', status: 'Archived', avatarUrl: 'https://picsum.photos/seed/5/40/40' },
];

export const MOCK_PLANS: Plan[] = [
  { name: 'Starter', price: '$49/mo', features: ['1,000 Contacts', 'Basic Analytics', 'Email Support'], isCurrent: false },
  { name: 'Professional', price: '$99/mo', features: ['5,000 Contacts', 'Advanced Analytics', 'User Management', 'Priority Support'], isCurrent: true },
  { name: 'Enterprise', price: 'Custom', features: ['Unlimited Contacts', 'Full Analytics Suite', 'Dedicated Account Manager', 'API Access'], isCurrent: false },
];

export const CONTACT_GROWTH_DATA: ChartData[] = [
  { name: 'Jan', value: 200 }, { name: 'Feb', value: 240 }, { name: 'Mar', value: 290 },
  { name: 'Apr', value: 350 }, { name: 'May', value: 410 }, { name: 'Jun', value: 480 },
];

export const SUBSCRIPTION_TIER_DATA: ChartData[] = [
  { name: 'Starter', value: 45 }, { name: 'Professional', value: 35 }, { name: 'Enterprise', value: 20 },
];
