
import { useState, useMemo } from 'react';
import { Document } from '@/types/document';

export const useDocumentFilters = (documents: Document[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // Filter documents by search term and selected folder
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
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
  }, [documents, searchTerm, selectedFolder]);

  return {
    searchTerm,
    setSearchTerm,
    selectedFolder,
    setSelectedFolder,
    filteredDocuments
  };
};
