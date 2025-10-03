'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, AddressElement } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface PaymentFormProps {
  productId: string;
  quantity: number;
  unitPrice: number;
  sellerName: string;
  productTitle: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface ShippingAddress {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export default function PaymentForm({
  productId,
  quantity,
  unitPrice,
  sellerName,
  productTitle,
  onSuccess,
  onError,
  onCancel,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const { user, session } = useAuth();

  const stripe = useStripe();
  const elements = useElements();

  const subtotal = unitPrice * quantity;
  const shippingCost = 0; // Will be calculated later
  const total = subtotal + shippingCost;
  const commission = total * 0.05; // 5% commission
  const netAmount = total - commission;

  useEffect(() => {
    if (!user || !session) {
      onError('Please sign in to continue with payment');
      return;
    }

    createPaymentIntent();
  }, [user, session]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          shippingAddress: shippingAddress?.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onError(error instanceof Error ? error.message : 'Failed to create payment intent');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        onError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on our backend
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to confirm payment');
        }

        onSuccess(orderId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (event: any) => {
    if (event.complete) {
      setShippingAddress(event.value);
    }
  };

  if (!user || !session) {
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
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-8 py-6 border-b border-slate-600/30">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Complete Your Purchase
            </h1>
            <p className="text-emerald-200 mt-2">
              Secure payment powered by Stripe
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

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <AddressElement
                    options={{
                      mode: 'shipping',
                      allowedCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'AU', 'JP', 'SG', 'AE', 'SA', 'EG', 'MA', 'TN', 'JO', 'LB', 'KW', 'QA', 'BH', 'OM'],
                    }}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Payment Information</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#e5e7eb',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-emerald-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Your payment information is secure and encrypted</span>
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
                    disabled={loading || !stripe || !clientSecret || !shippingAddress}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Pay $${total.toFixed(2)}`
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
