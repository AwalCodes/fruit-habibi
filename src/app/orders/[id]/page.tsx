'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DirectMessageModal from '@/components/DirectMessageModal';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  total_amount_usd: number;
  commission_amount_usd: number;
  order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  stripe_payment_intent_id?: string;
  shipping_address: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: {
    label: 'Pending Payment',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: ClockIcon,
  },
  paid: {
    label: 'Paid',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: CheckCircleIcon,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: TruckIcon,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: XCircleIcon,
  },
  disputed: {
    label: 'Disputed',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: ExclamationTriangleIcon,
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    icon: CurrencyDollarIcon,
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const orderId = params.id as string;
  const isSuccess = searchParams?.get('success') === 'true';

  useEffect(() => {
    if (!authLoading && !user) {
      setError('Please sign in to view order details');
      setLoading(false);
      return;
    }

    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user, authLoading]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Check if user has access to this order
      if (data.buyer_id !== user?.id && data.seller_id !== user?.id) {
        throw new Error('Access denied');
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-emerald-200">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 p-8 text-center max-w-md mx-4"
        >
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-emerald-200 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-yellow-500/25"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-lg text-emerald-200">Order not found</div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.order_status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const isBuyer = user?.id === order.buyer_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {isSuccess && order.status === 'paid' && (
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-8 py-6 border-b border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Order #{order.id.slice(-8)}
                </h1>
                <p className="text-emerald-200 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${statusInfo.bgColor}`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                <span className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Order Details */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Information */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
                <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🥭</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        Product ID: {order.product_id.slice(-8)}
                      </h3>
                      <p className="text-emerald-200">
                        Quantity: {order.quantity} items
                      </p>
                      <p className="text-emerald-200">
                        Unit Price: ${order.unit_price_usd.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                <div className="bg-slate-700/30 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between text-emerald-200">
                    <span>Subtotal:</span>
                    <span className="text-white">${(order.unit_price_usd * order.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Shipping:</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Commission:</span>
                    <span className="text-white">-${order.commission_amount_usd.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-yellow-400">Total Paid:</span>
                      <span className="text-yellow-400">${order.total_amount_usd.toFixed(2)}</span>
                    </div>
                    {isBuyer && (
                      <div className="flex justify-between text-sm text-emerald-300 mt-1">
                        <span>Seller receives:</span>
                        <span>${(order.total_amount_usd - order.commission_amount_usd).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping_address && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="text-emerald-200">
                    <p className="font-medium text-white">{order.shipping_address.name || 'Demo User'}</p>
                    <p>{order.shipping_address.address || '123 Demo Street'}</p>
                    <p>{order.shipping_address.city || 'Demo City'}, {order.shipping_address.country || 'Demo Country'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {order.tracking_number && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Tracking Information</h2>
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <TruckIcon className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Tracking Number: {order.tracking_number}</p>
                      {order.estimated_delivery && (
                        <p className="text-emerald-200">
                          Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {isBuyer ? 'Seller Information' : 'Buyer Information'}
              </h2>
              <div className="bg-slate-700/30 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{isBuyer ? 'Seller' : 'Buyer'}</p>
                    <p className="text-emerald-200">User ID: {isBuyer ? order.seller_id.slice(-8) : order.buyer_id.slice(-8)}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-yellow-500/25"
                    >
                      Send Message
                    </button>
                    {order.order_status !== 'cancelled' && (
                      <Link
                        href={`/disputes?create=${order.id}`}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/25"
                      >
                        Report Dispute
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Direct Message Modal */}
      {order && (
        <DirectMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientId={isBuyer ? order.seller_id : order.buyer_id}
          recipientName={isBuyer ? 'Seller' : 'Buyer'}
          productId={order.product_id}
          orderId={order.id}
        />
      )}
    </div>
  );
}

