import { supabaseAdmin } from '../../_lib/supabase.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { respondent_name, respondent_email, respondent_meta } = req.body;

        const { data, error } = await supabaseAdmin
            .from('sessions')
            .insert({
                survey_id: id,
                respondent_name,
                respondent_email,
                respondent_meta: respondent_meta || {}
            })
            .select()
            .single();

        if (error) throw error;

        // Note: No Socket.IO here as it's serverless
        // In a real app we'd use a webhook or Pusher

        return res.status(200).json({ data: { session_id: data.id }, error: null });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
