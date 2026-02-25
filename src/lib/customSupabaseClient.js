import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktelkciysrphqfzzivy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGVsa2NpeXNycGhxZnp6aXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjAyMTksImV4cCI6MjA4NDc5NjIxOX0.tGZ7dY0x4iTPQEpOLEP0zd2Y4TNJBOuv61jWNl-wZm0';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
