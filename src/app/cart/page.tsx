'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CartPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
          {t('cart.loading')}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Redirect to cart checkout page
    router.push('/cart-checkout');
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-600/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {t('cart.title')}
                </h1>
                <p className="text-emerald-200 mt-1">
                  {getTotalItems()} {getTotalItems() !== 1 ? t('cart.itemsInCartPlural') : t('cart.itemsInCart')} {t('cart.inYourCart')}
                </p>
              </div>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-12 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('cart.emptyCart')}</h3>
            <p className="text-emerald-200 mb-6">
              {t('cart.emptyCartDesc')}
            </p>
            <Link
              href="/listings"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium"
            >
              {t('cart.browseProducts')}
            </Link>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || '/placeholder-product.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-emerald-300 text-sm">
                        {t('cart.by')} {item.seller_name}
                      </p>
                      <p className="text-yellow-400 font-semibold">
                        ${item.price.toFixed(2)} {t('cart.each')}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-white font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-yellow-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/30 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-4">{t('orders.orderId')}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-emerald-300">{t('cart.itemsInCartPlural')} ({getTotalItems()}):</span>
                    <span className="text-white">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-300">{t('cart.subtotal')}:</span>
                    <span className="text-white">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">{t('cart.total')}:</span>
                      <span className="text-lg font-semibold text-yellow-400">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      {t('cart.proceedToCheckout')}
                    </>
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-red-400 hover:text-red-300 py-2 px-4 rounded-lg border border-red-400/30 hover:border-red-400/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
