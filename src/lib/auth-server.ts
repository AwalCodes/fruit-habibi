import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for auth verification
// Uses anon key for token verification (tokens are signed by Supabase)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side Supabase client with service role key for admin operations
// Note: Currently unused but reserved for future admin operations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Server-side client for auth verification
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'farmer' | 'importer' | 'admin';
  full_name?: string;
}

/**
 * Get authenticated user from request headers
 * Verifies the token and returns user information
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase server-side client
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Get user role from database (more secure than user_metadata)
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      // Fallback to user_metadata if database query fails
      return {
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'farmer',
        full_name: user.user_metadata?.full_name,
      };
    }

    return {
      id: user.id,
      email: userData.email || user.email || '',
      role: userData.role || 'farmer',
      full_name: userData.full_name,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return user;
}

/**
 * Require admin role - throws error if user is not admin
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return user;
}

/**
 * Check if user has access to a resource (owner or admin)
 */
export async function hasAccess(
  request: NextRequest,
  resourceOwnerId: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return false;
  }
  
  // Admin has access to everything
  if (user.role === 'admin') {
    return true;
  }
  
  // User has access to their own resources
  return user.id === resourceOwnerId;
}

/**
 * Require access to a resource - throws error if user doesn't have access
 */
export async function requireAccess(
  request: NextRequest,
  resourceOwnerId: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  
  if (user.role !== 'admin' && user.id !== resourceOwnerId) {
    throw new Error('Forbidden: You do not have access to this resource');
  }
  
  return user;
}

/**
 * Check if user is involved in an order (buyer or seller)
 */
export async function isOrderParticipant(
  request: NextRequest,
  buyerId: string,
  sellerId: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return false;
  }
  
  // Admin has access to all orders
  if (user.role === 'admin') {
    return true;
  }
  
  // User is involved if they are buyer or seller
  return user.id === buyerId || user.id === sellerId;
}

/**
 * Require order participation - throws error if user is not involved
 */
export async function requireOrderParticipation(
  request: NextRequest,
  buyerId: string,
  sellerId: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  
  if (user.role !== 'admin' && user.id !== buyerId && user.id !== sellerId) {
    throw new Error('Forbidden: You are not involved in this order');
  }
  
  return user;
}

/**
 * Get user role from database (more secure than user_metadata)
 */
export async function getUserRole(userId: string): Promise<'farmer' | 'importer' | 'admin' | null> {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as 'farmer' | 'importer' | 'admin';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Verify webhook signature for Stripe webhooks
 */
export async function verifyStripeWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Dynamically import stripe to avoid require in TS file
    const stripeModule = await import('stripe');
    const stripe = new stripeModule.default(process.env.STRIPE_SECRET_KEY || '');
    stripe.webhooks.constructEvent(body, signature, secret);
    return true;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Verify cron secret for scheduled tasks
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return false;
  }

  return true;
}

