import { supabaseAdmin } from '../../_lib/supabase.js';

export default async function handler(req, res) {
    const { id: surveyId } = req.query;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { session_id, question_id, answer } = req.body;

        const { error } = await supabaseAdmin
            .from('responses')
            .insert({ session_id, question_id, answer });

        if (error) throw error;

        return res.status(200).json({ data: { success: true }, error: null });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
