'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import ChatPanel from '@/components/ChatPanel';

interface Conversation {
  product_id: string;
  product_title: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}


export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatProductId, setChatProductId] = useState<string | null>(null);
  const [chatOtherUserId, setChatOtherUserId] = useState<string | null>(null);
  const [chatOtherUserName, setChatOtherUserName] = useState<string | null>(null);
  const [chatProductTitle, setChatProductTitle] = useState<string | null>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select conversation based on URL parameters
  useEffect(() => {
    const productId = searchParams.get('product_id');
    const otherUserId = searchParams.get('other_user_id');
    
    if (productId && otherUserId && conversations.length > 0) {
      const conversationKey = `${productId}-${otherUserId}`;
      setSelectedConversation(conversationKey);
      setShowChatPanel(true);
      setChatProductId(productId);
      setChatOtherUserId(otherUserId);
      
      // Fetch chat details
      fetchChatDetails(productId, otherUserId);
    }
  }, [searchParams, conversations]);

  const handleConversationClick = async (productId: string, otherUserId: string) => {
    const conversationKey = `${productId}-${otherUserId}`;
    setSelectedConversation(conversationKey);
    setShowChatPanel(true);
    setChatProductId(productId);
    setChatOtherUserId(otherUserId);
    
    // Fetch user and product details
    await fetchChatDetails(productId, otherUserId);
  };

  const fetchChatDetails = async (productId: string, userId: string) => {
    try {
      // Fetch user details
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single();

      // Fetch product details
      const { data: productData } = await supabase
        .from('products')
        .select('title')
        .eq('id', productId)
        .single();

      setChatOtherUserName(userData?.full_name || 'Unknown User');
      setChatProductTitle(productData?.title || 'Unknown Product');
    } catch (error) {
      console.error('Error fetching chat details:', error);
      setChatOtherUserName('Unknown User');
      setChatProductTitle('Unknown Product');
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get messages where user is either sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      if (!messages || messages.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get unique product IDs
      const productIds = [...new Set(messages.map(m => m.product_id))];
      
      // Get product details
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Get user details for senders and receivers
      const userIds = [...new Set([
        ...messages.map(m => m.sender_id),
        ...messages.map(m => m.receiver_id)
      ])];
      
      // Force fresh data by adding a cache-busting parameter
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Debug: Check what users we found
      console.log('Users found after SQL fix:', users?.map(u => ({ id: u.id, name: u.full_name })));

      // Group messages by product + other user combination
      const conversationMap = new Map();
      
      messages.forEach((message) => {
        const productId = message.product_id;
        const product = products?.find(p => p.id === productId);
        const isSender = message.sender_id === user.id;
        const otherUserId = isSender ? message.receiver_id : message.sender_id;
        const otherUser = users?.find(u => u.id === otherUserId);
        
        console.log('Processing message:', {
          messageId: message.id,
          otherUserId,
          otherUser,
          userName: otherUser ? otherUser.full_name : 'NOT FOUND'
        });
        
        // Create a unique key for each product + user conversation
        const conversationKey = `${productId}-${otherUserId}`;
        
        // Use cleaner fallback name if user not found
        const userName = otherUser ? otherUser.full_name : 'Unknown User';
        
        if (product && (!conversationMap.has(conversationKey) || 
            new Date(message.created_at) > new Date(conversationMap.get(conversationKey).last_message_time))) {
          conversationMap.set(conversationKey, {
            product_id: productId,
            product_title: product.title,
            other_user_id: otherUserId,
            other_user_name: userName,
            last_message: message.body,
            last_message_time: message.created_at,
            unread_count: 0, // We'll implement this later with proper tracking
          });
        }
      });

          const conversationsArray = Array.from(conversationMap.values());
          setConversations(conversationsArray);
        } catch (error) {
          console.error('Error fetching conversations:', error);
          setError(error instanceof Error ? error.message : 'Failed to load conversations');
        } finally {
          setLoading(false);
        }
      };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-emerald-100 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              Loading premium conversations...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-400/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-red-100">
              <h3 className="text-lg font-medium">Error loading messages</h3>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8 relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 drop-shadow-lg">
            Premium Messages
          </h1>
          <p className="text-xl text-emerald-100 leading-relaxed">
            Your luxury conversations with buyers and premium suppliers
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-12 shadow-2xl">
            <div className="text-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-400 text-8xl mb-6"
              >
                💬
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">No Premium Conversations Yet</h3>
              <p className="text-emerald-100 mb-8 leading-relaxed">
                Start luxury conversations by browsing premium listings and contacting verified suppliers
              </p>
              <Link
                href="/listings"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-3 mx-auto w-fit"
              >
                ✨ Browse Premium Listings
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 shadow-2xl overflow-hidden">
            <div className="divide-y divide-yellow-400/20">
              {conversations.map((conversation) => (
                <div
                  key={`${conversation.product_id}-${conversation.other_user_id}`}
                  onClick={() => handleConversationClick(conversation.product_id, conversation.other_user_id)}
                  className={`block hover:bg-emerald-800/30 transition-all duration-300 cursor-pointer ${
                    selectedConversation === `${conversation.product_id}-${conversation.other_user_id}` 
                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-r-4 border-yellow-400' 
                      : ''
                  }`}
                >
                  <div className="p-6 relative">
                    {/* Gemstone Badge */}
                    <div className="absolute top-4 right-4 text-xl">💎</div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-white truncate">
                            {conversation.product_title}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-300 mt-1">
                          with {conversation.other_user_name}
                        </p>
                        <p className="text-sm text-emerald-100 mt-2 line-clamp-2 leading-relaxed">
                          {conversation.last_message}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-sm text-yellow-300 font-medium">
                          {formatTime(conversation.last_message_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Panel */}
        {showChatPanel && chatProductId && chatOtherUserId && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-yellow-400/30">
              <div className="flex justify-between items-center p-6 border-b border-yellow-400/20 bg-gradient-to-r from-emerald-900/50 to-slate-900/50 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">💬 Chat with {chatOtherUserName || 'Unknown User'}</h2>
                  <p className="text-emerald-200 mt-1">Discuss {chatProductTitle || 'Unknown Product'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowChatPanel(false);
                    setSelectedConversation(null);
                    setChatProductId(null);
                    setChatOtherUserId(null);
                    setChatOtherUserName(null);
                    setChatProductTitle(null);
                  }}
                  className="text-emerald-200 hover:text-yellow-300 transition-colors p-2 hover:bg-emerald-800/50 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                <ChatPanel
                  productId={chatProductId}
                  sellerId={chatOtherUserId}
                  sellerName={chatOtherUserName || 'Unknown User'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
