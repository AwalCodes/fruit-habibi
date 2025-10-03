import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculateCommission, PaymentIntentMetadata, OrderStatus } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { handleStripeError } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, shippingAddress, paymentMethodId } = body;

    // Validate required fields
    if (!productId || !quantity || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, shippingAddress' },
        { status: 400 }
      );
    }

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
    const commissionFee = calculateCommission(totalAmount, sellerTier as any);

    // Get current user (buyer)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

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
