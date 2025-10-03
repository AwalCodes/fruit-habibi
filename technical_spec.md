# Fruit Habibi - Technical Specification

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Hosting**: Vercel
- **Payments**: Stripe
- **Shipping**: Freightos API / Flexport API
- **AI/ML**: OpenAI GPT-4, Pinecone Vector DB
- **Monitoring**: Sentry, Vercel Analytics

### Database Schema

#### Core Tables

```sql
-- Enhanced Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'importer', 'admin')),
  country TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  business_type TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'sold')),
  featured BOOLEAN DEFAULT FALSE,
  shipping_included BOOLEAN DEFAULT FALSE,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  harvest_date DATE,
  expiry_date DATE,
  certifications TEXT[],
  organic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  commission_fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed')),
  payment_intent_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachments TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'order', 'review', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping Quotes Table
CREATE TABLE shipping_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  weight_kg DECIMAL(8,2),
  volume_m3 DECIMAL(8,3),
  quote_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_days INTEGER,
  provider TEXT NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products Policies
CREATE POLICY "Anyone can view published products" ON products
  FOR SELECT USING (status = 'published');

CREATE POLICY "Product owners can manage their products" ON products
  FOR ALL USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = owner_id)
  );

CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      (SELECT auth_id FROM users WHERE id = buyer_id),
      (SELECT auth_id FROM users WHERE id = seller_id)
    )
  );

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = buyer_id)
  );

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      (SELECT auth_id FROM users WHERE id = sender_id),
      (SELECT auth_id FROM users WHERE id = receiver_id)
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = sender_id)
  );

-- Reviews Policies
CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their orders" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = reviewer_id) AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND buyer_id = reviewer_id
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
  );

-- Analytics Policies
CREATE POLICY "System can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);
```

## API Endpoints

### Authentication API

```typescript
// POST /api/auth/signup
interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'farmer' | 'importer';
  country: string;
  phone?: string;
  companyName?: string;
}

interface SignupResponse {
  user: User;
  session: Session;
}

// POST /api/auth/signin
interface SigninRequest {
  email: string;
  password: string;
}

interface SigninResponse {
  user: User;
  session: Session;
}

// POST /api/auth/verify-email
interface VerifyEmailRequest {
  token: string;
  type: 'signup' | 'recovery';
}

// POST /api/auth/reset-password
interface ResetPasswordRequest {
  email: string;
}

// POST /api/auth/update-password
interface UpdatePasswordRequest {
  newPassword: string;
}
```

### Products API

```typescript
// GET /api/products
interface GetProductsRequest {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating';
}

interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// POST /api/products
interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  category: string;
  images: string[];
  shippingIncluded?: boolean;
  minOrderQuantity?: number;
  harvestDate?: string;
  certifications?: string[];
  organic?: boolean;
}

interface CreateProductResponse {
  product: Product;
}

// GET /api/products/[id]
interface GetProductResponse {
  product: Product & {
    owner: User;
    reviews: Review[];
    averageRating: number;
    reviewCount: number;
  };
}

// PUT /api/products/[id]
interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  status?: 'draft' | 'published' | 'archived';
  // ... other fields
}

// DELETE /api/products/[id]
interface DeleteProductResponse {
  success: boolean;
}
```

### Orders API

```typescript
// POST /api/orders
interface CreateOrderRequest {
  productId: string;
  quantity: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethodId: string;
}

interface CreateOrderResponse {
  order: Order;
  paymentIntent: PaymentIntent;
}

// GET /api/orders
interface GetOrdersResponse {
  orders: (Order & {
    product: Product;
    buyer: User;
    seller: User;
  })[];
}

// PUT /api/orders/[id]/status
interface UpdateOrderStatusRequest {
  status: 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
}
```

### Payments API

```typescript
// POST /api/payments/create-intent
interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// POST /api/payments/confirm
interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

// POST /api/payments/webhook
interface PaymentWebhookRequest {
  type: string;
  data: {
    object: PaymentIntent;
  };
}
```

### Shipping API

```typescript
// POST /api/shipping/quote
interface ShippingQuoteRequest {
  fromLocation: string;
  toLocation: string;
  weight: number;
  volume?: number;
  productType: string;
}

interface ShippingQuoteResponse {
  quotes: {
    provider: string;
    amount: number;
    currency: string;
    estimatedDays: number;
    service: string;
  }[];
}

// POST /api/shipping/book
interface BookShippingRequest {
  quoteId: string;
  orderId: string;
  pickupDate: string;
}

interface BookShippingResponse {
  trackingNumber: string;
  estimatedDelivery: string;
}
```

### Messaging API

```typescript
// GET /api/messages/conversations
interface GetConversationsResponse {
  conversations: {
    id: string;
    otherUser: User;
    product: Product;
    lastMessage: Message;
    unreadCount: number;
  }[];
}

// GET /api/messages/[conversationId]
interface GetMessagesRequest {
  page?: number;
  limit?: number;
}

interface GetMessagesResponse {
  messages: (Message & {
    sender: User;
  })[];
}

// POST /api/messages
interface SendMessageRequest {
  productId: string;
  receiverId: string;
  body: string;
  messageType?: 'text' | 'image' | 'file';
  attachments?: string[];
}
```

## Component Architecture

### Core Components

```typescript
// PaymentForm.tsx
interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}

// ShippingCalculator.tsx
interface ShippingCalculatorProps {
  productId: string;
  fromLocation: string;
  onQuoteReceived: (quotes: ShippingQuote[]) => void;
}

// AIChatWidget.tsx
interface AIChatWidgetProps {
  userId?: string;
  context?: 'product' | 'general' | 'support';
  onHumanHandoff?: () => void;
}

// AnalyticsDashboard.tsx
interface AnalyticsDashboardProps {
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: BusinessMetrics;
}
```

## Security Implementation

### Environment Variables

```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FREIGHTOS_API_KEY=your_freightos_key
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=your_pinecone_key
SENTRY_DSN=your_sentry_dsn
```

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co https://api.stripe.com;
      frame-src https://js.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

## Performance Optimization

### Image Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};
```

### Caching Strategy

```typescript
// src/lib/cache.ts
export const cacheConfig = {
  products: {
    ttl: 300, // 5 minutes
    tags: ['products'],
  },
  shippingQuotes: {
    ttl: 600, // 10 minutes
    tags: ['shipping'],
  },
  userProfile: {
    ttl: 3600, // 1 hour
    tags: ['user'],
  },
};
```

## Deployment Configuration

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Database Migrations

```sql
-- Migration: 001_initial_schema.sql
-- Migration: 002_add_orders_table.sql
-- Migration: 003_add_reviews_table.sql
-- Migration: 004_add_shipping_quotes.sql
-- Migration: 005_add_analytics_events.sql
-- Migration: 006_add_user_verification.sql
```

## Monitoring & Analytics

### Error Tracking

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### Business Metrics

```typescript
// src/lib/analytics.ts
export const trackEvent = async (
  eventType: string,
  data: Record<string, any>
) => {
  await supabase.from('analytics_events').insert({
    user_id: getCurrentUserId(),
    event_type: eventType,
    event_data: data,
    session_id: getSessionId(),
  });
};

// Key metrics to track
export const METRICS = {
  USER_REGISTRATION: 'user_registration',
  PRODUCT_LISTING: 'product_listing',
  ORDER_CREATED: 'order_created',
  PAYMENT_SUCCESS: 'payment_success',
  MESSAGE_SENT: 'message_sent',
  REVIEW_SUBMITTED: 'review_submitted',
} as const;
```

This technical specification provides a comprehensive foundation for implementing a production-ready B2B marketplace with all the necessary security, performance, and scalability considerations.
