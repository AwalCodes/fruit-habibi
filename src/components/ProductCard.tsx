'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import StarRating from './StarRating';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  category: string;
  images: string[];
  ownerName: string;
  ownerId: string;
  createdAt: string;
  currentUserId?: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  quantity,
  unit,
  location,
  category,
  images,
  ownerName,
  ownerId,
  createdAt,
  currentUserId,
  averageRating,
  reviewCount,
}: ProductCardProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (ownerId === user.id) {
      // Don't add own products to cart
      return;
    }

    addItem({
      id,
      title,
      price,
      image_url: images[0] || '/placeholder-product.jpg',
      seller_id: ownerId,
      seller_name: ownerName,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'fruits': 'Fruits',
      'vegetables': 'Vegetables',
      'herbs': 'Herbs & Spices',
      'grains': 'Grains & Cereals',
      'nuts': 'Nuts & Seeds',
      'dried': 'Dried Products',
      'other': 'Other',
    };
    return categoryMap[category] || category;
  };

  const getOwnerDisplayName = () => {
    if (currentUserId && ownerId === currentUserId) {
      return 'You';
    }
    return ownerName;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        boxShadow: "0 20px 40px rgba(251, 191, 36, 0.2)"
      }}
      className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 hover:border-yellow-400/40 overflow-hidden transition-all duration-300"
    >
      {/* Gemstone Badge */}
      <div className="absolute top-4 right-4 text-2xl z-10">💎</div>
      
      <Link href={`/listing/${id}`}>
        <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-emerald-900/20 to-slate-900/20">
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt={title}
              width={400}
              height={225}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-emerald-900/30 to-slate-900/30 flex items-center justify-center">
              <motion.span 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🌱
              </motion.span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-300 border border-yellow-400/30">
                  {getCategoryDisplayName(category)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white line-clamp-2 mb-2">
                {title}
              </h3>
            </div>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 ml-2">
              {formatPrice(price)}
            </span>
          </div>
          
          <p className="text-emerald-100 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* Rating Display */}
          {averageRating && averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm text-emerald-200">
                ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-emerald-200 mb-4">
            <span className="flex items-center">
              <span className="text-yellow-400 mr-2">📦</span>
              {quantity} {unit}
            </span>
            <span className="flex items-center">
              <span className="text-yellow-400 mr-2">📍</span>
              {location}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-emerald-300 border-t border-yellow-400/20 pt-3 mb-3">
            <span>by {getOwnerDisplayName()}</span>
            <span>{formatDate(createdAt)}</span>
          </div>

          {/* Add to Cart Button */}
          {ownerId !== user?.id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700'
              }`}
            >
              {addedToCart ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
