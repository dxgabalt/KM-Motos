import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = 'https://jwsxkmbvqtjhvxotiegx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3hrbWJ2cXRqaHZ4b3RpZWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODIyNTQsImV4cCI6MjA2NzE1ODI1NH0.FeaICosHsNc57r251y4e3KfAJ1cKoeolEfrj0a1SPuk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);