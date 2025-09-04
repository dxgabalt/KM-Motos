import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = 'https://kcqumajuzfnfjvftewfm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcXVtYWp1emZuZmp2ZnRld2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODgxNjEsImV4cCI6MjA2NTg2NDE2MX0.LlpoadSXAjujVTgPB6_OMF3Jpt6YsJADCQsdvhTdnfQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});