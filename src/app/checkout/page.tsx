'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import PaymentForm from '@/components/PaymentForm';
import StripeProvider from '@/components/StripeProvider';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  description: string;
  price_usd: number;
  quantity: number;
  unit: string;
  location: string;
  category: string;
  images: string[];
  users: {
    full_name: string;
  };
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string>('');

  const productId = searchParams?.get('product');
  const requestedQuantity = searchParams?.get('quantity');

  useEffect(() => {
    if (requestedQuantity) {
      setQuantity(parseInt(requestedQuantity) || 1);
    }
  }, [requestedQuantity]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (productId && user) {
      fetchProduct();
    }
  }, [productId, user, authLoading]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_owner_id_fkey (
            full_name
          )
        `)
        .eq('id', productId)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      if (data.quantity < quantity) {
        setError(`Only ${data.quantity} units available`);
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Product not found or not available');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    router.push(`/orders/${orderId}?success=true`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-emerald-200">Loading checkout...</div>
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
          <h1 className="text-2xl font-bold text-white mb-4">Checkout Error</h1>
          <p className="text-emerald-200 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-yellow-500/25"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-lg text-emerald-200">Product not found</div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        productId={product.id}
        quantity={quantity}
        unitPrice={product.price_usd}
        sellerName={product.users.full_name}
        productTitle={product.title}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handleCancel}
      />
    </StripeProvider>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-emerald-200">Loading...</div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

