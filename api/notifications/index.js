import { supabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'POST') {
        try {
            const { message, type } = req.body || {};
            if (!message) return res.json({ success: false });

            const { error } = await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: user.id,
                    message,
                    type: type || 'info',
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Notification insert failed:', error.message);
                return res.json({ success: false });
            }

            return res.json({ success: true });
        } catch (err) {
            console.warn('Notification endpoint error:', err.message);
            return res.json({ success: false });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
