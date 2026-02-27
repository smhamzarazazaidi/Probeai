import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { error } = await supabaseAdmin
            .from('sessions')
            .update({ completed_at: new Date() })
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
