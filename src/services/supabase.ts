import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http'))
  ? rawUrl.trim()
  : 'https://ocsihusphhwodkwtsurq.supabase.co';

const supabaseAnonKey = (typeof rawKey === 'string' && rawKey.length > 10)
  ? rawKey.trim()
  : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
