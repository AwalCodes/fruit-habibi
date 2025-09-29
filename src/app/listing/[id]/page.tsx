'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ChatPanel from '@/components/ChatPanel';
import ProductStatusManager from '@/components/ProductStatusManager';

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
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link
              href="/listings"
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === product.users?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/listings" className="text-primary hover:text-primary-dark">
            ← Back to Listings
          </Link>
        </nav>

        <div className={`grid gap-8 ${showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Product Images */}
          <div className={showChat ? 'lg:col-span-1' : ''}>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.title}
                    width={600}
                    height={400}
                    className="w-full h-80 object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-6xl text-gray-400">🌱</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className={showChat ? 'lg:col-span-1' : ''}>
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(product.price_usd)}
                </span>
                <span className="text-gray-600 ml-2">per {product.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Available Quantity</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-lg font-semibold text-gray-900">{product.location}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Supplier</h3>
                    <p className="text-gray-600">{product.users?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{product.users?.country || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Listed on</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(product.created_at)}</p>
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
                  <Link
                    href={`/listing/${product.id}?chat=true`}
                    className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors font-medium inline-block text-center"
                  >
                    {showChat ? 'Hide Chat' : (isOwner ? 'View Messages' : 'Start Chat')}
                  </Link>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Sign in to contact the supplier</p>
                    <Link
                      href="/login"
                      className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors font-medium inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          
          {/* Chat Panel - Show for both seller and buyer when chat is enabled */}
          {showChat && user && product.users?.id && (
            <div className="lg:col-span-1">
              <ChatPanel
                productId={product.id}
                sellerId={product.users.id}
                sellerName={product.users.full_name || 'Unknown'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
