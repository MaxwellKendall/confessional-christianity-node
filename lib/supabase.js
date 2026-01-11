import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabasePublishableKey);
};

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    // Return a mock client for build time or when Supabase is not configured
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    };
  }
  
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
};

// Singleton for client-side use
let browserClient;
export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
};
