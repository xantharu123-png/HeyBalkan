import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://detmafncymcheenmtkny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldG1hZm5jeW1jaGVlbm10a255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTg3MDksImV4cCI6MjA4ODI3NDcwOX0.s0JJwl3jEinBV7g1eykbyPHhzzxwB0jDdUpvFiFpvcM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
