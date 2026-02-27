import { supabaseAdmin } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
    const { token } = req.query;

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { data, error } = await supabaseAdmin
            .from('surveys')
            .select('*, questions(*), respondent_fields(*)')
            .eq('share_token', token)
            .order('order_index', { foreignTable: 'questions' })
            .order('order_index', { foreignTable: 'respondent_fields' })
            .single();

        if (error) throw error;
        return res.status(200).json({ data, error: null });
    } catch (err) {
        return res.status(404).json({ error: 'Survey not found' });
    }
}
