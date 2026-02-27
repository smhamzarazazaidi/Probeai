import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let internalAdmin: any = null;

export const getSupabaseAdmin = () => {
    if (!internalAdmin) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('CRITICAL: Missing Supabase admin environment variables.');
            // Return a dummy client to prevent crash, but operations will fail gracefully or throw later
            return createClient('https://placeholder.supabase.co', 'placeholder');
        }
        internalAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
    return internalAdmin;
};

// For backward compatibility with existing imports in this task
export const supabaseAdmin = new Proxy({} as any, {
    get: (target, prop) => {
        return (getSupabaseAdmin() as any)[prop];
    }
});
