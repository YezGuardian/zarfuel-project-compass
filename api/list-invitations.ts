import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { data, error } = await supabase.from('invitations').select('*');
    if (error) {
      return res.status(500).json({ invitations: [], error: error.message });
    }
    return res.status(200).json({ invitations: data });
  } catch (error) {
    return res.status(500).json({ invitations: [], error: error instanceof Error ? error.message : 'Internal server error' });
  }
} 