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
    
    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) throw bucketsError
    
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents')
    const meetingMinutesBucketExists = buckets.some(bucket => bucket.name === 'meeting_minutes')
    const projectDocumentsBucketExists = buckets.some(bucket => bucket.name === 'project_documents')
    
    let message = []
    
    // Create documents bucket if needed
    if (!documentsBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })
      
      if (createError) throw createError
      
      console.log('Created documents bucket')
      message.push('Documents bucket created successfully')
    } else {
      message.push('Documents bucket already exists')
    }

    // Create meeting_minutes bucket if needed
    if (!meetingMinutesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('meeting_minutes', {
        public: true, // Make public to easily view PDFs
        fileSizeLimit: 20971520, // 20MB for larger documents
      })
      
      if (createError) throw createError
      
      console.log('Created meeting_minutes bucket')
      message.push('Meeting minutes bucket created successfully')
      
      // Set up CORS policy for the meeting_minutes bucket to allow PDF viewing
      await supabase.storage.from('meeting_minutes').updateBucketCors([
        {
          allowedMethods: ['GET', 'OPTIONS'],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAgeSeconds: 3600,
        }
      ])
    } else {
      message.push('Meeting minutes bucket already exists')
    }
    
    // Create project_documents bucket if needed (for backward compatibility)
    if (!projectDocumentsBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('project_documents', {
        public: true,
        fileSizeLimit: 20971520, // 20MB
      })
      
      if (createError) throw createError
      
      console.log('Created project_documents bucket')
      message.push('Project documents bucket created successfully')
      
      // Set up CORS policy for the project_documents bucket
      await supabase.storage.from('project_documents').updateBucketCors([
        {
          allowedMethods: ['GET', 'OPTIONS'],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAgeSeconds: 3600,
        }
      ])
    } else {
      message.push('Project documents bucket already exists')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: message.join(', ')
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
