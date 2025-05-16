import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, organization, position, invited_by } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Create the user in Supabase Auth
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
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Add user profile (optional, if you use a 'profiles' table)
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

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 