'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  images: string[];
  ownerName: string;
  createdAt: string;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  quantity,
  unit,
  location,
  images,
  ownerName,
  createdAt,
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
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>
            <span className="text-2xl font-bold text-primary ml-2">
              {formatPrice(price)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
          
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
            <span>by {ownerName}</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
