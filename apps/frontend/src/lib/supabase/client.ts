import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Create a .env.local file in the root of your project
// and add your Supabase URL and Anon Key there.
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Check your .env.local file.");
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
