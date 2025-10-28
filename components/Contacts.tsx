import React, { useState, useMemo, useEffect } from 'react';
import { Contact } from '../types';
import { SearchIcon } from './icons/IconComponents';
// FIX: supabase should be imported from the services directory, not from AuthContext.
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

const StatusBadge: React.FC<{ status: Contact['status'] }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const statusClasses = {
    Lead: "bg-yellow-400/20 text-yellow-500",
    Customer: "bg-green-400/20 text-green-500",
    Archived: "bg-gray-400/20 text-gray-500",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const Contacts: React.FC = () => {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Contact['status'] | 'All'>('All');
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching contacts:", error.message);
      } else if (data) {
        const formattedContacts = data.map(c => ({
            ...c,
            avatarUrl: c.avatar_url
        }));
        setAllContacts(formattedContacts);
      }
      setIsLoading(false);
    };

    fetchContacts();
  }, [user]);

  const filteredContacts = useMemo(() => {
    return allContacts.filter(contact => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = statusFilter === 'All' || contact.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, statusFilter, allContacts]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Here you would typically process the CSV file
      alert(`File "${file.name}" selected. Import via Supabase Storage not yet implemented.`);
    }
  };

  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
      <h1 className="text-3xl font-bold mb-6 text-card-foreground">Contacts</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </span>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border bg-background border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Contact['status'] | 'All')}
            className="border bg-background border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Customer">Customer</option>
            <option value="Archived">Archived</option>
          </select>
          <label htmlFor="csv-upload" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
            Import
          </label>
          <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground">Name</th>
              <th className="p-4 font-semibold text-muted-foreground hidden lg:table-cell">Company</th>
              <th className="p-4 font-semibold text-muted-foreground hidden sm:table-cell">Phone</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredContacts.map(contact => (
              <tr key={contact.id} className="border-b border-border hover:bg-secondary">
                <td className="p-4 flex items-center">
                  <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold text-card-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground break-all">{contact.email}</p>
                  </div>
                </td>
                <td className="p-4 text-card-foreground hidden lg:table-cell">{contact.company}</td>
                <td className="p-4 text-card-foreground hidden sm:table-cell">{contact.phone}</td>
                <td className="p-4">
                  <StatusBadge status={contact.status} />
                </td>
                <td className="p-4">
                  <button className="text-primary-500 hover:underline font-medium whitespace-nowrap">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      )}
      {!isLoading && filteredContacts.length === 0 && (
        <div className="text-center py-10">
            <p className="text-muted-foreground">No contacts found.</p>
        </div>
      )}
    </div>
  );
};

export default Contacts;