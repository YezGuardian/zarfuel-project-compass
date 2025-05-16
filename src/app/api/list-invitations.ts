import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from('invitations').select('*');
    if (error) {
      return NextResponse.json({ invitations: [], error: error.message }, { status: 500 });
    }
    return NextResponse.json({ invitations: data }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ invitations: [], error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
} 