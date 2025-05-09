
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentFilters } from '@/hooks/useDocumentFilters';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentTabs from '@/components/documents/DocumentTabs';
import CreateFolderDialog from '@/components/documents/CreateFolderDialog';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';

const DocumentsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { 
    documents, 
    folders, 
    isLoading, 
    formatFileSize, 
    handleDownload, 
    handleDelete,
    setDocuments
  } = useDocuments();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedFolder,
    setSelectedFolder,
    filteredDocuments
  } = useDocumentFilters(documents);
  
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <DocumentHeader 
        isAdmin={isAdmin()} 
        onCreateFolder={() => setCreateFolderOpen(true)} 
        onUploadDocument={() => setUploadDialogOpen(true)} 
      />
      
      <DocumentFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <DocumentTabs
        folders={folders}
        filteredDocuments={filteredDocuments}
        isLoading={isLoading}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        formatFileSize={formatFileSize}
        isAdmin={isAdmin()}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />
      
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSuccess={(newFolder) => {
          setCreateFolderOpen(false);
          toast.success('Folder created. Please refresh to see the new folder.');
        }}
      />
      
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folders={folders}
        onSuccess={(newDocument) => {
          setDocuments([newDocument, ...documents]);
          setUploadDialogOpen(false);
        }}
      />
    </div>
  );
};

export default DocumentsPage;
