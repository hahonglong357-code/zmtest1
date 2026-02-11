import { createClient } from '@supabase/supabase-js';

// The URL and Anon Key provided by the user. 
// Publishable keys (starting with sb_publishable_) are safe for browser use.
const SUPABASE_URL = 'https://kuuglpkaeemrdsortrpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MPR6Or7hb3M-qDK6HDk8iQ_J5lq5qh9';

// We use the provided constants as defaults but allow override via process.env if available
const finalUrl = process.env.SUPABASE_URL || SUPABASE_URL;
const finalKey = process.env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(finalUrl, finalKey);