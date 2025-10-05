import { supabase } from './supabase';

export interface Dispute {
  id: string;
  order_id: string;
  complainant_id: string;
  respondent_id: string;
  dispute_type: 'quality_issue' | 'delivery_problem' | 'payment_dispute' | 'communication_issue' | 'other';
  title: string;
  description: string;
  status: 'open' | 'pending_resolution' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence_urls: string[];
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  complainant?: {
    full_name: string;
  };
  respondent?: {
    full_name: string;
  };
  resolver?: {
    full_name: string;
  };
  // Joined data
  orders?: {
    id: string;
    total_amount_usd: number;
    products?: {
      title: string;
    };
    buyers?: {
      full_name: string;
    };
    sellers?: {
      full_name: string;
    };
  };
  complainant?: {
    full_name: string;
  };
  respondent?: {
    full_name: string;
  };
  resolver?: {
    full_name: string;
  };
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  attachments: string[];
  created_at: string;
  sender?: {
    full_name: string;
  };
}

export interface DisputeAction {
  id: string;
  dispute_id: string;
  action_type: 'created' | 'assigned' | 'escalated' | 'resolved' | 'closed' | 'evidence_added' | 'refund_issued' | 'replacement_sent';
  performed_by: string;
  description: string;
  metadata?: any;
  created_at: string;
  performer?: {
    full_name: string;
  };
}

class DisputeService {
  // Create a new dispute
  async createDispute(
    orderId: string,
    disputeType: Dispute['dispute_type'],
    title: string,
    description: string,
    evidenceUrls: string[] = [],
    priority: Dispute['priority'] = 'medium'
  ): Promise<{ success: boolean; disputeId?: string; error?: string }> {
    try {
      // Get order details to determine parties
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('buyer_id, seller_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: 'Order not found' };
      }

      const { user } = (await supabase.auth.getUser()).data;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Determine who is initiating the dispute
      const complainantId = user.id;
      const respondentId = complainantId === order.buyer_id ? order.seller_id : order.buyer_id;

      const { data, error } = await supabase
        .from('disputes')
        .insert({
          order_id: orderId,
          complainant_id: complainantId,
          respondent_id: respondentId,
          dispute_type: disputeType,
          title,
          description,
          evidence_urls: evidenceUrls,
          priority,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating dispute:', error);
        return { success: false, error: 'Failed to create dispute' };
      }

      return { success: true, disputeId: data.id };
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      return { success: false, error: error.message || 'Failed to create dispute' };
    }
  }

  // Get disputes for a user
  async getUserDisputes(userId: string): Promise<{ data?: Dispute[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          complainant:complainant_id(full_name),
          respondent:respondent_id(full_name),
          resolver:resolved_by(full_name)
        `)
        .or(`complainant_id.eq.${userId},respondent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user disputes:', error);
        return { error: 'Failed to fetch disputes' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching user disputes:', error);
      return { error: error.message || 'Failed to fetch disputes' };
    }
  }

  // Get dispute details (for DisputeManager)
  async getDisputeDetails(disputeId: string): Promise<{ messages?: DisputeMessage[]; actions?: DisputeAction[]; error?: string }> {
    try {
      const [messagesResult, actionsResult] = await Promise.all([
        this.getDisputeMessages(disputeId),
        this.getDisputeActions(disputeId)
      ]);

      return {
        messages: messagesResult.data,
        actions: actionsResult.data,
        error: messagesResult.error || actionsResult.error
      };
    } catch (error: any) {
      console.error('Error fetching dispute details:', error);
      return { error: error.message || 'Failed to fetch dispute details' };
    }
  }

  // Get dispute details
  async getDispute(disputeId: string): Promise<{ data?: Dispute; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          complainant:complainant_id(full_name),
          respondent:respondent_id(full_name),
          resolver:resolved_by(full_name)
        `)
        .eq('id', disputeId)
        .single();

      if (error) {
        console.error('Error fetching dispute:', error);
        return { error: 'Failed to fetch dispute' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching dispute:', error);
      return { error: error.message || 'Failed to fetch dispute' };
    }
  }

  // Get dispute messages
  async getDisputeMessages(disputeId: string): Promise<{ data?: DisputeMessage[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('dispute_messages')
        .select(`
          *,
          sender:sender_id(full_name)
        `)
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching dispute messages:', error);
        return { error: 'Failed to fetch dispute messages' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching dispute messages:', error);
      return { error: error.message || 'Failed to fetch dispute messages' };
    }
  }

  // Add dispute message (simplified version)
  async addDisputeMessage(
    disputeId: string,
    senderId: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          sender_id: senderId,
          message,
          is_internal: false,
        });

      if (error) {
        console.error('Error adding dispute message:', error);
        return { success: false, error: 'Failed to send message' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error adding dispute message:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  }

  // Send dispute message
  async sendDisputeMessage(
    disputeId: string,
    message: string,
    attachments: string[] = [],
    isInternal: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          sender_id: user.id,
          message,
          attachments,
          is_internal: isInternal,
        });

      if (error) {
        console.error('Error sending dispute message:', error);
        return { success: false, error: 'Failed to send message' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error sending dispute message:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  }

  // Update dispute status (admin only)
  async updateDisputeStatus(
    disputeId: string,
    status: Dispute['status'],
    resolutionNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || userData?.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const updateData: any = {
        status,
        resolved_by: status === 'resolved' ? user.id : null,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      };

      if (resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);

      if (error) {
        console.error('Error updating dispute status:', error);
        return { success: false, error: 'Failed to update dispute' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating dispute status:', error);
      return { success: false, error: error.message || 'Failed to update dispute' };
    }
  }

  // Upload dispute evidence
  async uploadDisputeEvidence(
    userId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('dispute-evidence')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading evidence:', error);
        return { success: false, error: 'Failed to upload evidence' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('dispute-evidence')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      return { success: false, error: error.message || 'Failed to upload evidence' };
    }
  }

  // Add evidence to dispute
  async addEvidence(
    disputeId: string,
    evidenceUrls: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get current dispute
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .select('evidence_urls, complainant_id, respondent_id')
        .eq('id', disputeId)
        .single();

      if (disputeError || !dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      // Check if user is involved in the dispute
      if (user.id !== dispute.complainant_id && user.id !== dispute.respondent_id) {
        return { success: false, error: 'Not authorized to add evidence to this dispute' };
      }

      // Merge with existing evidence
      const currentEvidence = dispute.evidence_urls || [];
      const newEvidence = [...currentEvidence, ...evidenceUrls];

      const { error } = await supabase
        .from('disputes')
        .update({ evidence_urls: newEvidence })
        .eq('id', disputeId);

      if (error) {
        console.error('Error adding evidence:', error);
        return { success: false, error: 'Failed to add evidence' };
      }

      // Create action record
      await supabase
        .from('dispute_actions')
        .insert({
          dispute_id: disputeId,
          action_type: 'evidence_added',
          performed_by: user.id,
          description: `Evidence added: ${evidenceUrls.length} file(s)`,
          metadata: { evidence_urls: evidenceUrls },
        });

      return { success: true };
    } catch (error: any) {
      console.error('Error adding evidence:', error);
      return { success: false, error: error.message || 'Failed to add evidence' };
    }
  }

  // Get dispute actions/history
  async getDisputeActions(disputeId: string): Promise<{ data?: DisputeAction[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('dispute_actions')
        .select(`
          *,
          performer:performed_by(full_name)
        `)
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching dispute actions:', error);
        return { error: 'Failed to fetch dispute actions' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching dispute actions:', error);
      return { error: error.message || 'Failed to fetch dispute actions' };
    }
  }

  // Get admin dashboard data
  async getAdminDisputeStats(): Promise<{ data?: any; error?: string }> {
    try {
      // Get dispute counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('disputes')
        .select('status')
        .then(({ data }) => {
          if (!data) return { data: null, error: null };
          const counts = data.reduce((acc: any, dispute) => {
            acc[dispute.status] = (acc[dispute.status] || 0) + 1;
            return acc;
          }, {});
          return { data: counts, error: null };
        });

      // Get recent disputes
      const { data: recentDisputes, error: recentError } = await supabase
        .from('disputes')
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          complainant:complainant_id(full_name),
          respondent:respondent_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (statusError || recentError) {
        return { error: 'Failed to fetch admin stats' };
      }

      return {
        data: {
          statusCounts: statusCounts || {},
          recentDisputes: recentDisputes || [],
        },
      };
    } catch (error: any) {
      console.error('Error fetching admin dispute stats:', error);
      return { error: error.message || 'Failed to fetch admin stats' };
    }
  }
}

export const disputeService = new DisputeService();
