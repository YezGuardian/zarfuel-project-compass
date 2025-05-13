-- Create a function to execute SQL directly (admin only)
CREATE OR REPLACE FUNCTION pgSQL(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the user who created it (superuser)
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Only allow execution for users with verified S3 credentials
    IF EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_app_meta_data->>'s3_access_verified' = 'true'
    ) THEN
        EXECUTE query INTO result;
        RETURN result;
    ELSE
        RAISE EXCEPTION 'Unauthorized: Valid S3 credentials required';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Add a more secure version for SELECT operations only
CREATE OR REPLACE FUNCTION pgSQL_select(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Ensure the query is a SELECT statement
    IF NOT (lower(trim(query)) LIKE 'select%') THEN
        RAISE EXCEPTION 'Only SELECT statements are allowed';
    END IF;
    
    -- Execute the query
    EXECUTE query INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Add a function to verify S3 credentials
CREATE OR REPLACE FUNCTION verify_s3_credentials(access_key text, secret_key text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate against hardcoded credentials (in production, use a more secure approach)
    IF access_key = 'b060f494076a6e87be347359a7b7485c' AND 
       secret_key = '35ee85209ea190baee5fdd75320c2d1c19360209d44a7f43b316d47447e2e067' THEN
        -- Update the user's metadata to mark them as verified
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('s3_access_verified', 'true')
        WHERE id = auth.uid();
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Create an RPC function to execute SQL (with admin privileges)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text, s3_access_key text DEFAULT NULL, s3_secret_key text DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    is_verified BOOLEAN;
BEGIN
    -- Verify credentials if provided
    IF s3_access_key IS NOT NULL AND s3_secret_key IS NOT NULL THEN
        is_verified := verify_s3_credentials(s3_access_key, s3_secret_key);
        IF NOT is_verified THEN
            RAISE EXCEPTION 'Invalid S3 credentials';
        END IF;
    END IF;
    
    -- Check if the user is verified
    IF EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_app_meta_data->>'s3_access_verified' = 'true'
    ) THEN
        -- Execute the SQL
        RETURN pgSQL(sql_query);
    ELSE
        RAISE EXCEPTION 'Unauthorized: Valid S3 credentials required';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$; 