import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://nuxkjkyjtxfyqmegofby.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eGtqa3lqdHhmeXFtZWdvZmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDkwNTQsImV4cCI6MjA3Njk4NTA1NH0.gjvHxB4gAdNEfGxKD6_Iv2dhrXGO537xSu_Nb8iPk1A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);