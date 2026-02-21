import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fujzkvrzfrjhggiwhsuq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_w9iTelTSU9EMw-0jQTvMYA_PVCYa38J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
