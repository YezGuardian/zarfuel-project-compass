
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) throw bucketsError
    
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents')
    
    if (!documentsBucketExists) {
      // Create documents bucket
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })
      
      if (createError) throw createError
      
      console.log('Created documents bucket')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: documentsBucketExists ? 'Documents bucket already exists' : 'Documents bucket created successfully'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error initializing storage:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
