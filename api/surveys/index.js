import { supabaseAdmin } from '../_lib/supabase.js';
import { generateToken } from '../_lib/utils.js';

export default async function handler(req, res) {
    // Simple auth check using Supabase getUser
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
          questions(count),
          sessions(count)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json({ data, error: null });
        } catch (err) {
            return res.status(500).json({ data: null, error: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, goal, target_audience, context } = req.body;
            const share_token = generateToken(8);

            const { data, error } = await supabaseAdmin
                .from('surveys')
                .insert({
                    user_id: user.id,
                    title,
                    goal,
                    target_audience,
                    context,
                    status: 'DRAFT',
                    share_token
                })
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ data, error: null });
        } catch (err) {
            return res.status(500).json({ data: null, error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
