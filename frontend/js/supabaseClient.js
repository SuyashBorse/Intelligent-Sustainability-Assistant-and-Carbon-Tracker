import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-key';

if (supabaseUrl === 'https://missing-url.supabase.co' || supabaseAnonKey === 'missing-key') {
  console.error('Supabase URL or Anon Key is missing! Please create a .env file based on .env.example');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
