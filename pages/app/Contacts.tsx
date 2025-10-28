
import React, { useState, useMemo, useEffect } from 'react';
import { Contact } from '../../types';
import { SearchIcon, XMarkIcon, GlobeAltIcon, LinkedInIcon, FacebookIcon, TwitterIcon, OfficeBuildingIcon, TagIcon, ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '../../components/icons/IconComponents';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';

type SortableColumn = 'name' | 'company' | 'title' | 'status' | 'emailStatus' | 'city' | 'state' | 'country' | 'industry' | 'phone' | 'website';
type SortDirection = 'asc' | 'desc';


const StatusBadge: React.FC<{ status: Contact['status'] }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block whitespace-nowrap";
  const statusClasses = {
    Lead: "bg-yellow-400/20 text-yellow-500",
    Customer: "bg-green-400/20 text-green-500",
    Archived: "bg-gray-400/20 text-gray-500",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const EmailStatusBadge: React.FC<{ status: string | undefined }> = ({ status }) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block whitespace-nowrap";
    const statusClasses: { [key: string]: string } = {
      Verified: "bg-green-400/20 text-green-500",
      Unverified: "bg-gray-400/20 text-gray-500",
      Bounced: "bg-red-400/20 text-red-500",
    };
    
    const statusClass = statusClasses[status] || "bg-blue-400/20 text-blue-500";
    
    return <span className={`${baseClasses} ${statusClass}`}>{status}</span>;
};

const Highlight: React.FC<{ text: string | undefined; highlight: string }> = ({ text, highlight }) => {
  const safeText = text || '';
  if (!highlight.trim()) {
    return <span>{safeText}</span>;
  }
  const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = safeText.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary-600 dark:text-primary-400 rounded px-1 py-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const DetailItem: React.FC<{label: string; value?: string | number | null}> = ({ label, value }) => (
    value ? (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-card-foreground">{value}</p>
        </div>
    ) : null
);

const ContactDetailModal: React.FC<{ contact: Contact; onClose: () => void }> = ({ contact, onClose }) => {
    const tags = contact.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-border flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <img src={contact.avatarUrl} alt={contact.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h2 className="text-2xl font-bold text-card-foreground">{contact.name}</h2>
                            <p className="text-muted-foreground">{contact.title || 'No title specified'}</p>
                            <p className="text-muted-foreground flex items-center gap-2"><OfficeBuildingIcon className="w-4 h-4" /> {contact.company}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                        <XMarkIcon className="w-6 h-6 text-muted-foreground"/>
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto space-y-8">
                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        {contact.personLinkedinUrl && <a href={contact.personLinkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><LinkedInIcon className="w-6 h-6"/></a>}
                        {contact.twitterUrl && <a href={contact.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><TwitterIcon className="w-6 h-6"/></a>}
                        {contact.facebookUrl && <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><FacebookIcon className="w-6 h-6"/></a>}
                        {contact.website && <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><GlobeAltIcon className="w-6 h-6"/></a>}
                    </div>

                    {/* Contact Details */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Contact Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem label="Email" value={contact.email} />
                            <DetailItem label="Phone" value={contact.phone} />
                            <DetailItem label="Location" value={`${contact.city || ''} ${contact.state || ''} ${contact.country || ''}`.trim()} />
                            <DetailItem label="Email Status" value={contact.emailStatus} />
                        </div>
                    </section>
                    
                    {/* Company Details */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Company Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem label="Company" value={contact.company} />
                            <DetailItem label="Industry" value={contact.industry} />
                            <DetailItem label="Company Size" value={contact.companySize} />
                            <DetailItem label="Company Phone" value={contact.companyPhone} />
                            <DetailItem label="Annual Revenue" value={contact.annualRevenue ? `$${contact.annualRevenue.toLocaleString()}`: null} />
                            <DetailItem label="Website" value={contact.website} />
                        </div>
                    </section>
                    
                    {/* Tags & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tags.length > 0 && (
                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2"><TagIcon className="w-5 h-5"/> Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary-600 dark:text-primary-400">{tag}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                        {contact.notes && (
                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Notes</h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none bg-secondary p-4 rounded-lg border border-border">
                                    <p>{contact.notes}</p>
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


const Contacts: React.FC = () => {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Contact['status'] | 'All'>('All');
  const [emailStatusFilter, setEmailStatusFilter] = useState<'All' | 'Verified' | 'Unverified' | 'Bounced'>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { user } = useAuth();
  
  const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isSearching = searchTerm !== debouncedSearchTerm;

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
            id: c.id,
            name: c.name,
            email: c.email,
            company: c.company,
            phone: c.phone,
            status: c.status,
            avatarUrl: c.avatar_url,
            title: c.title,
            industry: c.industry,
            companySize: c.company_size,
            companyAddress: c.company_address,
            website: c.website,
            employeesCount: c.employees_count,
            annualRevenue: c.annual_revenue,
            totalFunding: c.total_funding,
            latestFundingAmount: c.latest_funding_amount,
            seniority: c.seniority,
            departments: c.departments,
            keywords: c.keywords,
            technologies: c.technologies,
            emailStatus: c.email_status,
            stage: c.stage,
            city: c.city,
            state: c.state,
            country: c.country,
            postalCode: c.postal_code,
            companyCity: c.company_city,
            companyState: c.company_state,
            companyCountry: c.company_country,
            companyPhone: c.company_phone,
            personLinkedinUrl: c.person_linkedin_url,
            companyLinkedinUrl: c.company_linkedin_url,
            facebookUrl: c.facebook_url,
            twitterUrl: c.twitter_url,
            notes: c.notes,
            tags: c.tags,
            isActive: c.is_active,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            userId: c.user_id,
        }));
        setAllContacts(formattedContacts);
      }
      setIsLoading(false);
    };

    fetchContacts();
  }, [user]);

  const uniqueIndustries = useMemo(() => {
    const industries = new Set(allContacts.map(c => c.industry).filter(Boolean));
    return ['All', ...Array.from(industries).sort()];
  }, [allContacts]);

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredContacts = useMemo(() => {
    const lowercasedSearch = debouncedSearchTerm.toLowerCase();
    
    const filtered = allContacts.filter(contact => {
      const matchesSearch = lowercasedSearch
        ? [
            contact.name, contact.email, contact.company, contact.phone,
            contact.title, contact.industry, contact.city, contact.state,
            contact.country, contact.tags
          ].some(field => field && field.toLowerCase().includes(lowercasedSearch))
        : true;
      
      const matchesStatusFilter = statusFilter === 'All' || contact.status === statusFilter;
      const matchesEmailStatusFilter = emailStatusFilter === 'All' || contact.emailStatus === emailStatusFilter;
      const matchesIndustryFilter = industryFilter === 'All' || contact.industry === industryFilter;

      return matchesSearch && matchesStatusFilter && matchesEmailStatusFilter && matchesIndustryFilter;
    });

    return [...filtered].sort((a, b) => {
        const valA = a[sortColumn] || '';
        const valB = b[sortColumn] || '';
        
        const comparison = valA.toString().localeCompare(valB.toString(), undefined, { numeric: true, sensitivity: 'base' });
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });

  }, [debouncedSearchTerm, statusFilter, emailStatusFilter, industryFilter, allContacts, sortColumn, sortDirection]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      alert(`File "${file.name}" selected. Import via Supabase Storage not yet implemented.`);
    }
  };

  const SortableHeader: React.FC<{ column: SortableColumn; label: string, className?: string }> = ({ column, label, className }) => {
    const isSorted = sortColumn === column;
    return (
        <th className={`p-4 font-semibold text-muted-foreground ${className}`}>
            <button onClick={() => handleSort(column)} className="flex items-center gap-1 group whitespace-nowrap">
                <span className="group-hover:text-foreground transition-colors">{label}</span>
                {isSorted 
                    ? (sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)
                    : <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                }
            </button>
        </th>
    );
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
            placeholder="Search by name, email, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border bg-background border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-muted-foreground animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
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
          <select
            value={emailStatusFilter}
            onChange={(e) => setEmailStatusFilter(e.target.value as 'All' | 'Verified' | 'Unverified' | 'Bounced')}
            className="border bg-background border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Email Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
            <option value="Bounced">Bounced</option>
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="border bg-background border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {uniqueIndustries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'All' ? 'All Industries' : industry}
              </option>
            ))}
          </select>
          <label htmlFor="csv-upload" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
            Import
          </label>
          <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>
      
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-10">
              <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-10">
              <p className="text-muted-foreground">
                  {debouncedSearchTerm || statusFilter !== 'All' || emailStatusFilter !== 'All' || industryFilter !== 'All'
                      ? 'No contacts found for your search.' 
                      : 'No contacts found.'
                  }
              </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden">
              {filteredContacts.map(contact => (
                <div 
                  key={contact.id} 
                  className="border-b border-border py-4 hover:bg-secondary cursor-pointer" 
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center min-w-0">
                      <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full mr-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-card-foreground truncate">
                          <Highlight text={contact.name} highlight={debouncedSearchTerm} />
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          <Highlight text={contact.email} highlight={debouncedSearchTerm} />
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <StatusBadge status={contact.status} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium">Company</p>
                      <p className="text-card-foreground truncate"><Highlight text={contact.company} highlight={debouncedSearchTerm} /></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Title</p>
                      <p className="text-card-foreground truncate"><Highlight text={contact.title} highlight={debouncedSearchTerm} /></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Phone</p>
                      <p className="text-card-foreground truncate"><Highlight text={contact.phone} highlight={debouncedSearchTerm} /></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Email Status</p>
                      <EmailStatusBadge status={contact.emailStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-auto border border-border rounded-lg max-h-[65vh]">
                <table className="min-w-[1800px] w-full text-left">
                  <thead className="bg-secondary sticky top-0 z-10">
                    <tr>
                      <SortableHeader column="name" label="Name" />
                      <SortableHeader column="company" label="Company" />
                      <SortableHeader column="title" label="Title" />
                      <SortableHeader column="status" label="Status" />
                      <SortableHeader column="emailStatus" label="Email Status" />
                      <SortableHeader column="city" label="City" />
                      <SortableHeader column="state" label="State" />
                      <SortableHeader column="country" label="Country" />
                      <SortableHeader column="industry" label="Industry" />
                      <th className="p-4 font-semibold text-muted-foreground">Tags</th>
                      <SortableHeader column="phone" label="Phone" />
                      <SortableHeader column="website" label="Website" />
                      <th className="p-4 font-semibold text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map(contact => (
                      <tr key={contact.id} className="border-b border-border hover:bg-secondary cursor-pointer" onClick={() => setSelectedContact(contact)}>
                        <td className="p-4 flex items-center whitespace-nowrap min-w-[250px]">
                          <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full mr-4" />
                          <div>
                            <p className="font-semibold text-card-foreground">
                              <Highlight text={contact.name} highlight={debouncedSearchTerm} />
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <Highlight text={contact.email} highlight={debouncedSearchTerm} />
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.company} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.title} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <StatusBadge status={contact.status} />
                        </td>
                        <td className="p-4 whitespace-nowrap">
                            <EmailStatusBadge status={contact.emailStatus} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.city} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.state} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.country} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.industry} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground min-w-[200px]">
                            {contact.tags ? (
                                <div className="flex flex-wrap gap-1">
                                    {contact.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary-600 dark:text-primary-400 whitespace-nowrap">{tag}</span>
                                    ))}
                                </div>
                            ) : <span className="text-muted-foreground">-</span>}
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap">
                          <Highlight text={contact.phone} highlight={debouncedSearchTerm} />
                        </td>
                        <td className="p-4 text-card-foreground whitespace-nowrap max-w-xs truncate">
                            {contact.website ? (
                                <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline" onClick={e => e.stopPropagation()}>
                                    <Highlight text={contact.website} highlight={debouncedSearchTerm} />
                                </a>
                            ) : <span className="text-muted-foreground">-</span>}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button onClick={(e) => { e.stopPropagation(); alert('Edit functionality not yet implemented.')}} className="text-primary-500 hover:underline font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedContact && <ContactDetailModal contact={selectedContact} onClose={() => setSelectedContact(null)} />}
    </div>
  );
};

export default Contacts;
