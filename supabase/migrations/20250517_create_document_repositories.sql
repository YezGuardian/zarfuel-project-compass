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

-- Add comments
COMMENT ON TABLE document_repositories IS 'Stores links to external document repositories';
COMMENT ON COLUMN document_repositories.name IS 'Name of the document repository';
COMMENT ON COLUMN document_repositories.url IS 'URL of the document repository';
COMMENT ON COLUMN document_repositories.created_by IS 'User who created the repository'; 