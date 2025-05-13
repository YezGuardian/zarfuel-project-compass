import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-s3-access-key, x-s3-secret-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { sql_query, s3_access_key, s3_secret_key } = await req.json();
    
    // Validate access keys
    const validS3AccessKey = 'b060f494076a6e87be347359a7b7485c';
    const validS3SecretKey = '35ee85209ea190baee5fdd75320c2d1c19360209d44a7f43b316d47447e2e067';
    
    if (s3_access_key !== validS3AccessKey || s3_secret_key !== validS3SecretKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid S3 credentials' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create a Supabase client with the service role key (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );
    
    // Execute the SQL query directly with admin privileges
    const { data, error } = await supabaseAdmin.rpc('pgSQL', { query: sql_query });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 