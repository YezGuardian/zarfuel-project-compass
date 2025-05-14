# Setting Up Document Repositories

To implement the document repositories feature, you need to create the required table in your Supabase database.

## Step 1: Access Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your ZARFUEL project
3. Navigate to the "SQL Editor" section

## Step 2: Execute the SQL Query

Copy and paste the following SQL query into the SQL Editor and click "Run":

```sql
-- Create document_repositories table
CREATE TABLE IF NOT EXISTS document_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_document_repositories_created_by
ON document_repositories(created_by);

-- Enable Row Level Security
ALTER TABLE document_repositories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all authenticated users to view document repositories"
ON document_repositories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admin and superadmin to insert document repositories"
ON document_repositories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
);

CREATE POLICY "Allow admin and superadmin to update document repositories"
ON document_repositories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
);

CREATE POLICY "Allow admin and superadmin to delete document repositories"
ON document_repositories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
  )
);
```

## Step 3: Add Comments (Optional)

You can also add comments to the table and columns for better documentation:

```sql
-- Add comments
COMMENT ON TABLE document_repositories IS 'Stores links to external document repositories';
COMMENT ON COLUMN document_repositories.name IS 'Name of the document repository';
COMMENT ON COLUMN document_repositories.url IS 'URL of the document repository';
COMMENT ON COLUMN document_repositories.created_by IS 'User who created the repository';
```

## Step 4: Verify the Table

To verify the table was created correctly, run the following SQL query:

```sql
SELECT * FROM document_repositories;
```

You should see an empty result set with column headers for id, name, url, created_by, created_at, and updated_at.

## Next Steps

After creating the table, refresh your application. Admin users should now be able to add repository links through the Document Repository page interface. 