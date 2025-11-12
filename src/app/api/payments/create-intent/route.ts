import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculateCommission, PaymentIntentMetadata, OrderStatus } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { handleStripeError } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-server';
import { validateRequestBody, orderCreateSchema, checkRateLimit } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`payment:${clientId}`, 10, 60000); // 10 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    // Require authentication
    const user = await requireAuth(request);

    // Validate request body
    const body = await validateRequestBody(request, orderCreateSchema);
    const { productId, quantity, shippingAddress } = body;

    // Get the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        users!products_owner_id_fkey (
          id,
          full_name,
          subscription_tier
        )
      `)
      .eq('id', productId)
      .eq('status', 'published')
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Check if product has sufficient quantity
    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${product.quantity} units available` },
        { status: 400 }
      );
    }

    // Calculate pricing
    const unitPrice = product.price_usd;
    const subtotal = unitPrice * quantity;
    const shippingCost = 0; // Will be calculated later with shipping integration
    const totalAmount = subtotal + shippingCost;

    // Calculate commission based on seller's subscription tier
    const sellerTier = product.users?.subscription_tier || 'basic';
    // Map 'premium' to 'pro' for commission calculation
    const tierForCommission = sellerTier === 'premium' ? 'pro' : (sellerTier as 'basic' | 'pro' | 'enterprise');
    const commissionFee = calculateCommission(totalAmount, tierForCommission);

    // Prevent users from buying their own products
    if (user.id === product.owner_id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }

    // Create order in database first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: product.owner_id,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        commission_fee: commissionFee,
        shipping_address: shippingAddress,
        status: OrderStatus.PENDING,
        // Set escrow release date (e.g., 7 days after order)
        escrow_release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dispute_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        buyerId: user.id,
        sellerId: product.owner_id,
        productId: productId,
        commission: commissionFee.toString(),
        escrowEnabled: 'true',
      } as PaymentIntentMetadata,
      description: `Purchase: ${product.title} (${quantity} ${product.unit})`,
      receipt_email: user.email || undefined,
    });

    // Update order with payment intent ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with payment intent:', updateError);
      // Continue anyway, the payment intent is created
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      commission: commissionFee,
      netAmount: totalAmount - commissionFee,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.name === 'StripeError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle Stripe errors specifically
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = handleStripeError(error);
      return NextResponse.json(
        { error: stripeError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

