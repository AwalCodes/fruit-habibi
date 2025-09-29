'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  sender: {
    id: string;
    full_name: string;
    email: string;
  };
  receiver: {
    id: string;
    full_name: string;
    email: string;
  };
  products: {
    id: string;
    title: string;
  };
}

export default function MessageMonitoring() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.user_metadata?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortMessages();
  }, [messages, searchTerm, sortBy]);

  const fetchMessages = async () => {
    try {
      setPageLoading(true);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, email),
          receiver:receiver_id(id, full_name, email),
          products:product_id(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const filterAndSortMessages = () => {
    let filtered = [...messages];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.receiver?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.products?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    setFilteredMessages(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading message monitoring...</div>
      </div>
    );
  }

  if (!user || user.user_metadata?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                        Admin
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="text-gray-400">/</span>
                        <span className="ml-4 text-gray-900">Message Monitoring</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Message Monitoring</h1>
                <p className="mt-2 text-gray-600">
                  Monitor conversations and detect potential abuse
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  {filteredMessages.length} Messages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Messages
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by content, users, or products..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('newest');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Message from {message.sender?.full_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      to {message.receiver?.full_name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(message.created_at)}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-900 bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                  "{message.content}"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    <span>Product: {message.products?.title || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>Sender: {message.sender?.email || 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/listing/${message.product_id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Product
                  </Link>
                  <button
                    onClick={() => {
                      // TODO: Implement message flagging
                      console.log('Flag message:', message.id);
                    }}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Flag
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
