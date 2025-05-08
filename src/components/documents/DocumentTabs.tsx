
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentTable from './DocumentTable';
import { Document } from '@/types/document';

interface Folder {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  created_by: string;
}

interface DocumentTabsProps {
  folders: Folder[];
  filteredDocuments: Document[];
  isLoading: boolean;
  handleDownload: (doc: Document) => void;
  handleDelete: (id: string, name: string) => void;
  formatFileSize: (bytes: number) => string;
  isAdmin: boolean;
  selectedFolder: string | null;
  setSelectedFolder: (folderId: string | null) => void;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({
  folders,
  filteredDocuments,
  isLoading,
  handleDownload,
  handleDelete,
  formatFileSize,
  isAdmin,
  selectedFolder,
  setSelectedFolder,
}) => {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedFolder(null)}>
            All Documents
          </TabsTrigger>
          {folders.map((folder) => (
            <TabsTrigger
              key={folder.id}
              value={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
            >
              {folder.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-4">
        <DocumentTable
          documents={filteredDocuments}
          isLoading={isLoading}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          formatFileSize={formatFileSize}
          isAdmin={isAdmin}
          folders={folders}
        />
      </TabsContent>

      {folders.map((folder) => (
        <TabsContent key={folder.id} value={folder.id} className="space-y-4">
          <DocumentTable
            documents={filteredDocuments.filter((doc) => doc.folder_id === folder.id)}
            isLoading={isLoading}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
            formatFileSize={formatFileSize}
            isAdmin={isAdmin}
            folders={folders}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default DocumentTabs;
