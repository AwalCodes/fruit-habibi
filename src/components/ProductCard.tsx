'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
      className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-shadow duration-200"
    >
      <Link href={`/listing/${id}`}>
        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt={title}
              width={400}
              height={225}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl text-gray-400">🌱</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {getCategoryDisplayName(category)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {title}
              </h3>
            </div>
            <span className="text-2xl font-bold text-primary ml-2">
              {formatPrice(price)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
          
          {/* Rating Display */}
          {averageRating && averageRating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm text-gray-600">
                ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <span className="text-gray-400 mr-1">📦</span>
              {quantity} {unit}
            </span>
            <span className="flex items-center">
              <span className="text-gray-400 mr-1">📍</span>
              {location}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>by {getOwnerDisplayName()}</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
