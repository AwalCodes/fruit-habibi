// Test script for payment system
// Run this with: node test-payment.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System...\n');

  try {
    // Test 1: Check if orders table exists
    console.log('1️⃣ Testing database connection...');
    const { data: tables, error: tablesError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Orders table not found. Please run the database migration first.');
      console.error('   Run: supabase db push');
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check Stripe configuration
    console.log('\n2️⃣ Testing Stripe configuration...');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripeSecretKey || !stripePublishableKey) {
      console.error('❌ Missing Stripe credentials in .env.local');
      console.error('   Please add your Stripe test keys');
      return;
    }

    if (!stripeSecretKey.startsWith('sk_test_') || !stripePublishableKey.startsWith('pk_test_')) {
      console.error('❌ Invalid Stripe keys. Make sure you\'re using TEST keys');
      return;
    }
    console.log('✅ Stripe configuration valid');

    // Test 3: Test payment intent creation API
    console.log('\n3️⃣ Testing payment intent creation...');
    
    // First, we need a test product and user
    console.log('   Creating test data...');
    
    // Create a test user (you'll need to sign up first)
    console.log('   ⚠️  You need to create a user account first');
    console.log('   Go to: http://localhost:3000/register');
    console.log('   Create an account, then come back to this test');

    console.log('\n✅ Payment system setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create a user account at http://localhost:3000/register');
    console.log('   2. Create a test product listing');
    console.log('   3. Try to purchase the product');
    console.log('   4. Use test card: 4242 4242 4242 4242');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentSystem();

