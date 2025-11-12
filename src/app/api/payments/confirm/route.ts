import { NextRequest, NextResponse } from 'next/server';
import { stripe, OrderStatus } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { handleStripeError } from '@/lib/stripe';
import { requireAuth, requireOrderParticipation } from '@/lib/auth-server';
import { validateRequestBody, paymentIntentSchema, checkRateLimit } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`payment-confirm:${clientId}`, 20, 60000); // 20 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    // Require authentication
    const user = await requireAuth(request);

    // Validate request body
    const body = await validateRequestBody(request, paymentIntentSchema);
    const { paymentIntentId, orderId } = body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Verify the payment intent belongs to the user
    if (paymentIntent.metadata.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to payment intent' },
        { status: 403 }
      );
    }

    // Get the order and verify user has access
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user is the buyer of this order (or admin)
    await requireOrderParticipation(request, order.buyer_id, order.seller_id);
    
    // Additional check: only buyer can confirm payment
    if (user.role !== 'admin' && user.id !== order.buyer_id) {
      return NextResponse.json(
        { error: 'Only the buyer can confirm payment' },
        { status: 403 }
      );
    }

    // Check if payment is successful
    if (paymentIntent.status === 'succeeded') {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: OrderStatus.PAID,
          payment_method_id: paymentIntent.payment_method as string,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }

      // Reduce product quantity
      // First fetch current product quantity
      const { data: product, error: productFetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', order.product_id)
        .single();

      if (productFetchError) {
        console.error('Error fetching product:', productFetchError);
      } else if (product) {
        const { error: quantityError } = await supabase
          .from('products')
          .update({ 
            quantity: product.quantity - order.quantity 
          })
          .eq('id', order.product_id);

        if (quantityError) {
          console.error('Error updating product quantity:', quantityError);
        }
      }


      // Get product title for notifications
      const { data: productData } = await supabase
        .from('products')
        .select('title')
        .eq('id', order.product_id)
        .single();

      const productTitle = productData?.title || 'your product';

      // Create notification for seller
      await supabase
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'order',
          title: 'New Order Received',
          message: `You received a new order for ${order.quantity} units of ${productTitle}`,
          data: {
            orderId: order.id,
            productId: order.product_id,
            buyerId: order.buyer_id,
          },
        });

      // Create notification for buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order for ${productTitle} has been confirmed and payment received`,
          data: {
            orderId: order.id,
            productId: order.product_id,
            sellerId: order.seller_id,
          },
        });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: OrderStatus.PAID,
        message: 'Payment confirmed successfully',
      });

    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Additional authentication required',
      });

    } else if (paymentIntent.status === 'requires_payment_method') {
      return NextResponse.json({
        success: false,
        requiresPaymentMethod: true,
        message: 'Payment method required',
      });

    } else {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        message: `Payment ${paymentIntent.status}`,
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

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
