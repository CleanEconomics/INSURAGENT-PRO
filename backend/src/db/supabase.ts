import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Supabase Database Client
 *
 * This file configures the Supabase client for database operations.
 * Supabase is a PostgreSQL-based backend-as-a-service that provides:
 * - Auto-generated REST APIs
 * - Real-time subscriptions
 * - Authentication
 * - Storage
 * - Row Level Security (RLS)
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Public Supabase client
 * Uses anon key - respects Row Level Security (RLS) policies
 * Use this for user-facing operations
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceKey!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, don't persist sessions
    },
  }
);

/**
 * Admin Supabase client
 * Uses service role key - bypasses Row Level Security (RLS)
 * Use this for admin operations, migrations, and server-side tasks
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }

    console.log('✅ Connected to Supabase database');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error connecting to Supabase:', err);
    return false;
  }
}

/**
 * Helper function to execute raw SQL queries
 * Use the admin client for unrestricted access
 */
export async function executeSQL(query: string, params?: any[]) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query,
      params: params || []
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('SQL execution error:', err);
    throw err;
  }
}

/**
 * Get a table reference with the admin client
 */
export function getTable<T = any>(tableName: string) {
  return supabaseAdmin.from(tableName);
}

// Log connection status
testConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️  Database connection may not be working. Check your Supabase credentials.');
  }
});

export default supabase;
