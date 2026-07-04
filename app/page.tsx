'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  GitFork,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  HelpCircle,
  Filter,
  Share2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Calendar,
  ChevronDown,
  UserPlus,
  Handshake,
  Mail,
  Phone,
  FileText,
  User,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trash2,
  X,
  Edit2,
  Briefcase,
  Sliders,
  Check,
  AlertCircle,
  Menu,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Key,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// --- DATA STRUCTURES ---

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  status: 'Active' | 'Lead' | 'Inactive';
  type: 'Customer' | 'Lead' | 'Partner';
  lastContact: string;
  dealValue: number;
  initials: string;
  avatar?: string;
  email: string;
  phone: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due: string;
  assigneeAvatar?: string;
  assigneeInitials: string;
  completed: boolean;
}

interface Opportunity {
  id: string;
  company: string;
  contact: string;
  dealValue: number;
  stage: string;
  probability: number;
  active: boolean;
  initials: string;
}

interface Activity {
  id: string;
  type: 'mail' | 'call' | 'event' | 'note' | 'user';
  title: string;
  description: string;
  time: string;
}

// --- INITIAL SEED DATA ---

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Jane Doe',
    role: 'Chief Procurement Officer',
    company: 'Global Logistics Inc.',
    status: 'Active',
    type: 'Customer',
    lastContact: '2 hours ago',
    dealValue: 42500,
    initials: 'JD',
    email: 'jane.doe@globallogistics.com',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 'c-2',
    name: 'Marcus Sterling',
    role: 'Lead Architect',
    company: 'Apex Solutions',
    status: 'Lead',
    type: 'Lead',
    lastContact: 'Yesterday',
    dealValue: 18200,
    initials: 'MS',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo6hMOhEz0miY6h3MgB2GH9fTDx2_m707RtOMNwzfnXSQfp5SLwCF22lY63zT5OaEcI8XvbiyzPgXUF5tb0msj5R2KS_nw7O3caNpFSpvmRWswz1e0fGnPYQ5iRDfQZU1NpqcF-oJjwLmqG80RneS18r1ZxdKYPb0Z-W0wfWoKuYY5ea8rtCV66XSa0LIPo3iMY8l_1qD9RUY3_GUFV6UuqUz-cOURuVSQM02Wrgu408Kd3gqfbXTtmO3bircKlH-N05LW-pxUvieL',
    email: 'm.sterling@apexsolutions.io',
    phone: '+1 (555) 876-5432'
  },
  {
    id: 'c-3',
    name: 'Elena Rodriguez',
    role: 'VP Engineering',
    company: 'CloudScale Labs',
    status: 'Active',
    type: 'Customer',
    lastContact: 'Oct 12, 2023',
    dealValue: 124000,
    initials: 'EL',
    email: 'elena@cloudscalelabs.com',
    phone: '+1 (555) 901-2345'
  },
  {
    id: 'c-4',
    name: 'Hiroshi Sato',
    role: 'Operations Manager',
    company: 'Nippon Steel Co.',
    status: 'Inactive',
    type: 'Partner',
    lastContact: 'Over 3mo ago',
    dealValue: 0,
    initials: 'HS',
    email: 'h.sato@nipponsteel.jp',
    phone: '+81 3-5555-1234'
  },
  {
    id: 'c-5',
    name: 'Sarah Jenkins',
    role: 'Marketing Lead',
    company: 'Bloom Growth',
    status: 'Lead',
    type: 'Lead',
    lastContact: '3 days ago',
    dealValue: 5400,
    initials: 'SJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbsi4t2vAvf_nVtzIbj3XwoZB3D8FdDCPVZEZq5HAB6jaWN1HzT-pPW8lAvIUdvJxu1BEPzJToryvEUEhdxxvn0cxJpDIAOCOcBHz2VOdKE2XCj0AXdKtp_resYjwFrk8f32bINQYjkb2lP7jwFWNqk0CyGTCgr8WLejDC-ky3W-im_Gd6Y9FNr5mzLY8lulJRPPktcs699482g1qv5QgiPUOoiaRXAAfcp2Bkm7b05q8-FXDwosmwyY2efOS0cyXNPJP9nZGfJ6d3',
    email: 'sarah.j@bloomgrowth.co',
    phone: '+1 (555) 345-6789'
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Client Follow-up',
    description: 'Call Sarah to confirm the Q4 hardware order details.',
    due: 'Today',
    assigneeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhK6AE4gX1llHKCznifMMWc6fRfNtmQdMGmxuYe8PTq7wZjVfZIZEEO0D6m94QLLr-hEYGrKmTcmoD4qndRXhsX91PTIdIdswoHtMJxkAClJ0Q3XKcsfXpgeAr_cXez6-2JbVK4OTaYcAwvi9_Xtps7AThkdjZ2RjUFOJbHU4Y5r32CRojx52ggQv2Efe-3evRGCVCNmwHbh5ufzWwNfi9y4iYcXNRZ4eWuwgf1iVBvsuSIQXMbAElkfhrmOjFBhBcwWSVI98m9Y7',
    assigneeInitials: 'SJ',
    completed: false
  },
  {
    id: 't-2',
    title: 'Review Contract',
    description: 'Send legal team the revised terms for Global logistics.',
    due: 'Tomorrow',
    assigneeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGMJXC9hN2TQ2s1fonJVWzwqXghWg7nCCehqPxp1TU0y5ubj7TcQnpx-inlCdCeScPD1F2MDetDitKgT5UWBZ0_SVTZQloaNceBy77Ctl6XHa5qgMMBz8VRLpNv_0BNaMjpJd1BOwGjktgwPCfKrc4l-QNqU3m7rq5nPEOVU-CBuhmx3hwBUpINudWVkghJTZK3VUJHLTAke2DF_jhRqTggXlO5VsVFmlsscN9nb_WooIw3TNuJ6FEaD3vdnMSFixTHzZ2hBEG-e_M',
    assigneeInitials: 'MS',
    completed: false
  },
  {
    id: 't-3',
    title: 'Quarterly Report',
    description: 'Finalize the regional sales performance deck for board meeting.',
    due: 'In 2 Days',
    assigneeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Qc6SVg1Fhmthua9f-t1Cw2-OnidpOTdNp9Ie2xaD5_diYGZbuBBxqDGtxboDkoD_zlcQnIbYa_BEuEMGKlS3iHBBkBBE7DxNHuNz68_yLJv4eD6PMNEVnEuIxI7t3hveBoZQ8gG4VQil6ZaLySmNaJ6vk6XCf6NGIKoZDLI5K85C2IzJSayVDLEvpjX7Qws5zbH2xnRpMP73l7xaw6Ed-AVcohc17wVTyPaNwRcuvs2P102QwvAgQwfr0WFgS5506kXx9YVlisIe',
    assigneeInitials: 'AR',
    completed: false
  }
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o-1',
    company: 'NovaSoft Corp',
    contact: 'Jessica Wu',
    dealValue: 82000,
    stage: 'Negotiation',
    probability: 85,
    active: true,
    initials: 'NS'
  },
  {
    id: 'o-2',
    company: 'Peak Logistics',
    contact: 'David Miller',
    dealValue: 45500,
    stage: 'Proposal Sent',
    probability: 60,
    active: true,
    initials: 'PL'
  },
  {
    id: 'o-3',
    company: 'Urban Space',
    contact: 'Tom Hardy',
    dealValue: 120000,
    stage: 'Discovery',
    probability: 30,
    active: true,
    initials: 'US'
  }
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'a-1',
    type: 'mail',
    title: 'Email sent to Sarah Jenkins',
    description: 'Follow-up on Q4 Proposal',
    time: '14 mins ago'
  },
  {
    id: 'a-2',
    type: 'call',
    title: 'Call finished with Mark Thompson',
    description: 'Contract negotiation phase',
    time: '2 hours ago'
  },
  {
    id: 'a-3',
    type: 'event',
    title: 'Meeting scheduled: BlueStar Inc.',
    description: 'Onsite demo of CRM features',
    time: '5 hours ago'
  },
  {
    id: 'a-4',
    type: 'note',
    title: 'Internal note added to Lead #4412',
    description: 'Awaiting budget confirmation',
    time: 'Yesterday'
  },
  {
    id: 'a-5',
    type: 'user',
    title: 'New contact added: Elena Rossi',
    description: 'CTO at TechFlow Systems',
    time: 'Oct 24, 2023'
  }
];

// Helper for generating unique ids out of component body rendering
const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function Page() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'pipeline' | 'reports' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<'All' | 'Customer' | 'Lead' | 'Partner'>('All');
  const [minDealValue, setMinDealValue] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Interactive UI triggers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactEditForm, setContactEditForm] = useState<Contact | null>(null);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'volume'>('revenue');
  const [opportunityTab, setOpportunityTab] = useState<'active' | 'paused'>('active');
  const [notifications, setNotifications] = useState<{ id: number; text: string; unread: boolean }[]>([
    { id: 1, text: 'New deal won by John: $50k from Bloom Growth!', unread: true },
    { id: 2, text: 'Reminder: Review Contract with Peak Logistics tomorrow.', unread: true },
    { id: 3, text: 'Meeting starts in 1 hour with Sarah Jenkins.', unread: false }
  ]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Database/Supabase Integration State
  const [dbStatus, setDbStatus] = useState<'loading' | 'not_configured' | 'connected' | 'error'>('loading');
  const [dbStatusMessage, setDbStatusMessage] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [dbMigrationStatus, setDbMigrationStatus] = useState('pending');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState('');
  const [migrationSuccess, setMigrationSuccess] = useState(false);

  const checkDbStatus = async () => {
    try {
      // Avoid calling state setters synchronously within effect body execution flow
      await new Promise(resolve => setTimeout(resolve, 0));
      setDbStatus('loading');
      const res = await fetch('/api/db/setup');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data.status);
        setDbStatusMessage(data.message);
        setDbUrl(data.databaseUrl || '');
        setDbMigrationStatus(data.migrationStatus || 'pending');
      } else {
        setDbStatus('error');
        setDbStatusMessage(data.error || 'Failed to check database status.');
      }
    } catch (e: any) {
      setDbStatus('error');
      setDbStatusMessage(e.message || 'Error checking database.');
    }
  };

  const runDbMigrations = async () => {
    try {
      setIsMigrating(true);
      setMigrationError('');
      setMigrationSuccess(false);
      const res = await fetch('/api/db/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true })
      });
      const data = await res.json();
      if (data.success) {
        setMigrationSuccess(true);
        // Refresh status
        await checkDbStatus();
        // Reload page or data from DB
        const [contactsRes, tasksRes, oppsRes, actsRes] = await Promise.all([
          fetch('/api/contacts').then(r => r.json()),
          fetch('/api/tasks').then(r => r.json()),
          fetch('/api/opportunities').then(r => r.json()),
          fetch('/api/activities').then(r => r.json())
        ]);
        if (contactsRes.success && contactsRes.data && contactsRes.data.length > 0) setContacts(contactsRes.data);
        if (tasksRes.success && tasksRes.data && tasksRes.data.length > 0) setTasks(tasksRes.data);
        if (oppsRes.success && oppsRes.data && oppsRes.data.length > 0) setOpportunities(oppsRes.data);
        if (actsRes.success && actsRes.data && actsRes.data.length > 0) setActivities(actsRes.data);
      } else {
        setMigrationError(data.error || 'Failed to run migrations.');
      }
    } catch (e: any) {
      setMigrationError(e.message || 'Error running migrations.');
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      const timer = setTimeout(() => {
        checkDbStatus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Form State for Adding/Editing
  const [formType, setFormType] = useState<'contact' | 'opportunity'>('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    role: '',
    company: '',
    status: 'Lead' as 'Active' | 'Lead' | 'Inactive',
    type: 'Lead' as 'Customer' | 'Lead' | 'Partner',
    dealValue: '',
    email: '',
    phone: ''
  });
  
  const [opportunityForm, setOpportunityForm] = useState({
    company: '',
    contact: '',
    dealValue: '',
    stage: 'Discovery',
    probability: 50
  });

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- DATABASE SYNC HELPERS ---
  const syncContactToDb = async (contact: Contact, action?: 'delete') => {
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contact }),
      });
    } catch (e) {
      console.warn('Failed to sync contact with Supabase:', e);
    }
  };

  const syncTaskToDb = async (task: Task, action?: 'delete') => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, task }),
      });
    } catch (e) {
      console.warn('Failed to sync task with Supabase:', e);
    }
  };

  const syncOpportunityToDb = async (opportunity: Opportunity, action?: 'delete') => {
    try {
      await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, opportunity }),
      });
    } catch (e) {
      console.warn('Failed to sync opportunity with Supabase:', e);
    }
  };

  const syncActivityToDb = async (activity: Activity, action?: 'delete') => {
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, activity }),
      });
    } catch (e) {
      console.warn('Failed to sync activity with Supabase:', e);
    }
  };

  // --- LOCAL STORAGE PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check auth session
      const storedSession = localStorage.getItem('crm_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          setIsAuthenticated(true);
          setCurrentUser(session);
        } catch (e) {
          localStorage.removeItem('crm_session');
        }
      }

      // Ensure seed user exists
      const storedUsers = localStorage.getItem('crm_users');
      if (!storedUsers) {
        const initialUsers = [
          { email: 'admin@salesintel.com', password: 'admin', name: 'Alex Rivera' }
        ];
        localStorage.setItem('crm_users', JSON.stringify(initialUsers));
      }

      setAuthLoading(false);

      // Try to load initial data from Supabase
      const loadInitialData = async () => {
        try {
          const [contactsRes, tasksRes, oppsRes, actsRes] = await Promise.all([
            fetch('/api/contacts').then(r => r.json()),
            fetch('/api/tasks').then(r => r.json()),
            fetch('/api/opportunities').then(r => r.json()),
            fetch('/api/activities').then(r => r.json())
          ]);

          if (contactsRes.success && contactsRes.data && contactsRes.data.length > 0) {
            setContacts(contactsRes.data);
            saveToLocalStorage('crm_contacts', contactsRes.data);
          } else {
            const storedContacts = localStorage.getItem('crm_contacts');
            setContacts(storedContacts ? JSON.parse(storedContacts) : INITIAL_CONTACTS);
          }

          if (tasksRes.success && tasksRes.data && tasksRes.data.length > 0) {
            setTasks(tasksRes.data);
            saveToLocalStorage('crm_tasks', tasksRes.data);
          } else {
            const storedTasks = localStorage.getItem('crm_tasks');
            setTasks(storedTasks ? JSON.parse(storedTasks) : INITIAL_TASKS);
          }

          if (oppsRes.success && oppsRes.data && oppsRes.data.length > 0) {
            setOpportunities(oppsRes.data);
            saveToLocalStorage('crm_opportunities', oppsRes.data);
          } else {
            const storedOpps = localStorage.getItem('crm_opportunities');
            setOpportunities(storedOpps ? JSON.parse(storedOpps) : INITIAL_OPPORTUNITIES);
          }

          if (actsRes.success && actsRes.data && actsRes.data.length > 0) {
            setActivities(actsRes.data);
            saveToLocalStorage('crm_activities', actsRes.data);
          } else {
            const storedActs = localStorage.getItem('crm_activities');
            setActivities(storedActs ? JSON.parse(storedActs) : INITIAL_ACTIVITIES);
          }
        } catch (e) {
          console.warn("Supabase API fetch failed (falling back to localStorage):", e);
          const storedContacts = localStorage.getItem('crm_contacts');
          setContacts(storedContacts ? JSON.parse(storedContacts) : INITIAL_CONTACTS);
          
          const storedTasks = localStorage.getItem('crm_tasks');
          setTasks(storedTasks ? JSON.parse(storedTasks) : INITIAL_TASKS);

          const storedOpps = localStorage.getItem('crm_opportunities');
          setOpportunities(storedOpps ? JSON.parse(storedOpps) : INITIAL_OPPORTUNITIES);

          const storedActs = localStorage.getItem('crm_activities');
          setActivities(storedActs ? JSON.parse(storedActs) : INITIAL_ACTIVITIES);
        }
      };

      loadInitialData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --- LOG ACTIVITY HELPER ---
  const logNewActivity = (type: Activity['type'], title: string, description: string) => {
    const newAct: Activity = {
      id: generateUniqueId('a'),
      type,
      title,
      description,
      time: 'Just now'
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    saveToLocalStorage('crm_activities', updated);
    syncActivityToDb(newAct);
  };

  // --- DYNAMIC COMPUTATIONS ---
  const activeOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.active);
  }, [opportunities]);

  const pausedOpportunities = useMemo(() => {
    return opportunities.filter(opp => !opp.active);
  }, [opportunities]);

  const currentOpportunitiesList = useMemo(() => {
    return opportunityTab === 'active' ? activeOpportunities : pausedOpportunities;
  }, [opportunityTab, activeOpportunities, pausedOpportunities]);

  // Totals calculations for Dashboard
  const totals = useMemo(() => {
    const totalRev = opportunities
      .filter(o => o.active)
      .reduce((acc, curr) => acc + curr.dealValue, 0) + 120000; // base from mocked metrics
    
    const wonCount = opportunities.filter(o => o.stage === 'Won' || o.probability === 100).length + 49; // base + user changes
    const totalLeads = contacts.filter(c => c.type === 'Lead').length + 143; // base + user changes
    
    return {
      revenue: totalRev,
      leads: totalLeads,
      won: wonCount
    };
  }, [opportunities, contacts]);

  // Filtered Contacts List
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search matching
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Quick Type filter
      const matchesType = contactTypeFilter === 'All' || contact.type === contactTypeFilter;
      
      // Status filter (Advanced Filters)
      const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;

      // Deal Value filter (Advanced Filters)
      const matchesDealValue = contact.dealValue >= minDealValue;

      return matchesSearch && matchesType && matchesStatus && matchesDealValue;
    });
  }, [contacts, searchQuery, contactTypeFilter, statusFilter, minDealValue]);

  // Tasks statistics
  const pendingTasksCount = useMemo(() => {
    return tasks.filter(t => !t.completed).length;
  }, [tasks]);

  // --- ACTIONS ---

  // Complete/Uncomplete Task
  const toggleTaskCompleted = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        const updatedTask = { ...t, completed: nextCompleted };
        // Log activity
        logNewActivity(
          'note',
          `${nextCompleted ? 'Completed' : 'Reopened'} Task: ${t.title}`,
          `Task completed status updated successfully.`
        );
        syncTaskToDb(updatedTask);
        return updatedTask;
      }
      return t;
    });
    setTasks(updatedTasks);
    saveToLocalStorage('crm_tasks', updatedTasks);
  };

  // Toggle active/paused opportunity
  const toggleOpportunityActive = (oppId: string) => {
    const updated = opportunities.map(o => {
      if (o.id === oppId) {
        const nextActive = !o.active;
        const updatedOpp = { ...o, active: nextActive };
        logNewActivity(
          'note',
          `Opportunity Status Changed: ${o.company}`,
          `Marked opportunity as ${nextActive ? 'active' : 'paused'}.`
        );
        syncOpportunityToDb(updatedOpp);
        return updatedOpp;
      }
      return o;
    });
    setOpportunities(updated);
    saveToLocalStorage('crm_opportunities', updated);
  };

  // Submit Contact Form
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.company) return;

    const valueNum = Number(contactForm.dealValue) || 0;
    const initials = contactForm.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newContact: Contact = {
      id: generateUniqueId('c'),
      name: contactForm.name,
      role: contactForm.role || 'Representative',
      company: contactForm.company,
      status: contactForm.status,
      type: contactForm.type,
      lastContact: 'Just added',
      dealValue: valueNum,
      initials,
      email: contactForm.email || `${contactForm.name.toLowerCase().replace(/\s+/g, '.')}@${contactForm.company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: contactForm.phone || '+1 (555) 000-0000'
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveToLocalStorage('crm_contacts', updated);
    syncContactToDb(newContact);

    // Also automatically create an Opportunity if deal value is high or it's active
    if (valueNum > 0) {
      const newOpp: Opportunity = {
        id: generateUniqueId('o'),
        company: contactForm.company,
        contact: contactForm.name,
        dealValue: valueNum,
        stage: contactForm.status === 'Active' ? 'Negotiation' : 'Discovery',
        probability: contactForm.status === 'Active' ? 80 : 30,
        active: true,
        initials: initials
      };
      const updatedOpps = [newOpp, ...opportunities];
      setOpportunities(updatedOpps);
      saveToLocalStorage('crm_opportunities', updatedOpps);
      syncOpportunityToDb(newOpp);
    }

    logNewActivity('user', 'New Contact Registered', `Added ${contactForm.name} from ${contactForm.company}`);
    
    // Reset Form & Close Modal
    setContactForm({
      name: '',
      role: '',
      company: '',
      status: 'Lead',
      type: 'Lead',
      dealValue: '',
      email: '',
      phone: ''
    });
    setIsAddModalOpen(false);
  };

  // Submit Opportunity Form
  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityForm.company || !opportunityForm.contact) return;

    const valueNum = Number(opportunityForm.dealValue) || 0;
    const initials = opportunityForm.company
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newOpp: Opportunity = {
      id: generateUniqueId('o'),
      company: opportunityForm.company,
      contact: opportunityForm.contact,
      dealValue: valueNum,
      stage: opportunityForm.stage,
      probability: Number(opportunityForm.probability) || 50,
      active: true,
      initials
    };

    const updated = [newOpp, ...opportunities];
    setOpportunities(updated);
    saveToLocalStorage('crm_opportunities', updated);
    syncOpportunityToDb(newOpp);

    logNewActivity('note', 'New Opportunity Created', `Created deal with ${opportunityForm.company} worth $${valueNum.toLocaleString()}`);

    // Reset Form & Close Modal
    setOpportunityForm({
      company: '',
      contact: '',
      dealValue: '',
      stage: 'Discovery',
      probability: 50
    });
    setIsAddModalOpen(false);
  };

  // Delete Contact
  const handleDeleteContact = (id: string) => {
    const contactToDelete = contacts.find(c => c.id === id);
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveToLocalStorage('crm_contacts', updated);
    if (contactToDelete) {
      syncContactToDb(contactToDelete, 'delete');
    }
    setSelectedContact(null);
    logNewActivity('note', 'Contact Removed', 'A contact was deleted from the management records.');
  };

  // Update Contact
  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEditForm || !contactEditForm.name || !contactEditForm.company) return;

    const valueNum = Number(contactEditForm.dealValue) || 0;
    const initials = contactEditForm.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const updatedContact: Contact = {
      ...contactEditForm,
      dealValue: valueNum,
      initials,
    };

    const updated = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    setContacts(updated);
    saveToLocalStorage('crm_contacts', updated);
    syncContactToDb(updatedContact);
    setSelectedContact(updatedContact); // Update slide-over details panel view

    // Update corresponding opportunity name and initials if it exists
    const updatedOpps = opportunities.map(o => {
      if (o.company === selectedContact?.company && o.contact === selectedContact?.name) {
        const updatedOpp = {
          ...o,
          company: updatedContact.company,
          contact: updatedContact.name,
          dealValue: updatedContact.status === 'Inactive' ? 0 : updatedContact.dealValue || o.dealValue,
          initials,
        };
        syncOpportunityToDb(updatedOpp);
        return updatedOpp;
      }
      return o;
    });
    setOpportunities(updatedOpps);
    saveToLocalStorage('crm_opportunities', updatedOpps);

    logNewActivity('user', 'Contact Updated', `Updated details for ${updatedContact.name} from ${updatedContact.company}`);
    setIsEditingContact(false);
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!authEmail || !authPassword) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('crm_session', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setAuthEmail('');
        setAuthPassword('');
        logNewActivity('user', 'Sessão Iniciada', `Usuário ${data.user.name} realizou login no sistema.`);
        return;
      } else if (res.status === 401) {
        setAuthError('E-mail ou senha incorretos.');
        return;
      }
    } catch (err) {
      console.warn("Supabase auth failed/not configured, falling back to local credentials:", err);
    }

    const storedUsers = localStorage.getItem('crm_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    const foundUser = users.find(
      (u: any) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword
    );

    if (foundUser) {
      const session = { email: foundUser.email, name: foundUser.name };
      localStorage.setItem('crm_session', JSON.stringify(session));
      setCurrentUser(session);
      setIsAuthenticated(true);
      setAuthEmail('');
      setAuthPassword('');
      logNewActivity('user', 'Sessão Iniciada', `Usuário ${foundUser.name} realizou login no sistema.`);
    } else {
      setAuthError('E-mail ou senha incorretos.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword || !authName) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email: authEmail, password: authPassword, name: authName })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('crm_session', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        logNewActivity('user', 'Conta Criada', `Novo usuário ${data.user.name} registrado e conectado.`);
        return;
      } else if (data.error) {
        setAuthError(data.error);
        return;
      }
    } catch (err) {
      console.warn("Supabase registration failed/not configured, falling back to local credentials:", err);
    }

    const storedUsers = localStorage.getItem('crm_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    const emailExists = users.some(
      (u: any) => u.email.toLowerCase() === authEmail.toLowerCase()
    );

    if (emailExists) {
      setAuthError('Este e-mail já está cadastrado.');
      return;
    }

    const newUser = { email: authEmail, password: authPassword, name: authName };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('crm_users', JSON.stringify(updatedUsers));

    // Log in directly
    const session = { email: newUser.email, name: newUser.name };
    localStorage.setItem('crm_session', JSON.stringify(session));
    setCurrentUser(session);
    setIsAuthenticated(true);
    
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    logNewActivity('user', 'Conta Criada', `Novo usuário ${newUser.name} registrado e conectado.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
  };

  // Export current list to simulated JSON file download
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredContacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EnterpriseCRM_Contacts_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    logNewActivity('note', 'Contacts Exported', `Downloaded spreadsheet report for ${filteredContacts.length} records.`);
  };

  // Mark all notifications as read
  const markNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // --- RECONSTRUCTING SALES PERFORMANCE GRID DATA ---
  // Beautiful interactive chart dataset
  const chartData = useMemo(() => {
    const baseRev = [45, 60, 55, 80, 70, 90, 65, 85, 95, 110, 100, 124];
    const baseVol = [12, 18, 14, 25, 20, 28, 19, 24, 29, 35, 30, 38];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const scale = chartMetric === 'revenue' ? 1000 : 1;
    const values = chartMetric === 'revenue' ? baseRev : baseVol;
    
    return months.map((month, idx) => ({
      month,
      value: values[idx] * scale,
      percentage: (values[idx] / 125) * 100 // Normalized percentage for beautiful rendering
    }));
  }, [chartMetric]);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800 relative overflow-hidden">
        {/* Abstract background accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden relative z-10 transition-all">
          {/* Header section with brand */}
          <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden border-b border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-transparent to-transparent opacity-60" />
            
            {/* Elegant Brand Icon */}
            <div className="w-12 h-12 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center text-xl mx-auto mb-4 shadow-md relative z-10">
              E
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight relative z-10">EnterpriseCRM</h2>
            <p className="text-slate-400 text-[10px] tracking-widest font-bold uppercase mt-1.5 relative z-10">Sales Intelligence Platform</p>
          </div>

          <div className="p-8">
            {/* Action selector tabs */}
            <div className="flex border-b border-slate-100 mb-6 gap-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={cn(
                  "pb-3 text-sm font-bold border-b-2 transition-all relative text-left",
                  authMode === 'login'
                    ? "border-blue-600 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Acessar Conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={cn(
                  "pb-3 text-sm font-bold border-b-2 transition-all relative text-left",
                  authMode === 'register'
                    ? "border-blue-600 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* Error messaging bar */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200/70 rounded-lg text-red-650 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{authError}</p>
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 transition-all text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="voce@exemplo.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Senha</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthEmail('admin@salesintel.com');
                        setAuthPassword('admin');
                        setAuthError('');
                      }}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Preencher Demo
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Digite sua senha"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 transition-all text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2 flex items-center justify-center gap-1.5"
              >
                <span>{authMode === 'login' ? 'Entrar no Sistema' : 'Cadastrar Conta'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {authMode === 'login' && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Acesso rápido para demonstração:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmail('admin@salesintel.com');
                    setAuthPassword('admin');
                    setAuthError('');
                    setTimeout(() => {
                      const session = { email: 'admin@salesintel.com', name: 'Alex Rivera' };
                      localStorage.setItem('crm_session', JSON.stringify(session));
                      setCurrentUser(session);
                      setIsAuthenticated(true);
                      logNewActivity('user', 'Sessão Iniciada', `Usuário Alex Rivera realizou login demo.`);
                    }, 100);
                  }}
                  className="mt-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 font-bold py-1.5 px-3 rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Key className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  Entrar como Administrador Demo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50/50 relative overflow-x-hidden font-sans select-none">
      
      {/* --- SIDEBAR NAVIGATION SHELL --- */}
      {/* Overlay background for mobile when sidebar is open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "w-64 fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 flex flex-col py-6 z-50 shadow-sm transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              E
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-blue-600 leading-none">EnterpriseCRM</h1>
              <p className="text-xs font-medium text-slate-400 mt-1">Sales Intelligence</p>
            </div>
          </div>
          {/* Mobile menu close trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
              activeTab === 'dashboard'
                ? "bg-blue-50/75 text-blue-600 font-semibold border-l-4 border-blue-600 rounded-l-none"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5", activeTab === 'dashboard' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
            Dashboard
          </button>

          <button
            onClick={() => {
              setActiveTab('contacts');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
              activeTab === 'contacts'
                ? "bg-blue-50/75 text-blue-600 font-semibold border-l-4 border-blue-600 rounded-l-none"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Users className={cn("w-5 h-5", activeTab === 'contacts' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
            Contacts
          </button>

          {/* Placeholders for secondary views */}
          <button
            onClick={() => {
              setActiveTab('pipeline');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
              activeTab === 'pipeline'
                ? "bg-blue-50/75 text-blue-600 font-semibold border-l-4 border-blue-600 rounded-l-none"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <GitFork className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Pipeline
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
              activeTab === 'reports'
                ? "bg-blue-50/75 text-blue-600 font-semibold border-l-4 border-blue-600 rounded-l-none"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Reports
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
              activeTab === 'settings'
                ? "bg-blue-50/75 text-blue-600 font-semibold border-l-4 border-blue-600 rounded-l-none"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Settings
          </button>
        </nav>

        {/* Quick Lead Button */}
        <div className="px-4 mt-auto">
          <button
            onClick={() => {
              setFormType('contact');
              setIsAddModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </aside>

      {/* --- MAIN FRAME SPACE (Account for fixed sidebar) --- */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">

        {/* --- TOP APP BAR SHELL --- */}
        <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-sm/50 gap-2 sm:gap-4">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden flex-shrink-0"
            id="mobile-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dynamic Search */}
          <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg">
            <div className="relative w-full group">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 sm:pl-12 pr-8 sm:pr-4 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  markNotificationsRead();
                }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotificationDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-3 z-50 text-slate-800"
                    >
                      <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-xs tracking-wider uppercase text-slate-400">Notifications</span>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-400">
                            No notifications to display.
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={cn("px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 text-xs text-slate-700 flex items-start gap-2", n.unread && "bg-blue-50/30")}>
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                              <p className="leading-normal">{n.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Help Button */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            {/* Quick Add Entry */}
            <button
              onClick={() => {
                setFormType('contact');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-semibold text-xs sm:text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
            </button>

            {/* User Profile Info with dynamic name and logout action */}
            <div className="flex items-center gap-3 pl-1 sm:pl-2 border-l border-slate-100 ml-1">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{currentUser?.email || 'Sales Director'}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100 flex-shrink-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO60Aa-rWBxbQpvX1IBdDEnZrEBNfbWJCJjY-Myt_Z_CRTcMNtIrr-LS4MeN2SJbnKyQdyJtQH3bJhbY4uZCBv3yIKtQP41S1bmNBzj62Oel3pHqC7ZHlRqhwkTM-g4XPAA7A9nEnnqTmEp4Hk_iIc0MpIIqdlqi3zy3mD3Bpjd03edV7y-GJOUOu7mkAe4BkKrZP2Fqfouj0CkTNvpZkFxryl91PT6o49Kkif4ufO3_1UPksc0FN7Q8ihn9mMqCJR3JTJI6e2ryVM"
                  alt={currentUser?.name || 'Alex Rivera'}
                  fill
                  sizes="36px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-all"
                title="Sair do sistema"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* --- MAIN PAGE VIEW TRANSITIONS --- */}
        <main className="p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* --- DASHBOARD TAB VIEW --- */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 flex-1 flex flex-col"
              >
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Dashboard Overview</h2>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, Alex. Here&apos;s your sales pipeline performance report for today.</p>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-xl px-4 py-2 shadow-sm text-xs font-semibold text-slate-700 flex-shrink-0 self-start md:self-auto">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Oct 1, 2023 - Oct 31, 2023</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* KPI Metrics Matrix Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Revenue card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-2 top-2 p-3 text-blue-50/70 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-16 h-16 text-blue-500/10" />
                    </div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">${(totals.revenue / 1000).toFixed(0)}k</h3>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+12%</span>
                      <span className="text-slate-400 font-medium">vs last month</span>
                    </div>
                  </div>

                  {/* New Leads card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-2 top-2 p-3 text-blue-50/70 group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="w-16 h-16 text-slate-500/10" />
                    </div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">New Leads</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{totals.leads}</h3>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+5%</span>
                      <span className="text-slate-400 font-medium">vs last month</span>
                    </div>
                  </div>

                  {/* Won Deals card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-2 top-2 p-3 text-blue-50/70 group-hover:scale-110 transition-transform duration-300">
                      <Handshake className="w-16 h-16 text-slate-500/10" />
                    </div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Won Deals</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{totals.won}</h3>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+8%</span>
                      <span className="text-slate-400 font-medium">vs last month</span>
                    </div>
                  </div>

                  {/* Conversion Rate card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute right-2 top-2 p-3 text-blue-50/70 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-16 h-16 text-slate-500/10" />
                    </div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Conversion Rate</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">14%</h3>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-semibold">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <span>Stable</span>
                      <span className="text-slate-400 font-medium">current quarter</span>
                    </div>
                  </div>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-12 gap-8">
                  
                  {/* Revenue / Volume Chart Component */}
                  <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[420px]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Sales Performance</h4>
                        <p className="text-xs text-slate-400 mt-1">Year-to-date monthly breakdown overview</p>
                      </div>
                      <div className="flex border border-slate-150 rounded-lg p-0.5 bg-slate-50 flex-shrink-0">
                        <button
                          onClick={() => setChartMetric('revenue')}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                            chartMetric === 'revenue' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                          )}
                        >
                          Revenue
                        </button>
                        <button
                          onClick={() => setChartMetric('volume')}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                            chartMetric === 'volume' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                          )}
                        >
                          Volume
                        </button>
                      </div>
                    </div>

                    {/* Responsive Dynamic Custom SVG Chart */}
                    <div className="flex-1 bg-slate-50 rounded-xl relative flex items-end p-6 select-none overflow-hidden group/chart border border-slate-100">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none px-6">
                        <div className="h-[1px] w-full bg-slate-200/50" />
                        <div className="h-[1px] w-full bg-slate-200/50" />
                        <div className="h-[1px] w-full bg-slate-200/50" />
                        <div className="h-[1px] w-full bg-slate-200/50" />
                        <div className="h-[1px] w-full bg-slate-200/50" />
                      </div>

                      {/* Columns container */}
                      <div className="w-full h-4/5 flex items-end justify-between gap-2.5 relative z-10 px-2">
                        {chartData.map((data, idx) => (
                          <div
                            key={data.month}
                            className="flex-1 h-full flex flex-col justify-end items-center relative"
                            onMouseEnter={() => setHoveredBarIndex(idx)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            {/* Animated Column Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${data.percentage}%` }}
                              transition={{ type: 'spring', stiffness: 80, delay: idx * 0.02 }}
                              className={cn(
                                "w-full rounded-t-md transition-colors relative cursor-pointer",
                                hoveredBarIndex === idx 
                                  ? "bg-blue-600 shadow-md shadow-blue-100" 
                                  : "bg-blue-500/80"
                              )}
                            />

                            {/* Column Month Label */}
                            <span className="text-[10px] font-bold text-slate-400 mt-2 select-none absolute -bottom-5">
                              {data.month}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tooltip Hover Overlay */}
                      <AnimatePresence>
                        {hoveredBarIndex !== null && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute bg-white border border-slate-200 p-3 rounded-lg shadow-xl flex flex-col items-center pointer-events-none z-30"
                            style={{
                              left: `calc(${(hoveredBarIndex / 12) * 100}% + 1.5rem)`,
                              bottom: '60%'
                            }}
                          >
                            <span className="text-[10px] font-bold text-slate-400">{chartData[hoveredBarIndex].month} Statistics</span>
                            <span className="text-sm font-bold text-blue-600 mt-0.5">
                              {chartMetric === 'revenue' 
                                ? `$${chartData[hoveredBarIndex].value.toLocaleString()}` 
                                : `${chartData[hoveredBarIndex].value} Deals`
                              }
                            </span>
                            <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">+14.2% Growth</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chart bottom margin spacing spacer */}
                    <div className="h-4" />
                  </div>

                  {/* Recent Activity Log Feed */}
                  <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-base font-bold text-slate-900">Recent Activity</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full uppercase tracking-wide">Live Stream</span>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                      {activities.map((act) => {
                        // Render icon based on activity type
                        let IconNode = User;
                        let bgClass = "bg-slate-100 text-slate-600";
                        if (act.type === 'mail') {
                          IconNode = Mail;
                          bgClass = "bg-blue-50 text-blue-600";
                        } else if (act.type === 'call') {
                          IconNode = Phone;
                          bgClass = "bg-emerald-50 text-emerald-600";
                        } else if (act.type === 'event') {
                          IconNode = Calendar;
                          bgClass = "bg-amber-50 text-amber-600";
                        } else if (act.type === 'note') {
                          IconNode = FileText;
                          bgClass = "bg-purple-50 text-purple-600";
                        }

                        return (
                          <div key={act.id} className="flex gap-4 group">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm", bgClass)}>
                              <IconNode className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">{act.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 leading-normal truncate">{act.description}</p>
                              <span className="text-[10px] text-slate-400 mt-1.5 inline-block font-medium">{act.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upcoming Tasks Matrix */}
                  <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-base font-bold text-slate-900">Upcoming Tasks</h4>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 py-1 px-2.5 rounded-full">
                        {pendingTasksCount} DUE
                      </span>
                    </div>

                    <div className="flex-1 space-y-3.5">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "p-4 rounded-xl border transition-all relative flex flex-col gap-3 group/task",
                            task.completed 
                              ? "bg-slate-50/50 border-slate-200 opacity-60" 
                              : "bg-white border-slate-150 hover:border-blue-200 hover:shadow-sm"
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <h5 className={cn("text-xs font-bold leading-normal truncate flex-1", task.completed ? "line-through text-slate-400" : "text-slate-800")}>
                              {task.title}
                            </h5>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider",
                              task.due === 'Today' && !task.completed ? "text-red-500" : "text-slate-400"
                            )}>
                              {task.due}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                            {task.description}
                          </p>

                          <div className="flex items-center justify-between mt-1">
                            {/* Assignee Avatar with Direct Links */}
                            <div className="flex -space-x-1">
                              {task.assigneeAvatar ? (
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm">
                                  <Image
                                    src={task.assigneeAvatar}
                                    alt="Assignee"
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
                                  {task.assigneeInitials}
                                </div>
                              )}
                            </div>

                            {/* Toggle checkbox */}
                            <button
                              onClick={() => toggleTaskCompleted(task.id)}
                              className="text-slate-300 hover:text-blue-600 transition-colors"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600 group-hover/task:text-blue-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Opportunities Active/Paused */}
                  <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Top Opportunities</h4>
                        <p className="text-xs text-slate-400 mt-0.5">High probability pipeline contracts</p>
                      </div>
                      <div className="flex border border-slate-150 rounded-lg p-0.5 bg-slate-100 flex-shrink-0">
                        <button
                          onClick={() => setOpportunityTab('active')}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                            opportunityTab === 'active' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => setOpportunityTab('paused')}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                            opportunityTab === 'paused' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Paused
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead className="bg-slate-50 border-b border-slate-150">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Contact</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deal Value</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Probability</th>
                            <th className="px-6 py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentOpportunitiesList.map((opp) => (
                            <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {opp.initials}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 leading-none">{opp.company}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">{opp.contact}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-800">
                                ${opp.dealValue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                  opp.stage === 'Negotiation' 
                                    ? "bg-amber-50 text-amber-700 border-amber-200/50" 
                                    : opp.stage === 'Discovery' 
                                      ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                      : "bg-slate-50 text-slate-600 border-slate-200/50"
                                )}>
                                  {opp.stage}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2.5 w-36">
                                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                      style={{ width: `${opp.probability}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 select-none">
                                    {opp.probability}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => toggleOpportunityActive(opp.id)}
                                  className="text-xs text-slate-400 hover:text-blue-600 lg:opacity-0 group-hover:opacity-100 transition-all font-semibold"
                                >
                                  {opp.active ? 'Pause' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                          
                          {currentOpportunitiesList.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                                No {opportunityTab} opportunities registered in this cycle.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom view complete pipeline toggle tab redirect */}
                    <div className="p-3 bg-slate-50 border-t border-slate-150 text-center">
                      <button
                        onClick={() => {
                          setMinDealValue(50000); // Advanced filter set
                          setActiveTab('contacts');
                        }}
                        className="text-blue-600 font-semibold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <span>View High Value Opportunities</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* --- CONTACTS TAB VIEW --- */}
            {activeTab === 'contacts' && (
              <motion.div
                key="contacts-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 flex-1 flex flex-col"
              >
                {/* Header Actions row */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">
                      <span>CRM</span>
                      <span>/</span>
                      <span className="text-blue-600">Contacts</span>
                    </nav>
                    <h2 className="text-3xl font-bold text-slate-950 tracking-tight">Contacts</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start md:self-auto">
                    <button
                      onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all shadow-sm",
                        isAdvancedFiltersOpen || minDealValue > 0 || statusFilter !== 'All'
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Advanced Filters</span>
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Filters sidebar / collapsible header row */}
                <AnimatePresence>
                  {isAdvancedFiltersOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-100/50 border border-slate-200/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                        {/* Minimum Deal value filter */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Deal Value</label>
                          <select
                            value={minDealValue}
                            onChange={(e) => setMinDealValue(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value={0}>All Values</option>
                            <option value={10000}>&gt; $10,000</option>
                            <option value={50000}>&gt; $50,000</option>
                            <option value={100000}>&gt; $100,000</option>
                          </select>
                        </div>

                        {/* Status dropdown filter */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Lead">Lead</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>

                        {/* Clear Filters CTA */}
                        <button
                          onClick={() => {
                            setMinDealValue(0);
                            setStatusFilter('All');
                            setIsAdvancedFiltersOpen(false);
                          }}
                          className="w-full py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition-colors shadow-sm"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter quick chips row */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5">
                  {(['All', 'Customer', 'Lead', 'Partner'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContactTypeFilter(type)}
                      className={cn(
                        "px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0 border",
                        contactTypeFilter === type
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {type === 'All' ? 'All Contacts' : `${type}s`}
                    </button>
                  ))}
                </div>

                {/* Contacts dynamic data list table panel */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name &amp; Role</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Contact</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Deal Value</th>
                          <th className="px-6 py-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredContacts.map((contact) => (
                          <tr
                            key={contact.id}
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsEditingContact(false);
                              setContactEditForm(contact);
                            }}
                            className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {contact.avatar ? (
                                  <div className="w-9 h-9 rounded-full overflow-hidden relative shadow-sm flex-shrink-0 bg-slate-100">
                                    <Image
                                      src={contact.avatar}
                                      alt={contact.name}
                                      fill
                                      sizes="36px"
                                      className="object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 shadow-sm">
                                    {contact.initials}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-none">{contact.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1">{contact.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                              {contact.company}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                                contact.status === 'Active'
                                  ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                  : contact.status === 'Lead'
                                    ? "bg-amber-50 text-amber-700 border-amber-200/50"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                              )}>
                                {contact.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                              {contact.lastContact}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-900 text-right">
                              ${contact.dealValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 lg:opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContact(contact);
                                    setContactEditForm({ ...contact });
                                    setIsEditingContact(true);
                                  }}
                                  className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                  title="Edit Contact"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContact(contact.id);
                                  }}
                                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                  title="Delete Contact"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredContacts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                              No contacts matching search query and filters found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer element */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 font-semibold">
                      Showing <span className="font-bold text-slate-800">1 - {filteredContacts.length}</span> of <span className="font-bold text-slate-800">{filteredContacts.length}</span> matching contacts
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button disabled className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-sm">1</button>
                      <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 cursor-not-allowed" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rows per page:</span>
                      <select className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>{filteredContacts.length}</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Floating Bottom statistics widgets row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Conversion</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">24.8%</h3>
                      <p className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+2.4% from last month</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">$1.2M</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5">Active enterprise bids</p>
                    </div>
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg SLA Time</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">1.4h</h3>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1.5">★ Within Target Metric</p>
                    </div>
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* --- PIPELINE TAB VIEW PLACEHOLDER --- */}
            {activeTab === 'pipeline' && (
              <motion.div
                key="pipeline-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                  <GitFork className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pipeline Stages & Kanban</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  The Kanban view handles detailed workflow routing. Your opportunities are already listed in the Dashboard & Contacts tables with active state persistence.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs shadow hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}

            {/* --- REPORTS TAB VIEW PLACEHOLDER --- */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Advanced Business Reports</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  Access deep pipeline analysis, monthly volume, and exportable CSV details from the Sales Performance widget in the Dashboard view.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs shadow hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}

            {/* --- SETTINGS TAB VIEW (SUPABASE INTEGRATION) --- */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 max-w-4xl mx-auto pb-12"
              >
                {/* Header block */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Integração do Banco de Dados Supabase</h3>
                      <p className="text-xs text-slate-500">Monitore e configure a conexão PostgreSQL e execute as migrations do seu CRM.</p>
                    </div>
                  </div>
                  <button
                    onClick={checkDbStatus}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Verificar Conexão
                  </button>
                </div>

                {/* Status and Action grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Connection Status Card */}
                  <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[250px]">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status da Conexão</p>
                      
                      {dbStatus === 'loading' && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Verificando...</span>
                        </div>
                      )}

                      {dbStatus === 'connected' && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Conectado
                          </span>
                          <p className="text-xs text-slate-600 mt-2 font-medium">Supabase pronto para uso!</p>
                        </div>
                      )}

                      {dbStatus === 'not_configured' && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Não Configurado
                          </span>
                          <p className="text-xs text-slate-600 mt-2 font-medium">DATABASE_URL vazia ou em formato incorreto.</p>
                        </div>
                      )}

                      {dbStatus === 'error' && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            Erro de Conexão
                          </span>
                          <p className="text-xs text-slate-600 mt-2 font-medium">Não foi possível conectar ao host do banco de dados.</p>
                        </div>
                      )}

                      {dbUrl && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Connection URI</p>
                          <code className="block text-[10px] bg-slate-50 border border-slate-150 rounded px-2 py-1 text-slate-600 mt-1 font-mono break-all leading-relaxed">
                            {dbUrl}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Seu CRM utiliza Drizzle ORM para ler e gravar dados em tempo real no Supabase. Se desconectado, o sistema opera em modo de demonstração com persistência local.
                      </p>
                    </div>
                  </div>

                  {/* Migrations panel */}
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[250px]">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geração de Tabelas &amp; Migrations</p>
                          <h4 className="text-sm font-bold text-slate-800 mt-1">Sincronizar Estrutura do Banco</h4>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0",
                          dbMigrationStatus === 'migrated' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {dbMigrationStatus === 'migrated' ? 'Tabelas Criadas' : 'Migrations Pendentes'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Este processo executa as instruções SQL geradas pelo Drizzle para criar todas as tabelas necessárias (<code className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">contacts</code>, <code className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">tasks</code>, <code className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">opportunities</code>, etc.) no seu banco de dados Supabase e insere os dados iniciais do CRM.
                      </p>

                      {migrationSuccess && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Migrations concluídas com sucesso!</p>
                            <p className="mt-0.5 text-emerald-700">O banco de dados do Supabase foi provisionado, tabelas criadas e os dados iniciais importados com sucesso.</p>
                          </div>
                        </div>
                      )}

                      {migrationError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-150 text-red-800 rounded-xl text-xs flex gap-2.5 items-start">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Erro ao executar as migrations:</p>
                            <code className="block bg-red-100/50 p-2 rounded mt-1 text-[10px] font-mono border border-red-100 text-red-700 break-all leading-normal whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {migrationError}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
                        Dica: Certifique-se de que sua conexão de banco de dados no Supabase esteja configurada como Modo de Sessão ou de Transações direta.
                      </p>
                      <button
                        onClick={runDbMigrations}
                        disabled={isMigrating || dbStatus === 'not_configured'}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        {isMigrating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Executando...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Executar Migrations</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integration Guide / Tutorial */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-500" />
                    Guia Passo-a-Passo de Integração
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 pt-2">
                    <div className="space-y-2 border-r border-slate-100 pr-0 md:pr-4 last:border-0 last:pr-0">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] text-blue-600">1</span>
                        <span>Copiar Connection String</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 pl-7">
                        No painel do Supabase, vá em <strong>Project Settings &gt; Database</strong>. Role até <strong>Connection string &gt; URI</strong> e copie a URL completa. Lembre-se de substituir o placeholder da senha por sua senha real.
                      </p>
                    </div>

                    <div className="space-y-2 border-r border-slate-100 pr-0 md:pr-4 last:border-0 last:pr-0">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] text-blue-600">2</span>
                        <span>Configurar Variável de Ambiente</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 pl-7">
                        Abra o menu de <strong>Secrets/Settings</strong> do AI Studio (no canto superior direito), adicione uma chave chamada <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">DATABASE_URL</code> e cole o endereço copiado.
                      </p>
                    </div>

                    <div className="space-y-2 border-r border-slate-100 pr-0 md:pr-4 last:border-0 last:pr-0">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] text-blue-600">3</span>
                        <span>Executar Migrations</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 pl-7">
                        Clique no botão acima <strong>&quot;Executar Migrations&quot;</strong> para criar automaticamente todas as tabelas e dados fictícios no seu Supabase. O status mudará para <strong className="text-emerald-600">Conectado</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* --- ADD ENTRY / NEW LEAD INTERACTIVE DIALOG MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[calc(100%-2rem)] max-w-md relative z-10 overflow-hidden text-slate-800 mx-4"
            >
              {/* Form Category header selection tabs */}
              <div className="bg-slate-50 border-b border-slate-150 p-4 flex justify-between items-center">
                <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100">
                  <button
                    onClick={() => setFormType('contact')}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-bold transition-all",
                      formType === 'contact' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    Contact/Lead
                  </button>
                  <button
                    onClick={() => setFormType('opportunity')}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-bold transition-all",
                      formType === 'opportunity' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    Opportunity Deal
                  </button>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic form switch */}
              <div className="p-6">
                {formType === 'contact' ? (
                  <form onSubmit={handleAddContact} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Jane Doe"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</label>
                        <input
                          type="text"
                          value={contactForm.role}
                          onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                          placeholder="e.g. VP Engineering"
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.company}
                          onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                          placeholder="e.g. Global Tech"
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                        <select
                          value={contactForm.status}
                          onChange={(e) => setContactForm({ ...contactForm, status: e.target.value as any })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                        <select
                          value={contactForm.type}
                          onChange={(e) => setContactForm({ ...contactForm, type: e.target.value as any })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Customer">Customer</option>
                          <option value="Partner">Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal Value ($)</label>
                      <input
                        type="number"
                        value={contactForm.dealValue}
                        onChange={(e) => setContactForm({ ...contactForm, dealValue: e.target.value })}
                        placeholder="e.g. 50000"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="name@email.com"
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                        <input
                          type="text"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 mt-2"
                    >
                      Save New Contact
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAddOpportunity} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company *</label>
                      <input
                        type="text"
                        required
                        value={opportunityForm.company}
                        onChange={(e) => setOpportunityForm({ ...opportunityForm, company: e.target.value })}
                        placeholder="e.g. NovaSoft Corp"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={opportunityForm.contact}
                        onChange={(e) => setOpportunityForm({ ...opportunityForm, contact: e.target.value })}
                        placeholder="e.g. Jessica Wu"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal Value ($)</label>
                        <input
                          type="number"
                          value={opportunityForm.dealValue}
                          onChange={(e) => setOpportunityForm({ ...opportunityForm, dealValue: e.target.value })}
                          placeholder="e.g. 80000"
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage</label>
                        <select
                          value={opportunityForm.stage}
                          onChange={(e) => setOpportunityForm({ ...opportunityForm, stage: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                        >
                          <option value="Discovery">Discovery</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Probability</span>
                        <span className="text-blue-600">{opportunityForm.probability}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={opportunityForm.probability}
                        onChange={(e) => setOpportunityForm({ ...opportunityForm, probability: Number(e.target.value) })}
                        className="w-full accent-blue-600 bg-slate-100 h-2 rounded-full cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 mt-2"
                    >
                      Create Opportunity Deal
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONTACT DETAIL VIEW SLIDE-OVER DRAWER --- */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Slide over Container */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl relative"
              >
                {/* Header card info */}
                <div className="p-6 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Contact Profile</span>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile card section */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-slate-800">
                  {isEditingContact && contactEditForm ? (
                    <form onSubmit={handleUpdateContact} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name *</label>
                        <input
                          type="text"
                          required
                          value={contactEditForm.name}
                          onChange={(e) => setContactEditForm({ ...contactEditForm, name: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</label>
                          <input
                            type="text"
                            value={contactEditForm.role}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, role: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company *</label>
                          <input
                            type="text"
                            required
                            value={contactEditForm.company}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, company: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                          <select
                            value={contactEditForm.status}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, status: e.target.value as any })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                          >
                            <option value="Lead">Lead</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                          <select
                            value={contactEditForm.type}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, type: e.target.value as any })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                          >
                            <option value="Lead">Lead</option>
                            <option value="Customer">Customer</option>
                            <option value="Partner">Partner</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal Value ($)</label>
                        <input
                          type="number"
                          value={contactEditForm.dealValue}
                          onChange={(e) => setContactEditForm({ ...contactEditForm, dealValue: Number(e.target.value) || 0 })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                          <input
                            type="email"
                            value={contactEditForm.email}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, email: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                          <input
                            type="text"
                            value={contactEditForm.phone}
                            onChange={(e) => setContactEditForm({ ...contactEditForm, phone: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(false)}
                          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col items-center text-center">
                        {selectedContact.avatar ? (
                          <div className="w-20 h-20 rounded-full overflow-hidden relative shadow-md bg-slate-100 border-2 border-white ring-4 ring-slate-100">
                            <Image
                              src={selectedContact.avatar}
                              alt={selectedContact.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">
                            {selectedContact.initials}
                          </div>
                        )}

                        <h4 className="text-lg font-bold text-slate-900 mt-4 leading-none">{selectedContact.name}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-1.5">{selectedContact.role}</p>

                        <span className="mt-3.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100/30">
                          {selectedContact.type}
                        </span>
                      </div>

                      {/* Core detail attributes matrix */}
                      <div className="space-y-4 border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Company</span>
                          <span className="font-semibold text-slate-800">{selectedContact.company}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Email</span>
                          <a href={`mailto:${selectedContact.email}`} className="font-semibold text-blue-600 hover:underline">{selectedContact.email}</a>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Phone</span>
                          <span className="font-semibold text-slate-800">{selectedContact.phone}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            selectedContact.status === 'Active'
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : selectedContact.status === 'Lead'
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {selectedContact.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Deal Value</span>
                          <span className="font-bold text-slate-900 text-sm">
                            ${selectedContact.dealValue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="pt-6 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => {
                            // Quick log call
                            logNewActivity(
                              'call',
                              `Logged custom phone call with ${selectedContact.name}`,
                              `Talked about proposal timeline details.`
                            );
                            setSelectedContact(null);
                          }}
                          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 font-bold text-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Call
                        </button>
                        <button
                          onClick={() => {
                            setContactEditForm({ ...selectedContact });
                            setIsEditingContact(true);
                          }}
                          className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 rounded-lg transition-colors flex items-center justify-center gap-1 font-bold text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContact(selectedContact.id)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 border border-red-200/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
