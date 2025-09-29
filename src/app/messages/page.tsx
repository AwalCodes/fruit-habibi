'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading conversations...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">
              <h3 className="text-lg font-medium">Error loading messages</h3>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">
            Your conversations with buyers and suppliers
          </p>
          
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">
                Start conversations by browsing listings and contacting suppliers
              </p>
              <Link
                href="/listings"
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <Link
                  key={`${conversation.product_id}-${conversation.other_user_id}`}
                  href={`/listing/${conversation.product_id}?chat=true`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {conversation.product_title}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          with {conversation.other_user_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {conversation.last_message}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          {formatTime(conversation.last_message_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
