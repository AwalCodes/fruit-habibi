import { NextRequest, NextResponse } from 'next/server';
import { stripe, OrderStatus } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { handleStripeError } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, orderId } = body;

    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing paymentIntentId or orderId' },
        { status: 400 }
      );
    }

    // Get current user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

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

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          title,
          quantity as product_quantity
        )
      `)
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
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


      // Create notification for seller
      await supabase
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'order',
          title: 'New Order Received',
          body: `You received a new order for ${order.quantity} units of ${order.products.title}`,
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
          body: `Your order for ${order.products.title} has been confirmed and payment received`,
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
