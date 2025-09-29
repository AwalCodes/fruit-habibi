import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: 'farmer' | 'importer' | 'admin';
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          role: 'farmer' | 'importer' | 'admin';
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: 'farmer' | 'importer' | 'admin';
          country?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          price_usd: number;
          quantity: number;
          unit: string;
          location: string;
          category: string;
          images: string[];
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          price_usd: number;
          quantity: number;
          unit: string;
          location: string;
          category?: string;
          images?: string[];
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          price_usd?: number;
          quantity?: number;
          unit?: string;
          location?: string;
          category?: string;
          images?: string[];
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          product_id: string;
          sender_id: string;
          receiver_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sender_id: string;
          receiver_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sender_id?: string;
          receiver_id?: string;
          body?: string;
          created_at?: string;
        };
      };
    };
  };
};
