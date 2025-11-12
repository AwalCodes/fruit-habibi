'use client';

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { ReactNode } from 'react';

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const stripePromise = getStripe();

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#10b981',
        colorBackground: '#1e293b',
        colorText: '#e5e7eb',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#334155',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '12px',
          color: '#e5e7eb',
          fontSize: '16px',
        },
        '.Input:focus': {
          borderColor: '#10b981',
          boxShadow: '0 0 0 1px #10b981',
        },
        '.Input--invalid': {
          borderColor: '#ef4444',
          boxShadow: '0 0 0 1px #ef4444',
        },
        '.Label': {
          color: '#e5e7eb',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '14px',
          marginTop: '4px',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : { appearance: options.appearance }}>
      {children}
    </Elements>
  );
}

