import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
