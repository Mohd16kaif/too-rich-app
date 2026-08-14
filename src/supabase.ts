import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

if (!Config.SUPABASE_URL || !Config.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file has SUPABASE_URL and SUPABASE_ANON_KEY set.'
  );
}

export const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
