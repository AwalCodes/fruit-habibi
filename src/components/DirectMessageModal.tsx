'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  productId?: string;
  orderId?: string;
}

export default function DirectMessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  productId,
  orderId
}: DirectMessageModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: recipientId,
          product_id: productId || null,
          body: message.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setIsSent(true);
      setMessage('');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative transform overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm shadow-2xl border border-slate-600/30 w-full max-w-md"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-6 py-4 border-b border-slate-600/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                      Send Message
                    </h3>
                    <p className="text-sm text-emerald-200">
                      To: {recipientName}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-emerald-300 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Message Sent!</h4>
                    <p className="text-emerald-200">Your message has been delivered.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSend} className="space-y-4">
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-emerald-200 mb-2">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        rows={4}
                        required
                      />
                    </div>

                    {/* Context info */}
                    {(productId || orderId) && (
                      <div className="text-xs text-emerald-300 bg-slate-700/30 p-3 rounded-lg">
                        {productId && <p>Related to Product ID: {productId.slice(-8)}</p>}
                        {orderId && <p>Related to Order ID: {orderId.slice(-8)}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-emerald-300 hover:text-white transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
