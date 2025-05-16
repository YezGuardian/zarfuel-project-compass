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
    const { email, password, role, organization, position, invited_by } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        invited_by,
        needs_password_change: true
      },
    });
    if (authError) {
      return res.status(500).json({ error: authError.message });
    }
    if (authData.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          role,
          organization: organization || null,
          position: position || null,
          invited_by: invited_by || null,
          created_at: new Date().toISOString()
        });
    }
    return res.status(200).json({ success: true, user: authData.user });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
} 