'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // ADDED

interface MockPaymentFormProps {
  productId: string;
  quantity: number;
  unitPrice: number;
  sellerName: string;
  productTitle: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function MockPaymentForm({
  productId,
  quantity,
  unitPrice,
  sellerName,
  productTitle,
  onSuccess,
  onError,
  onCancel,
}: MockPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [expiry, setExpiry] = useState('12/25');
  const [cvc, setCvc] = useState('123');
  const { user } = useAuth();

  const subtotal = unitPrice * quantity;
  const shippingCost = 0;
  const total = subtotal + shippingCost;
  const commission = total * 0.05;
  const netAmount = total - commission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment
      // Instead of returning a random id only, create an order record in DB and return its id
      if (!user) {
        onError('Please sign in to complete mock payment');
        setLoading(false);
        return;
      }

      // Compute totals
      const subtotal = unitPrice * quantity;
      const shippingCost = 0;
      const total = subtotal + shippingCost;
      const commission = total * 0.05;
      const netAmount = total - commission;

      // Attempt to read product owner (seller) so we can link seller_id
      let sellerId: string | null = null;
      try {
        const { data: productData } = await supabase
          .from('products')
          .select('owner_id')
          .eq('id', productId)
          .single();
        sellerId = productData?.owner_id || null;
      } catch (err) {
        console.warn('Could not fetch product owner for mock order:', err);
        sellerId = null;
      }

      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total_amount: total,
          shipping_cost: shippingCost,
          commission_fee: commission,
          net_amount: netAmount,
          status: 'paid'
        })
        .select()
        .single();

      if (insertError || !insertedOrder) {
        console.error('Error creating mock order:', insertError);
        onError('Failed to create order after mock payment');
        setLoading(false);
        return;
      }

      console.log('Mock Payment Successful, created order:', insertedOrder.id);

      // Use real DB order id for navigation
      onSuccess(insertedOrder.id);
    } catch (error) {
      onError('Mock payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-lg text-emerald-200">Please sign in to continue with payment</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-8 py-6 border-b border-slate-600/30">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              🧪 Mock Payment Test
            </h1>
            <p className="text-emerald-200 mt-2">
              Testing payment flow without real Stripe integration
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-emerald-200">
                    <span>Product:</span>
                    <span className="text-white">{productTitle}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Seller:</span>
                    <span className="text-white">{sellerName}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Quantity:</span>
                    <span className="text-white">{quantity} units</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Unit Price:</span>
                    <span className="text-white">${unitPrice}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Subtotal:</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Shipping:</span>
                    <span className="text-white">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200">
                    <span>Commission (5%):</span>
                    <span className="text-white">-${commission.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-yellow-400">Total:</span>
                      <span className="text-yellow-400">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-300 mt-1">
                      <span>Seller receives:</span>
                      <span>${netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-emerald-200 space-y-1">
                    <p className="font-medium text-white">John Doe</p>
                    <p>123 Test Street</p>
                    <p>Test City, TC 12345</p>
                    <p>Test Country</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Mock Payment Information</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-200 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                          placeholder="12/25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-200 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-emerald-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">🧪 This is a mock payment - no real money will be charged</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Mock Payment...</span>
                      </div>
                    ) : (
                      `🧪 Mock Pay $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


