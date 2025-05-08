
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Filter documents by search term and selected folder
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.uploader?.first_name && doc.uploader.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.uploader?.last_name && doc.uploader.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      false;
      
    const matchesFolder = selectedFolder ? doc.folder_id === selectedFolder : true;
    
    return matchesSearch && matchesFolder;
  });
  
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
      
      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSuccess={(newFolder) => {
          setFolders([...folders, newFolder]);
          setCreateFolderOpen(false);
        }}
      />
      
      {/* Upload Document Dialog */}
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
