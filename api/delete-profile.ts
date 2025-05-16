import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
} 