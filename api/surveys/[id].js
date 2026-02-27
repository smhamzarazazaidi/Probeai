import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
    const { id } = req.query; // Vercel populates this from [id].js

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabaseAdmin
                .from('surveys')
                .select(`
          *,
          questions(*),
          sessions(count),
          respondent_fields(*)
        `)
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return res.status(200).json({ data, error: null });
        } catch (err) {
            return res.status(500).json({ data: null, error: err.message });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { status, title, goal, target_audience, context } = req.body;
            const { data, error } = await supabaseAdmin
                .from('surveys')
                .update({ status, title, goal, target_audience, context })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ data, error: null });
        } catch (err) {
            return res.status(500).json({ data: null, error: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { error } = await supabaseAdmin
                .from('surveys')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
