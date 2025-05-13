import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    // Initialize storage buckets
    const { data, error } = await supabase.functions.invoke('init-storage');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      details: data
    });
  } catch (error) {
    console.error('Error initializing application:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize application',
        error: error.message
      },
      { status: 500 }
    );
  }
} 