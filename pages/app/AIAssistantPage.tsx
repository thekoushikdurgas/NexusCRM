import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type, Chat } from '@google/genai';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Contact } from '../../types';
import { LogoIcon, SparklesIcon } from '../../components/icons/IconComponents';

// Define message type
interface Message {
  sender: 'user' | 'ai';
  text: string;
  contacts?: Contact[];
}

// Function declaration for searching contacts
const searchContactsFunctionDeclaration: FunctionDeclaration = {
  name: 'searchContacts',
  description: 'Searches for contacts based on various criteria like name, company, industry, status, location, or tags.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'A general search term. Can be a name, company, email, title, etc.',
      },
      status: {
        type: Type.STRING,
        description: 'The status of the contact. Can be "Lead", "Customer", or "Archived".',
      },
      industry: {
        type: Type.STRING,
        description: 'The industry the contact or their company belongs to, e.g., "Healthcare", "Technology".',
      },
      city: { type: Type.STRING, description: 'The city where the contact is located.' },
      state: { type: Type.STRING, description: 'The state where the contact is located.' },
      country: { type: Type.STRING, description: 'The country where the contact is located.' },
      tags: {
        type: Type.STRING,
        description: 'A single tag or comma-separated tags associated with the contact, e.g., "saas,b2b".',
      },
      limit: {
        type: Type.INTEGER,
        description: 'The maximum number of contacts to return. Defaults to 5 if not specified.',
      },
    },
    required: [],
  },
};

// Function declaration for adding a new contact
const addContactFunctionDeclaration: FunctionDeclaration = {
  name: 'addContact',
  description: 'Adds a new contact to the CRM. All parameters are optional, but providing at least a name is required.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Full name of the contact. This is the primary identifier.' },
      email: { type: Type.STRING, description: 'Email address of the contact.' },
      phone: { type: Type.STRING, description: 'Phone number of the contact.' },
      company: { type: Type.STRING, description: 'Company the contact works for.' },
      title: { type: Type.STRING, description: 'Job title of the contact.' },
      status: {
        type: Type.STRING,
        description: 'Status of the contact. Can be "Lead" or "Customer". Defaults to "Lead" if not provided.',
      },
      tags: { type: Type.STRING, description: 'A single tag or comma-separated list of tags to categorize the contact, e.g., "saas,b2b".' },
      notes: { type: Type.STRING, description: 'Any relevant notes about the contact.' },
    },
    required: ['name'],
  },
};

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestionPrompts = [
    "Who are my most recent leads?",
    "Add Jane Smith from TechCorp as a customer",
    "Find contacts in California in the software industry",
    "Show me archived contacts",
  ];

  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      try {
        const { count, error: countError } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (countError) throw new Error(`Failed to fetch contact count: ${countError.message}`);
        const contactCount = count || 0;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const newChat = ai.chats.create({
          model: 'gemini-2.5-pro',
          config: {
            systemInstruction: `You are NexusAI, an expert assistant for the NexusCRM. Your goal is to help the user manage their contacts efficiently. You can search for existing contacts and add new ones. You are integrated with a database of ${contactCount} contacts. When asked to perform an action, use the available tools. For general conversation, be friendly, concise, and helpful. When you add a contact successfully, confirm it with a positive message and show the new contact's details.`,
            tools: [{ functionDeclarations: [searchContactsFunctionDeclaration, addContactFunctionDeclaration] }],
          },
        });
        setChat(newChat);

        setMessages([{
          sender: 'ai',
          text: `Hello! I'm NexusAI, your smart CRM assistant. I can help you find contacts or add new ones. For example, you could say "Find contacts in the tech industry" or "Add a new lead named John Doe from Acme Inc." What can I help you with?`
        }]);
      } catch (error) {
        console.error("Error initializing Gemini:", error);
        setMessages([{
          sender: 'ai',
          text: "Sorry, I'm having trouble connecting to the AI service right now."
        }]);
      }
    };
    initChat();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(input);
      const response = result;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        let functionResponse;
        let createdContact: Contact | null = null;
        let foundContacts: Contact[] = [];

        if (functionCall.name === 'searchContacts') {
          const args = functionCall.args;
          let queryBuilder = supabase.from('contacts').select('*').eq('user_id', user!.id);
          
          if (args.status) queryBuilder = queryBuilder.eq('status', args.status);
          if (args.industry) queryBuilder = queryBuilder.ilike('industry', `%${args.industry}%`);
          if (args.city) queryBuilder = queryBuilder.ilike('city', `%${args.city}%`);
          if (args.state) queryBuilder = queryBuilder.ilike('state', `%${args.state}%`);
          if (args.country) queryBuilder = queryBuilder.ilike('country', `%${args.country}%`);
          if (args.tags) {
              const tags = (args.tags as string).split(',').map(t => t.trim());
              tags.forEach(tag => { queryBuilder = queryBuilder.ilike('tags', `%${tag}%`); });
          }
          if (args.query) {
             queryBuilder = queryBuilder.or(`name.ilike.%${args.query}%,company.ilike.%${args.query}%,email.ilike.%${args.query}%,title.ilike.%${args.query}%`);
          }
          queryBuilder = queryBuilder.limit(args.limit || 5);
          const { data, error } = await queryBuilder;
          if (error) throw new Error(error.message);
          
          foundContacts = (data || []).map(c => ({...c, avatarUrl: c.avatar_url}));
          functionResponse = { name: 'searchContacts', response: { contacts: data }};

        } else if (functionCall.name === 'addContact') {
            const args = functionCall.args;
            const newContactData = {
                user_id: user!.id,
                name: args.name,
                email: args.email,
                phone: args.phone,
                company: args.company,
                title: args.title,
                status: args.status || 'Lead',
                tags: args.tags,
                notes: args.notes,
                avatar_url: `https://picsum.photos/seed/${Date.now()}/40/40`,
            };
            const { data, error } = await supabase.from('contacts').insert(newContactData).select().single();
            if (error) throw new Error(error.message);
            
            createdContact = { ...data, avatarUrl: data.avatar_url };
            functionResponse = { name: 'addContact', response: { contact: data } };
        }

        if (functionResponse) {
            const functionResponseResult = await chat.sendMessage([{ functionResponse }]);
            const finalResponse = functionResponseResult;
            const contactsToShow = createdContact ? [createdContact] : foundContacts;
            setMessages(prev => [...prev, { sender: 'ai', text: finalResponse.text, contacts: contactsToShow as Contact[] }]);
        }

      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: response.text }]);
      }
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, an error occurred while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message: Message) => (
    <div className="prose prose-sm dark:prose-invert max-w-none">
        <p>{message.text}</p>
        {message.contacts && message.contacts.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
                {message.contacts.map(contact => (
                    <div key={contact.id} className="bg-background/50 p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                            <img src={contact.avatarUrl} alt={contact.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-bold text-foreground">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.title || 'No title'}</p>
                                <p className="text-xs text-muted-foreground">{contact.company}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-card rounded-lg shadow-md border border-border">
      <header className="p-4 border-b border-border flex items-center gap-3">
        <SparklesIcon className="w-6 h-6 text-primary-500"/>
        <h1 className="text-xl font-bold text-card-foreground">AI Assistant</h1>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <LogoIcon className="w-5 h-5 text-primary-500" />
                  </div>
              )}
              <div className={`p-4 rounded-2xl max-w-2xl ${msg.sender === 'ai' ? 'bg-secondary rounded-tl-none' : 'bg-primary text-primary-foreground rounded-br-none'}`}>
                {renderMessageContent(msg)}
              </div>
               {msg.sender === 'user' && (
                  <img src={user?.avatarUrl} alt="You" className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <LogoIcon className="w-5 h-5 text-primary-500" />
                  </div>
                <div className="p-4 rounded-2xl bg-secondary rounded-tl-none">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-border">
         {messages.length <= 1 && !isLoading && (
          <div className="flex items-center justify-start gap-2 flex-wrap pb-3">
              {suggestionPrompts.map(prompt => (
                  <button 
                      key={prompt} 
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm bg-secondary rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                      {prompt}
                  </button>
              ))}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask about your contacts..."
            className="w-full p-3 pr-12 border bg-background border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading || !chat}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !chat}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-muted-foreground hover:text-primary-500 disabled:text-muted-foreground/50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIAssistantPage;
