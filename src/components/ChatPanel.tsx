'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender: {
    full_name: string;
  };
}

interface ChatPanelProps {
  productId: string;
  sellerId: string;
  sellerName: string;
}

export default function ChatPanel({ productId, sellerId, sellerName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Determine if current user is the seller
  const isCurrentUserSeller = user?.id === sellerId;

  useEffect(() => {
    if (!user) return;

    fetchMessages();
    subscribeToMessages();
  }, [user, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Get messages where the current user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('product_id', productId)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      
      // Fetch sender information
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', senderIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Still show messages but with "Unknown" sender
        setMessages(messagesData.map(msg => ({
          ...msg,
          sender: { full_name: 'Unknown' }
        })));
      } else {
        // Combine messages with sender info
        const messagesWithSenders = messagesData.map(msg => {
          const sender = usersData?.find(u => u.id === msg.sender_id);
          return {
            ...msg,
            sender: { full_name: sender?.full_name || 'Unknown' }
          };
        });
        setMessages(messagesWithSenders);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `product_id=eq.${productId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Only show the message if the current user is the sender or receiver
          if (newMessage.sender_id !== user?.id && newMessage.receiver_id !== user?.id) {
            return;
          }
          
          // Fetch sender info for the new message
          try {
            const { data: senderData, error: senderError } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', newMessage.sender_id)
              .single();

            const messageWithSender = {
              ...newMessage,
              sender: { 
                full_name: senderError ? 'Unknown' : senderData.full_name 
              }
            };

            setMessages(prev => [...prev, messageWithSender]);
          } catch (error) {
            console.error('Error fetching sender for new message:', error);
            const messageWithSender = {
              ...newMessage,
              sender: { full_name: 'Unknown' }
            };
            setMessages(prev => [...prev, messageWithSender]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      // Validate inputs
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      if (!productId) {
        throw new Error('Product ID is missing');
      }
      if (!sellerId) {
        throw new Error('Seller ID is missing');
      }


      // Determine the receiver: if current user is seller, find a buyer from existing messages
      // If current user is buyer, receiver is the seller
      let receiverId = sellerId;
      
      if (isCurrentUserSeller) {
        // If seller is sending, find a buyer from existing messages for this product
        const buyerMessage = messages.find(msg => msg.sender_id !== sellerId);
        if (buyerMessage) {
          receiverId = buyerMessage.sender_id;
        } else {
          // If no existing messages, we can't determine the buyer
          // This shouldn't happen in normal flow, but let's handle it gracefully
          throw new Error('Cannot send message: no buyer found for this conversation');
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          product_id: productId,
          sender_id: user.id,
          receiver_id: receiverId,
          body: newMessage.trim(),
        })
        .select();


      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw new Error(`Supabase Error: ${error.message || 'Unknown error'}`);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sign in to start a conversation</p>
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {isCurrentUserSeller ? `Messages for your listing` : `Chat with ${sellerName}`}
        </h3>
        <p className="text-sm text-gray-500">
          {isCurrentUserSeller 
            ? 'Respond to inquiries about your product' 
            : `Discuss ${sellerName}'s product`
          }
        </p>
      </div>

      <div className="h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-500 mb-1 px-1">
                        {message.sender.full_name || 'Unknown'}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
