import { stripe } from './stripe';
import { supabase } from './supabase';
import { OrderStatus, ESCROW_CONFIG } from './stripe';

export interface EscrowTransaction {
  id: string;
  order_id: string;
  transaction_type: 'hold' | 'release' | 'refund' | 'dispute';
  amount: number;
  stripe_transfer_id?: string;
  stripe_refund_id?: string;
  status: 'pending' | 'completed' | 'failed';
  reason?: string;
  processed_by?: string;
  created_at: string;
  processed_at?: string;
}

export interface OrderWithEscrow {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  net_amount: number;
  commission_fee: number;
  order_status: OrderStatus;
  escrow_status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  escrow_release_date: string;
  delivery_confirmation_date?: string;
  dispute_deadline: string;
  payment_intent_id: string;
  created_at: string;
}

export class EscrowService {
  /**
   * Hold funds in escrow after successful payment
   */
  static async holdFunds(orderId: string): Promise<void> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Update order status to held
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          escrow_status: 'held',
          order_status: OrderStatus.PAID
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error('Failed to update escrow status');
      }

      // Create escrow transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          order_id: orderId,
          transaction_type: 'hold',
          amount: order.net_amount,
          status: 'completed',
          reason: 'Funds held in escrow after successful payment'
        });

      console.log(`Funds held in escrow for order ${orderId}: $${order.net_amount}`);
    } catch (error) {
      console.error('Error holding funds in escrow:', error);
      throw error;
    }
  }

  /**
   * Release funds from escrow to seller
   */
  static async releaseFunds(orderId: string, processedBy?: string): Promise<void> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      if (order.escrow_status !== 'held') {
        throw new Error('Funds are not currently held in escrow');
      }

      // Get seller's Stripe account ID (this would need to be stored in user profile)
      const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('stripe_account_id')
        .eq('id', order.seller_id)
        .single();

      if (sellerError || !seller?.stripe_account_id) {
        throw new Error('Seller Stripe account not found');
      }

      // Create transfer to seller's account
      const transfer = await stripe.transfers.create({
        amount: Math.round(order.net_amount * 100), // Convert to cents
        currency: 'usd',
        destination: seller.stripe_account_id,
        metadata: {
          order_id: orderId,
          seller_id: order.seller_id,
          product_id: order.product_id
        }
      });

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          escrow_status: 'released',
          order_status: OrderStatus.DELIVERED,
          delivery_confirmation_date: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error('Failed to update escrow status');
      }

      // Create escrow transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          order_id: orderId,
          transaction_type: 'release',
          amount: order.net_amount,
          stripe_transfer_id: transfer.id,
          status: 'completed',
          reason: 'Funds released to seller after delivery confirmation',
          processed_by: processedBy
        });

      console.log(`Funds released from escrow for order ${orderId}: $${order.net_amount}`);
    } catch (error) {
      console.error('Error releasing funds from escrow:', error);
      throw error;
    }
  }

  /**
   * Refund funds to buyer
   */
  static async refundFunds(orderId: string, reason: string, processedBy?: string): Promise<void> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      if (!order.payment_intent_id) {
        throw new Error('Payment intent not found');
      }

      // Create refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: Math.round(order.total_amount * 100), // Convert to cents
        metadata: {
          order_id: orderId,
          buyer_id: order.buyer_id,
          reason: reason
        }
      });

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          escrow_status: 'refunded',
          order_status: OrderStatus.REFUNDED
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error('Failed to update order status');
      }

      // Create escrow transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          order_id: orderId,
          transaction_type: 'refund',
          amount: order.total_amount,
          stripe_refund_id: refund.id,
          status: 'completed',
          reason: reason,
          processed_by: processedBy
        });

      console.log(`Funds refunded for order ${orderId}: $${order.total_amount}`);
    } catch (error) {
      console.error('Error refunding funds:', error);
      throw error;
    }
  }

  /**
   * Handle dispute - freeze escrow funds
   */
  static async freezeFunds(orderId: string, disputeId: string): Promise<void> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Update order status to disputed
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          escrow_status: 'disputed',
          order_status: OrderStatus.DISPUTED
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error('Failed to update escrow status');
      }

      // Create escrow transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          order_id: orderId,
          transaction_type: 'dispute',
          amount: order.net_amount,
          status: 'completed',
          reason: `Funds frozen due to dispute: ${disputeId}`
        });

      console.log(`Funds frozen for order ${orderId} due to dispute: $${order.net_amount}`);
    } catch (error) {
      console.error('Error freezing funds:', error);
      throw error;
    }
  }

  /**
   * Auto-release funds after escrow period expires
   */
  static async autoReleaseExpiredFunds(): Promise<void> {
    try {
      const now = new Date();
      
      // Find orders where escrow period has expired
      const { data: expiredOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('escrow_status', 'held')
        .lt('escrow_release_date', now.toISOString());

      if (error) {
        throw new Error('Failed to fetch expired orders');
      }

      for (const order of expiredOrders || []) {
        try {
          await this.releaseFunds(order.id, 'system');
          console.log(`Auto-released funds for order ${order.id}`);
        } catch (error) {
          console.error(`Failed to auto-release funds for order ${order.id}:`, error);
        }
      }

      console.log(`Processed ${expiredOrders?.length || 0} expired escrow orders`);
    } catch (error) {
      console.error('Error in auto-release process:', error);
      throw error;
    }
  }

  /**
   * Get escrow status for an order
   */
  static async getEscrowStatus(orderId: string): Promise<OrderWithEscrow | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return null;
      }

      return order as OrderWithEscrow;
    } catch (error) {
      console.error('Error fetching escrow status:', error);
      return null;
    }
  }

  /**
   * Get escrow transactions for an order
   */
  static async getEscrowTransactions(orderId: string): Promise<EscrowTransaction[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch escrow transactions');
      }

      return transactions || [];
    } catch (error) {
      console.error('Error fetching escrow transactions:', error);
      return [];
    }
  }

  /**
   * Get seller's escrow summary
   */
  static async getSellerEscrowSummary(sellerId: string): Promise<{
    totalHeld: number;
    totalReleased: number;
    totalRefunded: number;
    pendingOrders: number;
    releasedOrders: number;
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('escrow_status, net_amount, total_amount')
        .eq('seller_id', sellerId);

      if (error) {
        throw new Error('Failed to fetch seller orders');
      }

      const summary = {
        totalHeld: 0,
        totalReleased: 0,
        totalRefunded: 0,
        pendingOrders: 0,
        releasedOrders: 0
      };

      for (const order of orders || []) {
        switch (order.escrow_status) {
          case 'held':
            summary.totalHeld += order.net_amount;
            summary.pendingOrders++;
            break;
          case 'released':
            summary.totalReleased += order.net_amount;
            summary.releasedOrders++;
            break;
          case 'refunded':
            summary.totalRefunded += order.total_amount;
            break;
        }
      }

      return summary;
    } catch (error) {
      console.error('Error fetching seller escrow summary:', error);
      return {
        totalHeld: 0,
        totalReleased: 0,
        totalRefunded: 0,
        pendingOrders: 0,
        releasedOrders: 0
      };
    }
  }

  /**
   * Check if order is eligible for auto-release
   */
  static async checkAutoReleaseEligibility(orderId: string): Promise<boolean> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('escrow_status, escrow_release_date, dispute_deadline')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return false;
      }

      const now = new Date();
      const releaseDate = new Date(order.escrow_release_date);
      const disputeDeadline = new Date(order.dispute_deadline);

      // Check if escrow period has expired and no dispute was filed
      return (
        order.escrow_status === 'held' &&
        now >= releaseDate &&
        now > disputeDeadline
      );
    } catch (error) {
      console.error('Error checking auto-release eligibility:', error);
      return false;
    }
  }
}

