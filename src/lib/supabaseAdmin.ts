import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // During build process these might be missing, but we need them for the server
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing Supabase admin environment variables');
    }
}

export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseServiceKey || ''
);
