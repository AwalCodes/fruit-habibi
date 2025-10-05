'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import DirectMessageModal from '@/components/DirectMessageModal';
import { 
  ShoppingBagIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  total_amount_usd: number;
  order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shipping_address: any;
  notes: string;
  created_at: string;
  updated_at: string;
  // Foreign key data will be fetched separately if needed
}

const statusConfig = {
  pending: {
    label: 'Pending Payment',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20 border-yellow-500/30',
    icon: ClockIcon
  },
  paid: {
    label: 'Payment Received',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
    icon: CheckCircleIcon
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20 border-purple-500/30',
    icon: TruckIcon
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
    icon: CheckCircleIcon
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/30',
    icon: XCircleIcon
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20 border-gray-500/30',
    icon: XCircleIcon
  }
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching orders:', fetchError);
        console.error('Error details:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint
        });
        
        // Check if it's a table not found error
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setError('Orders table not found. Please run the database migrations first.');
        } else {
          setError(`Failed to load orders: ${fetchError.message}`);
        }
        return;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'buying') return order.buyer_id === user?.id;
    if (activeTab === 'selling') return order.seller_id === user?.id;
    return true;
  });

  const getOrderType = (order: Order) => {
    if (order.buyer_id === user?.id) return 'buying';
    return 'selling';
  };

  const getOtherParty = (order: Order) => {
    if (order.buyer_id === user?.id) {
      return 'Seller';
    }
    return 'Buyer';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-emerald-200"
        >
          Loading orders...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  My Orders
                </h1>
                <p className="text-emerald-200 mt-1">
                  Manage your purchases and sales
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <XCircleIcon className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {/* Success Message */}
        {searchParams?.get('success') === 'true' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-semibold">Payment Successful!</h3>
                <p className="text-emerald-200 text-sm">
                  Your order has been confirmed and payment received.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-200 hover:bg-emerald-500/20'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'buying'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-200 hover:bg-emerald-500/20'
              }`}
            >
              Buying ({orders.filter(o => o.buyer_id === user?.id).length})
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'selling'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-200 hover:bg-emerald-500/20'
              }`}
            >
              Selling ({orders.filter(o => o.seller_id === user?.id).length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-12 text-center">
            <ShoppingBagIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'all' ? 'No Orders Found' : 
               activeTab === 'buying' ? 'No Purchases Yet' : 'No Sales Yet'}
            </h3>
            <p className="text-emerald-200 mb-6">
              {activeTab === 'buying' 
                ? 'Start shopping to see your orders here.' 
                : activeTab === 'selling'
                ? 'Create listings to start selling and see orders here.'
                : 'Your orders will appear here once you start buying or selling.'}
            </p>
            <Link
              href="/listings"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.order_status];
              const StatusIcon = statusInfo.icon;
              const orderType = getOrderType(order);
              const otherParty = getOtherParty(order);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 hover:border-emerald-500/30 transition-all duration-200"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <ShoppingBagIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-emerald-300">
                          Product ID: {order.product_id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${statusInfo.bgColor}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-emerald-300">Type:</span>
                      <span className={`text-sm font-medium ${orderType === 'buying' ? 'text-blue-400' : 'text-green-400'}`}>
                        {orderType === 'buying' ? '🛒 Buying' : '💰 Selling'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300">With:</span>
                      <span className="text-white">{otherParty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300">Quantity:</span>
                      <span className="text-white">{order.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300">Total:</span>
                      <span className="text-yellow-400 font-semibold">
                        ${order.total_amount_usd.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300">Date:</span>
                      <span className="text-white">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-center flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowMessageModal(true);
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                    {order.order_status !== 'cancelled' && (
                      <Link
                        href={`/disputes?create=${order.id}`}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Message Modal */}
      {selectedOrder && (
        <DirectMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedOrder(null);
          }}
          recipientId={selectedOrder.buyer_id === user?.id ? selectedOrder.seller_id : selectedOrder.buyer_id}
          recipientName={selectedOrder.buyer_id === user?.id ? 'Seller' : 'Buyer'}
          productId={selectedOrder.product_id}
          orderId={selectedOrder.id}
        />
      )}
    </div>
  );
}
