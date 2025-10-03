import { loadStripe, Stripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Client-side Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe
export const stripe = new StripeServer(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Commission configuration
export const COMMISSION_RATES = {
  basic: 0.05, // 5% commission for basic tier
  pro: 0.03,   // 3% commission for pro tier
  enterprise: 0.02, // 2% commission for enterprise tier
} as const;

export const MINIMUM_COMMISSION = 0.50; // $0.50 minimum commission
export const MAXIMUM_COMMISSION = 100.00; // $100 maximum commission per transaction

// Calculate commission for a transaction
export const calculateCommission = (
  amount: number,
  sellerTier: keyof typeof COMMISSION_RATES = 'basic'
): number => {
  const commission = amount * COMMISSION_RATES[sellerTier];
  return Math.max(MINIMUM_COMMISSION, Math.min(MAXIMUM_COMMISSION, commission));
};

// Escrow configuration
export const ESCROW_CONFIG = {
  releaseDays: 7, // Release funds 7 days after delivery confirmation
  disputePeriod: 14, // 14 days for dispute resolution
  autoRelease: true, // Automatically release after dispute period
} as const;

// Payment intent metadata interface
export interface PaymentIntentMetadata {
  orderId: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  commission: string;
  escrowEnabled: string;
  [key: string]: string;
}

// Order status for tracking
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
}

// Stripe webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
  CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
  TRANSFER_CREATED: 'transfer.created',
} as const;

// Error handling
export class StripeError extends Error {
  constructor(message: string, public code?: string, public type?: string) {
    super(message);
    this.name = 'StripeError';
  }
}

// Utility function to handle Stripe errors
export const handleStripeError = (error: any): StripeError => {
  if (error.type === 'StripeCardError') {
    return new StripeError(
      error.message || 'Your card was declined.',
      error.code,
      error.type
    );
  } else if (error.type === 'StripeRateLimitError') {
    return new StripeError(
      'Too many requests made to the API too quickly.',
      error.code,
      error.type
    );
  } else if (error.type === 'StripeInvalidRequestError') {
    return new StripeError(
      'Invalid parameters were supplied to Stripe\'s API.',
      error.code,
      error.type
    );
  } else if (error.type === 'StripeAPIError') {
    return new StripeError(
      'An error occurred internally with Stripe\'s API.',
      error.code,
      error.type
    );
  } else if (error.type === 'StripeConnectionError') {
    return new StripeError(
      'Some kind of error occurred during the HTTPS communication.',
      error.code,
      error.type
    );
  } else if (error.type === 'StripeAuthenticationError') {
    return new StripeError(
      'You probably used an incorrect API key.',
      error.code,
      error.type
    );
  } else {
    return new StripeError(
      error.message || 'An unexpected error occurred.',
      error.code,
      error.type
    );
  }
};
