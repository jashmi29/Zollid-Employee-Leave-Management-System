import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;

function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.supabase.co')) {
      url = `https://${url}`;
    } else {
      url = `https://${url}.supabase.co`;
    }
  }
  return url;
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Ensure environment variables are loaded
  dotenv.config();

  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmR2aW54b2lreHV5eW5vYXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMzNTU3OSwiZXhwIjoyMTAwOTExNTc5fQ.c5BctSKQrL_lQyHlwc6w-wj0_JDBhRt3z9478GDY46c';
  
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  const supabaseKey = serviceKey || anonKey || '';
  const isServiceRole = Boolean(serviceKey);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase Database Error: Required environment variables SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY are not defined in process.env.'
    );
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log(
      `Supabase client successfully initialized (${isServiceRole ? 'SERVICE_ROLE key' : 'ANON key'}) with URL:`,
      supabaseUrl
    );
    return supabaseInstance;
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err);
    throw new Error(`Failed to initialize Supabase client: ${err?.message || err}`);
  }
}

export const isSupabaseConfigured = (): boolean => {
  try {
    getSupabaseClient();
    return true;
  } catch {
    return false;
  }
};
