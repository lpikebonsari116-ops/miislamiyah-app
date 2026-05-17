import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && !url.includes('placeholder') && key && !key.includes('placeholder');
};

let supabaseClient: any;

try {
  if (isSupabaseConfigured()) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    throw new Error('Supabase not configured');
  }
} catch (e) {
  console.warn('Supabase not configured properly, using mock mode');
  
  const createMockBuilder = () => {
    let builder: any = {
      data: [],
      error: null,
      select: () => builder,
      from: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
      catch: () => {},
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => builder,
      delete: () => builder
    };
    return builder;
  };
  
  supabaseClient = {
    from: () => createMockBuilder()
  };
}

export const supabase = supabaseClient;
