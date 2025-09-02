import { CustomSize, MenuItemSize } from '@/pages/AdminPage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for our database
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  sizes?: Record<string, number>;
  image_url?: string;
  tags?: string[];
  popular?: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  // Add these fields to your existing MenuItem type in supabase.ts
  pricing_type: 'fixed' | 'consistent_size' | 'custom_size';
  custom_sizes?: CustomSize[];
  menu_item_sizes?: MenuItemSize[];
}
