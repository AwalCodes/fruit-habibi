import { supabase } from './supabase';

export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: 'email' | 'phone' | 'password_reset';
  target: string;
  expires_at: string;
  used: boolean;
  attempts: number;
  created_at: string;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: 'government_id' | 'passport' | 'drivers_license' | 'business_license' | 'tax_certificate';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustEvent {
  id: string;
  user_id: string;
  event_type: 'order_completed' | 'order_cancelled' | 'review_received' | 'dispute_filed' | 'dispute_resolved' | 'payment_failed' | 'account_verified';
  event_data?: any;
  trust_score_change: number;
  description?: string;
  created_at: string;
}

export interface UserVerification {
  verification_status: 'unverified' | 'email_verified' | 'phone_verified' | 'id_verified' | 'fully_verified';
  email_verified_at?: string;
  phone_verified_at?: string;
  id_verified_at?: string;
  trust_score: number;
  seller_tier: 'basic' | 'verified' | 'premium' | 'enterprise';
  phone_number?: string;
  business_name?: string;
  business_type?: 'individual' | 'small_business' | 'corporation' | 'cooperative';
}

class VerificationService {
  // Generate a random 6-digit verification code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send email verification code
  async sendEmailVerificationCode(email: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          user_id: userId,
          code,
          type: 'email',
          target: email,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Error storing email verification code:', insertError);
        return { success: false, error: 'Failed to generate verification code' };
      }

      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      // For now, we'll log the code to console
      console.log(`📧 Email verification code for ${email}: ${code}`);
      
      // In production, send actual email
      // await this.sendEmail(email, 'Verify Your Email', `Your verification code is: ${code}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error sending email verification:', error);
      return { success: false, error: error.message || 'Failed to send verification code' };
    }
  }

  // Send phone verification code (SMS)
  async sendPhoneVerificationCode(phoneNumber: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          user_id: userId,
          code,
          type: 'phone',
          target: phoneNumber,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Error storing phone verification code:', insertError);
        return { success: false, error: 'Failed to generate verification code' };
      }

      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, we'll log the code to console
      console.log(`📱 SMS verification code for ${phoneNumber}: ${code}`);
      
      // In production, send actual SMS
      // await this.sendSMS(phoneNumber, `Your Fruit Habibi verification code is: ${code}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error sending phone verification:', error);
      return { success: false, error: error.message || 'Failed to send verification code' };
    }
  }

  // Verify email code
  async verifyEmailCode(email: string, code: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: verificationCode, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('target', email)
        .eq('type', 'email')
        .eq('code', code)
        .eq('used', false)
        .single();

      if (error || !verificationCode) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      // Check if code is expired
      if (new Date(verificationCode.expires_at) < new Date()) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Mark code as used
      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', verificationCode.id);

      // Update user verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email_verified_at: new Date().toISOString(),
          verification_status: 'email_verified',
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user email verification:', updateError);
        return { success: false, error: 'Failed to update verification status' };
      }

      // Record trust event
      await this.recordTrustEvent(userId, 'account_verified', 5, 'Email verification completed');

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying email code:', error);
      return { success: false, error: error.message || 'Verification failed' };
    }
  }

  // Verify phone code
  async verifyPhoneCode(phoneNumber: string, code: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: verificationCode, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('target', phoneNumber)
        .eq('type', 'phone')
        .eq('code', code)
        .eq('used', false)
        .single();

      if (error || !verificationCode) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      // Check if code is expired
      if (new Date(verificationCode.expires_at) < new Date()) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Mark code as used
      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', verificationCode.id);

      // Update user verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_number: phoneNumber,
          phone_verified_at: new Date().toISOString(),
          verification_status: 'phone_verified',
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user phone verification:', updateError);
        return { success: false, error: 'Failed to update verification status' };
      }

      // Record trust event
      await this.recordTrustEvent(userId, 'account_verified', 5, 'Phone verification completed');

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying phone code:', error);
      return { success: false, error: error.message || 'Verification failed' };
    }
  }

  // Upload verification document
  async uploadVerificationDocument(
    userId: string,
    documentType: VerificationDocument['document_type'],
    documentUrl: string
  ): Promise<{ success: boolean; error?: string; documentId?: string }> {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: userId,
          document_type: documentType,
          document_url: documentUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error uploading verification document:', error);
        return { success: false, error: 'Failed to upload document' };
      }

      return { success: true, documentId: data.id };
    } catch (error: any) {
      console.error('Error uploading verification document:', error);
      return { success: false, error: error.message || 'Failed to upload document' };
    }
  }

  // Get user verification status
  async getUserVerification(userId: string): Promise<{ data?: UserVerification; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          verification_status,
          email_verified_at,
          phone_verified_at,
          id_verified_at,
          trust_score,
          seller_tier,
          phone_number,
          business_name,
          business_type
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user verification:', error);
        return { error: 'Failed to fetch verification status' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching user verification:', error);
      return { error: error.message || 'Failed to fetch verification status' };
    }
  }

  // Record trust event
  async recordTrustEvent(
    userId: string,
    eventType: TrustEvent['event_type'],
    trustScoreChange: number,
    description?: string,
    eventData?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('trust_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          trust_score_change: trustScoreChange,
          description,
          event_data: eventData,
        });

      if (error) {
        console.error('Error recording trust event:', error);
        return { success: false, error: 'Failed to record trust event' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error recording trust event:', error);
      return { success: false, error: error.message || 'Failed to record trust event' };
    }
  }

  // Get user's verification documents
  async getVerificationDocuments(userId: string): Promise<{ data?: VerificationDocument[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification documents:', error);
        return { error: 'Failed to fetch verification documents' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching verification documents:', error);
      return { error: error.message || 'Failed to fetch verification documents' };
    }
  }

  // Get user's trust events
  async getTrustEvents(userId: string, limit: number = 10): Promise<{ data?: TrustEvent[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('trust_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trust events:', error);
        return { error: 'Failed to fetch trust events' };
      }

      return { data };
    } catch (error: any) {
      console.error('Error fetching trust events:', error);
      return { error: error.message || 'Failed to fetch trust events' };
    }
  }
}

export const verificationService = new VerificationService();

