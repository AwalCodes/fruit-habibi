# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Optional: Shipping Integration (Phase 2)
# FREIGHTOS_API_KEY=your_freightos_api_key
# FLEXPORT_API_KEY=your_flexport_api_key

# Optional: AI Assistant (Phase 8)
# OPENAI_API_KEY=sk-your_openai_api_key
# PINECONE_API_KEY=your_pinecone_api_key

# Optional: Monitoring (Phase 7)
# SENTRY_DSN=your_sentry_dsn
# VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Optional: Email Service
# RESEND_API_KEY=your_resend_api_key
# SENDGRID_API_KEY=your_sendgrid_api_key
```

## Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API to get your URL and keys
3. Copy the migration file `supabase/migrations/001_create_orders_table.sql` to your Supabase SQL editor and run it

### 2. Stripe Setup
1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your publishable and secret keys from the dashboard
3. Set up webhooks:
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.dispute.created`, `transfer.created`
4. Copy the webhook signing secret

### 3. Database Setup
Run the following SQL in your Supabase SQL editor:

```sql
-- Run the migration file: supabase/migrations/001_create_orders_table.sql
```

### 4. Test the Integration
1. Start the development server: `npm run dev`
2. Create a test product listing
3. Try to purchase it with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
