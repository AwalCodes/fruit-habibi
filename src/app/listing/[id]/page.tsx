'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import ChatPanel from '@/components/ChatPanel';
import ProductStatusManager from '@/components/ProductStatusManager';
import ProductReviews from '@/components/ProductReviews';

interface Product {
  id: string;
  title: string;
  description: string;
  price_usd: number;
  quantity: number;
  unit: string;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  owner_id: string;
  users: {
    id: string;
    full_name: string;
    country: string;
  };
}

export default function ListingDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const params = useParams();
  const searchParams = useSearchParams();
  const showChat = searchParams?.get('chat') === 'true';

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      // First, get the product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      console.log('Product fetch result:', { productData, productError });

      if (productError) throw productError;

      // Then, get the user data
      const { data: userDataArray, error: userError } = await supabase
        .from('users')
        .select('id, full_name, country')
        .eq('id', productData.owner_id);
      
      const userData = userDataArray && userDataArray.length > 0 ? userDataArray[0] : null;

      console.log('User fetch result:', { 
        userData, 
        userError, 
        ownerId: productData.owner_id,
        errorDetails: userError ? {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code
        } : null
      });

      // If user doesn't exist, create a fallback or handle gracefully
      let finalUserData = userData;
      if (!userData && !userError) {
        // User doesn't exist, create a fallback
        finalUserData = {
          id: productData.owner_id,
          full_name: 'Unknown Seller',
          country: 'Unknown'
        };
        console.log('User not found, using fallback:', finalUserData);
      }

      // Combine the data
      const combinedData = {
        ...productData,
        users: finalUserData
      };

      console.log('Combined data:', combinedData);

      setProduct(combinedData);
    } catch {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-emerald-200">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <p className="text-emerald-200 mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link
              href="/listings"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === product.users?.id;

  const handleAddToCart = async () => {
    if (!product || !user) return;
    
    setIsAddingToCart(true);
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price_usd,
        image_url: product.images[0] || '',
        seller_id: product.owner_id,
        seller_name: product.users.full_name
      });
      
      // Show success feedback
      setIsAddingToCart(false);
      setShowCartSuccess(true);
      setTimeout(() => {
        setShowCartSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/listings" className="text-yellow-400 hover:text-yellow-300 transition-colors">
            ← Back to Listings
          </Link>
        </nav>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Product Images - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.title}
                    width={800}
                    height={500}
                    className="w-full h-96 object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-emerald-500/10 to-yellow-500/10 flex items-center justify-center">
                    <span className="text-6xl text-yellow-400">🌱</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images - Always show 3 thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {product.images && product.images.length > 0 ? (
                  product.images.slice(0, 3).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-yellow-400 ring-2 ring-yellow-400/20' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  // Show placeholder thumbnails when no images
                  [1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border-2 border-slate-600 flex items-center justify-center"
                    >
                      <span className="text-2xl text-slate-500">🌱</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{product.title}</h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {formatPrice(product.price_usd)}
                </span>
                <span className="text-emerald-200 ml-2">per {product.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-emerald-200">Available Quantity</h3>
                  <p className="text-lg font-semibold text-white">
                    {product.quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-emerald-200">Location</h3>
                  <p className="text-lg font-semibold text-white">{product.location}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                <p className="text-emerald-200 leading-relaxed">{product.description}</p>
              </div>

              <div className="border-t border-slate-600 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Supplier</h3>
                    <p className="text-emerald-200">{product.users?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-emerald-300">{product.users?.country || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-300">Listed on</p>
                    <p className="text-sm font-medium text-white">{formatDate(product.created_at)}</p>
                  </div>
                </div>

                {/* Product Status Manager */}
                <div className="mb-6">
                  <ProductStatusManager
                    productId={product.id}
                    currentStatus={product.status as 'draft' | 'published' | 'archived'}
                    isOwner={isOwner}
                    onStatusChange={(newStatus) => {
                      setProduct(prev => prev ? { ...prev, status: newStatus } : null);
                    }}
                  />
                </div>

                {user ? (
                  <div className="space-y-4">
                    {!isOwner && (
                      <>
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3">
                          <label className="text-emerald-200 font-medium">Quantity:</label>
                          <div className="flex items-center border border-emerald-500 rounded-lg">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="px-3 py-2 text-emerald-200 hover:bg-emerald-800 transition-colors"
                              disabled={quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-2 text-emerald-100 font-medium border-x border-emerald-500">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                              className="px-3 py-2 text-emerald-200 hover:bg-emerald-800 transition-colors"
                              disabled={quantity >= product.quantity}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons - Side by side layout */}
                        <div className="grid grid-cols-1 gap-3">
                          {/* Primary Actions Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={handleAddToCart}
                              disabled={isAddingToCart || product.quantity === 0}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                              {isAddingToCart ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Adding...
                                </>
                              ) : showCartSuccess ? (
                                <>✅ Added!</>
                              ) : (
                                <>🛒 Add to Cart</>
                              )}
                            </button>

                            <Link
                              href={`/checkout?product=${product.id}&quantity=${quantity}`}
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-medium inline-block text-center shadow-lg hover:shadow-yellow-500/25 text-sm"
                            >
                              💳 Buy Now (Real Stripe Payment)
                            </Link>
                          </div>

                          {/* Secondary Actions Row */}
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            <Link
                              href={showChat ? `/listing/${product.id}` : `/listing/${product.id}?chat=true`}
                              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium inline-block text-center shadow-lg hover:shadow-purple-500/25 text-xs"
                            >
                              {showChat ? 'Hide Chat' : '💬 Chat'}
                            </Link>
                          </div>
                        </div>

                        {/* Success Message */}
                        {showCartSuccess && (
                          <div className="bg-emerald-900/50 border border-emerald-500 rounded-lg p-3 text-center">
                            <p className="text-emerald-200 text-sm">
                              ✅ Added to cart! 
                              <Link href="/cart" className="text-yellow-400 hover:text-yellow-300 ml-1 underline">
                                View Cart
                              </Link>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Chat Button for owners */}
                    {isOwner && (
                      <Link
                        href={showChat ? `/listing/${product.id}` : `/listing/${product.id}?chat=true`}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium inline-block text-center shadow-lg hover:shadow-purple-500/25"
                      >
                        {showChat ? 'Hide Chat' : '💬 View Messages'}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4">
                      <p className="text-emerald-200 font-medium mb-2">Want to purchase this item?</p>
                      <p className="text-sm text-emerald-300 mb-4">Sign in to add to cart, buy now, or chat with the supplier</p>
                      
                      <div className="space-y-2">
                        <Link
                          href="/register"
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium inline-block shadow-lg hover:shadow-emerald-500/25"
                        >
                          🚀 Create Account
                        </Link>
                        <Link
                          href="/login"
                          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 px-4 rounded-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 font-medium inline-block shadow-lg hover:shadow-slate-500/25"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Reviews Section - Full width below the main content */}
        <div className="mt-8 lg:col-span-3">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Chat Modal Overlay */}
      {showChat && user && product.users?.id && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => window.history.back()}
        >
          <div 
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => window.history.back()}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              >
                ✕
              </button>
              
              {/* Chat Panel */}
              <ChatPanel
                productId={product.id}
                sellerId={product.users.id}
                sellerName={product.users.full_name || 'Unknown'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
