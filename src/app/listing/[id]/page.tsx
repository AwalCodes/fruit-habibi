'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const { user } = useAuth();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_owner_id_fkey(id, full_name, country)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setProduct(data);
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

  const isOwner = user?.id === product.users.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/listings" className="text-primary hover:text-primary-dark">
            ← Back to Listings
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-6xl text-gray-400">🌱</span>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 2}`}
                      width={150}
                      height={150}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
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
                    <p className="text-gray-600">{product.users.full_name}</p>
                    <p className="text-sm text-gray-500">{product.users.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Listed on</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(product.created_at)}</p>
                  </div>
                </div>

                {!isOwner && user ? (
                  <button className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors font-medium">
                    Contact Supplier
                  </button>
                ) : !user ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Sign in to contact the supplier</p>
                    <Link
                      href="/login"
                      className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors font-medium inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">This is your listing</p>
                    <Link
                      href="/dashboard"
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
