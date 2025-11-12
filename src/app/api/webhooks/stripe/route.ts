import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

/**
 * Verify that the webhook request comes from Stripe
 * Optionally, you can also verify the IP address
 */
function isStripeWebhook(_request: NextRequest): boolean {
  // Stripe webhooks come from specific IP ranges
  // In production, you might want to verify the source IP
  // For now, we rely on signature verification which is secure
  // Signature verification is the main security check
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Additional security: verify request is from Stripe (optional but recommended)
    if (!isStripeWebhook(request)) {
      console.warn('Webhook request does not appear to be from Stripe');
      // Don't reject immediately, but log it
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentFailed(event.data.object);
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_CANCELED:
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case STRIPE_WEBHOOK_EVENTS.CHARGE_DISPUTE_CREATED:
        await handleChargeDisputeCreated(event.data.object);
        break;

      case STRIPE_WEBHOOK_EVENTS.TRANSFER_CREATED:
        await handleTransferCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Update order status to paid
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_method_id: paymentIntent.payment_method,
      })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (title),
        users!orders_buyer_id_fkey (full_name),
        users!orders_seller_id_fkey (full_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      return;
    }

    // Create notification for seller
    await supabase
      .from('notifications')
      .insert({
        user_id: order.seller_id,
        type: 'order',
        title: 'Payment Received',
        message: `Payment received for order: ${order.products?.title || 'your product'}`,
        data: {
          orderId: order.id,
          amount: order.total_amount,
          buyerName: order.users?.full_name,
        },
      });

    console.log(`Payment succeeded for order ${orderId}`);

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Update order status to cancelled
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (title),
        users!orders_buyer_id_fkey (full_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError);
      return;
    }

    // Create notification for buyer
    await supabase
      .from('notifications')
      .insert({
        user_id: order.buyer_id,
        type: 'order',
        title: 'Payment Failed',
        message: `Payment failed for order: ${order.products?.title || 'your order'}. Please try again.`,
        data: {
          orderId: order.id,
          error: paymentIntent.last_payment_error?.message,
        },
      });

    console.log(`Payment failed for order ${orderId}`);

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentIntentCanceled(paymentIntent: any) {
  try {
    const { orderId } = paymentIntent.metadata;
    
    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Update order status to cancelled
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    console.log(`Payment canceled for order ${orderId}`);

  } catch (error) {
    console.error('Error handling payment intent canceled:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleChargeDisputeCreated(dispute: any) {
  try {
    const paymentIntentId = dispute.payment_intent;
    
    // Get order by payment intent ID
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error || !order) {
      console.error('Error fetching order for dispute:', error);
      return;
    }

    // Update order status to disputed
    await supabase
      .from('orders')
      .update({ status: 'disputed' })
      .eq('id', order.id);

    // Create notification for seller
    await supabase
      .from('notifications')
      .insert({
        user_id: order.seller_id,
        type: 'order',
        title: 'Payment Dispute Created',
        body: `A dispute has been created for your order. Amount: $${order.total_amount}`,
        data: {
          orderId: order.id,
          disputeId: dispute.id,
          amount: dispute.amount,
          reason: dispute.reason,
        },
      });

    // Create notification for buyer
    await supabase
      .from('notifications')
      .insert({
        user_id: order.buyer_id,
        type: 'order',
        title: 'Dispute Created',
        body: `A dispute has been created for your order. We will review this case.`,
        data: {
          orderId: order.id,
          disputeId: dispute.id,
          reason: dispute.reason,
        },
      });

    console.log(`Dispute created for order ${order.id}`);

  } catch (error) {
    console.error('Error handling charge dispute created:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleTransferCreated(transfer: any) {
  try {
    console.log(`Transfer created: ${transfer.id} for amount ${transfer.amount}`);
    // Handle successful transfer to seller account
    // This would typically update the order with transfer information
    
  } catch (error) {
    console.error('Error handling transfer created:', error);
  }
}
