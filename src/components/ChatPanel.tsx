'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline';

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
          
          // Check if this message already exists (from optimistic update)
          setMessages(prev => {
            const messageExists = prev.some(msg => 
              msg.body === newMessage.body && 
              msg.sender_id === newMessage.sender_id &&
              Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000 // Within 5 seconds
            );
            
            if (messageExists) {
              // Replace the optimistic message with the real one
              return prev.map(msg => 
                msg.body === newMessage.body && 
                msg.sender_id === newMessage.sender_id &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000
                  ? { ...newMessage, sender: msg.sender } // Keep existing sender info
                  : msg
              );
            }
            
            // If it's a new message, fetch sender info
            const fetchSenderInfo = async () => {
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

                setMessages(prevMsgs => [...prevMsgs, messageWithSender]);
              } catch (error) {
                console.error('Error fetching sender for new message:', error);
                const messageWithSender = {
                  ...newMessage,
                  sender: { full_name: 'Unknown' }
                };
                setMessages(prevMsgs => [...prevMsgs, messageWithSender]);
              }
            };
            
            fetchSenderInfo();
            return prev; // Return current state while fetching
          });
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
    const messageText = newMessage.trim();
    
    // Optimistically add the message to the UI immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      body: messageText,
      created_at: new Date().toISOString(),
      sender_id: user.id,
      receiver_id: '', // Will be set below
      sender: {
        full_name: user.user_metadata?.full_name || user.email || 'You'
      }
    };

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

      // Update the optimistic message with the correct receiver
      optimisticMessage.receiver_id = receiverId;

      // Add the optimistic message to the UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Clear the input immediately for better UX
      setNewMessage('');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          product_id: productId,
          sender_id: user.id,
          receiver_id: receiverId,
          body: messageText,
        })
        .select();

      if (error) {
        // Remove the optimistic message if the real send failed
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw new Error(`Supabase Error: ${error.message || 'Unknown error'}`);
      }

      // The real-time subscription will handle updating the message with the real ID
      // We could also update the optimistic message with the real ID here if needed
      
    } catch (error) {
      // Restore the input if there was an error
      setNewMessage(messageText);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-emerald-200 mb-6 text-lg">Sign in to start a conversation</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
          >
            Sign In
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-emerald-500/20 shadow-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isCurrentUserSeller ? `Messages for your listing` : `Chat with ${sellerName}`}
            </h3>
            <p className="text-sm text-emerald-200">
              {isCurrentUserSeller 
                ? 'Respond to inquiries about your product' 
                : `Discuss ${sellerName}'s product`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/20 to-slate-800/20">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-emerald-200">Loading messages...</div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PaperAirplaneIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-emerald-200 mb-2 font-medium">No messages yet</p>
                <p className="text-sm text-emerald-300">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    {!isOwnMessage && (
                      <p className="text-xs text-emerald-300 mb-1 px-2 font-medium">
                        {message.sender.full_name || 'Unknown'}
                      </p>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-4 py-3 rounded-2xl shadow-lg ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-slate-700/80 text-emerald-100 border border-emerald-500/20'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.body}</p>
                      <p
                        className={`text-xs mt-2 ${
                          isOwnMessage ? 'text-emerald-100' : 'text-emerald-400'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-emerald-500/20 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              disabled={sending}
            />
            <motion.button
              type="submit"
              disabled={!newMessage.trim() || sending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
