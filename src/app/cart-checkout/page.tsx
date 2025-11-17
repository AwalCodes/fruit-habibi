'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ShoppingCartIcon,
  CreditCardIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function CartCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, getTotalPrice } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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
                  Cart Checkout
                </h1>
                <p className="text-emerald-200 mt-1">
                  Complete your purchase with Stripe
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

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 mb-6">
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
                <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
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
                <Link
                  href={`/checkout?product=${item.id}&quantity=${item.quantity}`}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium text-sm"
                >
                  Checkout
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-slate-600 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold mb-4">
              <span className="text-white">Total:</span>
              <span className="text-yellow-400">${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-200 text-sm">
                💳 <strong>Real Stripe Payment:</strong> Click "Checkout" next to each item to complete payment. 
                Each item will be processed securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
