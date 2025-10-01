'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ProductStatusManagerProps {
  productId: string;
  currentStatus: 'draft' | 'published' | 'archived';
  onStatusChange?: (newStatus: string) => void;
  isOwner?: boolean;
}

export default function ProductStatusManager({
  productId,
  currentStatus,
  onStatusChange,
  isOwner = false
}: ProductStatusManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const statusOptions = [
    { value: 'draft', label: 'Draft', description: 'Not visible to buyers' },
    { value: 'published', label: 'Published', description: 'Visible to all users' },
    { value: 'archived', label: 'Archived', description: 'No longer available' },
  ];

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    if (!user || !isOwner) return;
    
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('owner_id', user.id);

      if (error) throw error;

      onStatusChange?.(newStatus);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOwner) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Status:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
          {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
          {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Change Status:</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value as 'draft' | 'published' | 'archived')}
              disabled={loading || status.value === currentStatus}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                status.value === currentStatus
                  ? 'bg-primary text-white border-primary cursor-default'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {statusOptions.find(s => s.value === currentStatus)?.description}
        </p>
      </div>
    </div>
  );
}


