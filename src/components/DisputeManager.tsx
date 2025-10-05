'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { disputeService, Dispute, DisputeMessage, DisputeAction } from '@/lib/disputes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  PlusIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface DisputeManagerProps {
  orderId?: string;
  onClose?: () => void;
}

export default function DisputeManager({ orderId, onClose }: DisputeManagerProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const createOrderId = searchParams.get('create');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [actions, setActions] = useState<DisputeAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disputes' | 'create' | 'details'>('disputes');
  
  // Create dispute form
  const [createForm, setCreateForm] = useState({
    disputeType: 'quality_issue' as Dispute['dispute_type'],
    title: '',
    description: '',
    priority: 'medium' as Dispute['priority'],
    evidenceUrls: [] as string[]
  });
  
  // Message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadUserDisputes();
    }
  }, [user]);

  useEffect(() => {
    if (createOrderId) {
      setActiveTab('create');
    }
  }, [createOrderId]);

  useEffect(() => {
    if (selectedDispute) {
      loadDisputeDetails();
    }
  }, [selectedDispute]);

  const loadUserDisputes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await disputeService.getUserDisputes(user.id);
      if (result.data) {
        setDisputes(result.data);
      } else if (result.error) {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load disputes' });
    } finally {
      setLoading(false);
    }
  };

  const loadDisputeDetails = async () => {
    if (!selectedDispute) return;

    try {
      const [messagesResult, actionsResult] = await Promise.all([
        disputeService.getDisputeMessages(selectedDispute.id),
        disputeService.getDisputeActions(selectedDispute.id)
      ]);

      if (messagesResult.data) setMessages(messagesResult.data);
      if (actionsResult.data) setActions(actionsResult.data);
    } catch (error) {
      console.error('Error loading dispute details:', error);
    }
  };

  const createDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetOrderId = createOrderId || orderId;
    if (!targetOrderId) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await disputeService.createDispute(
        targetOrderId,
        createForm.disputeType,
        createForm.title,
        createForm.description,
        createForm.evidenceUrls,
        createForm.priority
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Dispute created successfully!' });
        setCreateForm({
          disputeType: 'quality_issue',
          title: '',
          description: '',
          priority: 'medium',
          evidenceUrls: []
        });
        setActiveTab('disputes');
        loadUserDisputes();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create dispute' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create dispute' });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const result = await disputeService.sendDisputeMessage(
        selectedDispute.id,
        newMessage.trim()
      );

      if (result.success) {
        setNewMessage('');
        loadDisputeDetails();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send message' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send message' });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
      case 'escalated':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'under_review':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'resolved':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'closed':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'escalated':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-green-400 bg-green-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/20';
      case 'urgent':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading && disputes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-emerald-200"
        >
          Loading disputes...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Dispute Resolution
                </h1>
                <p className="text-emerald-200">Manage and resolve order disputes professionally</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-emerald-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'disputes'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-200 hover:bg-emerald-500/20'
              }`}
            >
              My Disputes ({disputes.length})
            </button>
            {(orderId || createOrderId) && (
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-emerald-500 text-white'
                    : 'text-emerald-200 hover:bg-emerald-500/20'
                }`}
              >
                Create Dispute
              </button>
            )}
            {selectedDispute && (
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'details'
                    ? 'bg-emerald-500 text-white'
                    : 'text-emerald-200 hover:bg-emerald-500/20'
                }`}
              >
                Dispute Details
              </button>
            )}
          </div>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-lg flex items-center gap-3 border mb-6 ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-200 border-red-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'disputes' && (
            <motion.div
              key="disputes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {disputes.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-12 text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Disputes Found</h3>
                  <p className="text-emerald-200 mb-6">
                    You haven't been involved in any disputes yet. Disputes will appear here when created.
                  </p>
                  {(orderId || createOrderId) && (
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                    >
                      Create Your First Dispute
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {disputes.map((dispute) => (
                    <motion.div
                      key={dispute.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setActiveTab('details');
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(dispute.status)}
                          <div>
                            <h3 className="text-lg font-semibold text-white">{dispute.title}</h3>
                            <p className="text-sm text-emerald-300">
                              {dispute.orders?.products?.title || 'Order Dispute'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-emerald-200 text-sm mb-4 line-clamp-2">
                        {dispute.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-emerald-300">
                        <span>
                          {dispute.initiator_id === user?.id ? 'You initiated' : 'Filed against you'}
                        </span>
                        <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-center mt-4">
                        <ArrowRightIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'create' && (orderId || createOrderId) && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Dispute</h2>
                
                <form onSubmit={createDispute} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Dispute Type *
                      </label>
                      <select
                        value={createForm.disputeType}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, disputeType: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="quality_issue">Quality Issue</option>
                        <option value="delivery_problem">Delivery Problem</option>
                        <option value="payment_dispute">Payment Dispute</option>
                        <option value="communication_issue">Communication Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Priority *
                      </label>
                      <select
                        value={createForm.priority}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Dispute Title *
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide detailed information about the issue, including what happened, when it occurred, and how it affects you..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('disputes')}
                      className="px-6 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? 'Creating Dispute...' : 'Create Dispute'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && selectedDispute && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispute Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedDispute.title}</h2>
                        <div className="flex items-center gap-3 mb-4">
                          {getStatusIcon(selectedDispute.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDispute.status)}`}>
                            {selectedDispute.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                            {selectedDispute.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('disputes')}
                        className="text-emerald-400 hover:text-white transition-colors"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-emerald-200">{selectedDispute.description}</p>
                      </div>
                      
                      {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Evidence</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedDispute.evidence_urls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-700/50 rounded-lg text-emerald-200 hover:bg-slate-600/50 transition-colors text-sm"
                              >
                                Evidence {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedDispute.resolution_notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Resolution Notes</h3>
                          <p className="text-emerald-200">{selectedDispute.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Dispute Communication
                    </h3>
                    
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-emerald-500/20 ml-8'
                              : 'bg-slate-700/50 mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {msg.sender?.full_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-emerald-300">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-emerald-200 text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                    
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sendingMessage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <PaperAirplaneIcon className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-emerald-300">Product:</span>
                        <p className="text-white">{selectedDispute.orders?.products?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-emerald-300">Amount:</span>
                        <p className="text-white">${selectedDispute.orders?.total_amount_usd?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-emerald-300">Created:</span>
                        <p className="text-white">{new Date(selectedDispute.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Parties Involved</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-emerald-300">Initiator:</span>
                        <p className="text-white">{selectedDispute.initiator?.full_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-emerald-300">Respondent:</span>
                        <p className="text-white">{selectedDispute.respondent?.full_name || 'Unknown'}</p>
                      </div>
                      {selectedDispute.resolver && (
                        <div>
                          <span className="text-sm text-emerald-300">Resolved by:</span>
                          <p className="text-white">{selectedDispute.resolver.full_name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      Dispute History
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {actions.map((action) => (
                        <div key={action.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {action.action_type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-emerald-300">
                              {new Date(action.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-200">{action.description}</p>
                          <p className="text-xs text-emerald-300 mt-1">
                            by {action.performer?.full_name || 'System'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
