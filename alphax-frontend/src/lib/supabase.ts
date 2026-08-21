import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session is automatically persisted in localStorage
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─── Database types ────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  timezone: string;
  trading_style: string | null;
  primary_market: string | null;
  default_account_size: number | null;
  default_risk_pct: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  notify_price_alerts: boolean;
  notify_high_impact: boolean;
  notify_risk_alerts: boolean;
  notify_journal: boolean;
  theme: string;
  accent_color: string;
  density: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  category: string;
  sort_order: number;
  created_at: string;
}
