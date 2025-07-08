import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvijuuirirlrowtxuuvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aWp1dWlyaXJscm93dHh1dXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODY2MjYsImV4cCI6MjA2NzU2MjYyNn0.7aXqsVDQ1SIH42HLfSS0MkJBrpJpTOqQ3EusnsnbYmI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 