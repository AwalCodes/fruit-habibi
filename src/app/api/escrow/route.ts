import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EscrowService } from '@/lib/escrow';
import { requireAuth, requireOrderParticipation } from '@/lib/auth-server';
import { validateRequestBody, escrowActionSchema, checkRateLimit, uuidSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`escrow:${clientId}`, 30, 60000); // 30 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    // Require authentication
    const user = await requireAuth(request);

    // Validate request body
    const body = await validateRequestBody(request, escrowActionSchema);
    const { action, orderId, reason, processedBy } = body;

    // Most actions require an orderId
    if (action !== 'seller_summary' && !orderId) {
      return NextResponse.json({ error: 'orderId is required for this action' }, { status: 400 });
    }

    if (orderId) {
      // Validate orderId format
      if (!uuidSchema.safeParse(orderId).success) {
        return NextResponse.json({ error: 'Invalid orderId format' }, { status: 400 });
      }

      // Check if user is admin or involved in the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Verify user has access to this order
      await requireOrderParticipation(request, order.buyer_id, order.seller_id);

      // Handle different escrow actions
      switch (action) {
        case 'release':
          if (user.role !== 'admin' && user.id !== order.seller_id) {
            return NextResponse.json({ error: 'Only seller or admin can release funds' }, { status: 403 });
          }
          await EscrowService.releaseFunds(orderId, processedBy || user.id);
          break;

        case 'refund':
          if (user.role !== 'admin' && user.id !== order.buyer_id) {
            return NextResponse.json({ error: 'Only buyer or admin can request refund' }, { status: 403 });
          }
          if (!reason) {
            return NextResponse.json({ error: 'Refund reason is required' }, { status: 400 });
          }
          await EscrowService.refundFunds(orderId, reason, processedBy || user.id);
          break;

        case 'freeze':
          // Only admin can freeze funds
          if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Only admin can freeze funds' }, { status: 403 });
          }
          await EscrowService.freezeFunds(orderId, 'dispute-' + Date.now());
          break;

        case 'status':
          const escrowStatus = await EscrowService.getEscrowStatus(orderId);
          return NextResponse.json({ escrowStatus });

        case 'transactions':
          const transactions = await EscrowService.getEscrowTransactions(orderId);
          return NextResponse.json({ transactions });

        case 'seller_summary':
          if (user.role !== 'admin' && user.id !== order.seller_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
          }
          const summary = await EscrowService.getSellerEscrowSummary(order.seller_id);
          return NextResponse.json({ summary });

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } else if (action === 'seller_summary') {
      // Handle seller_summary without orderId (for current user)
      const summary = await EscrowService.getSellerEscrowSummary(user.id);
      return NextResponse.json({ summary });
    } else {
      return NextResponse.json({ error: 'orderId is required for this action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Escrow action '${action}' completed successfully` });

  } catch (error) {
    console.error('Escrow API error:', error);
    
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

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`escrow-get:${clientId}`, 60, 60000); // 60 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    // Require authentication
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const sellerId = searchParams.get('sellerId');

    if (orderId) {
      // Validate orderId format
      if (!uuidSchema.safeParse(orderId).success) {
        return NextResponse.json({ error: 'Invalid orderId format' }, { status: 400 });
      }

      // Get escrow status for specific order
      const escrowStatus = await EscrowService.getEscrowStatus(orderId);
      if (!escrowStatus) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Verify user has access to this order
      await requireOrderParticipation(request, escrowStatus.buyer_id, escrowStatus.seller_id);

      const transactions = await EscrowService.getEscrowTransactions(orderId);
      return NextResponse.json({ escrowStatus, transactions });
    }

    if (sellerId) {
      // Validate sellerId format
      if (!uuidSchema.safeParse(sellerId).success) {
        return NextResponse.json({ error: 'Invalid sellerId format' }, { status: 400 });
      }

      // Get seller's escrow summary - only admin or the seller themselves can view
      if (user.role !== 'admin' && user.id !== sellerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const summary = await EscrowService.getSellerEscrowSummary(sellerId);
      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: 'Missing orderId or sellerId parameter' }, { status: 400 });

  } catch (error) {
    console.error('Escrow GET API error:', error);
    
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

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

