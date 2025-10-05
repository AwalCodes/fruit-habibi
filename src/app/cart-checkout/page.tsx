'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingCartIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function CartCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-emerald-200"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-12 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Cart is Empty</h3>
            <p className="text-emerald-200 mb-6">
              Add some products to your cart before checking out.
            </p>
            <button
              onClick={() => router.push('/listings')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleMockPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create real orders in the database for each cart item
    try {
      const createdOrders = [];
      
      for (const item of cartItems) {
        // Create order in the database
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: item.seller_id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price_usd: item.price,
            total_amount_usd: item.price * item.quantity,
            commission_amount_usd: (item.price * item.quantity) * 0.05, // 5% commission
            order_status: 'paid',
            stripe_payment_intent_id: `mock_pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            shipping_address: {
              name: user.user_metadata?.full_name || 'Demo User',
              address: '123 Demo Street',
              city: 'Demo City',
              country: 'Demo Country'
            },
            notes: 'Demo payment - no real money charged'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating order:', error);
          throw error;
        }

        createdOrders.push(order);
        console.log('Order created:', order);
      }
      
      clearCart();
      
      // Redirect directly to orders page with success message
      router.push('/orders?success=true');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to create orders. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Checkout
                </h1>
                <p className="text-emerald-200 mt-1">
                  Complete your purchase
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/cart')}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="w-12 h-12 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || '/placeholder-product.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-emerald-300 text-sm">by {item.seller_name}</p>
                    <p className="text-yellow-400 font-semibold">
                      ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-slate-600 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-white">Total:</span>
                <span className="text-yellow-400">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium mb-2">Mock Payment System</h3>
                <p className="text-emerald-200 text-sm">
                  This is a demo checkout. In a real application, this would integrate with Stripe or another payment processor.
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="text-yellow-400 font-medium mb-2">⚠️ Demo Mode</h3>
                <p className="text-yellow-200 text-sm">
                  This payment will be processed in demo mode. No real money will be charged.
                </p>
              </div>

              <button
                onClick={handleMockPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5" />
                    Complete Payment (Demo)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
