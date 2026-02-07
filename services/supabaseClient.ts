
import { createClient } from '@supabase/supabase-js';

// Environment variables are injected by the platform (Vercel)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
