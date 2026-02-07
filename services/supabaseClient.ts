
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuuglpkaeemrdsortrpu.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_secret_mXzJNldIX9D_9lzSuFWJOw_WjXW4Jra';

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  console.warn("SUPABASE_ANON_KEY is missing. Database operations will fail.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
