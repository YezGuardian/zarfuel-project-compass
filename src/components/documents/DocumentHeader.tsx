
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileArchive, Upload } from 'lucide-react';

interface DocumentHeaderProps {
  isAdmin: boolean;
  onCreateFolder: () => void;
  onUploadDocument: () => void;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ 
  isAdmin, 
  onCreateFolder, 
  onUploadDocument 
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Repository</h1>
        <p className="text-muted-foreground">
          Access, manage and share project documents
        </p>
      </div>
      
      <div className="flex space-x-2">
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={onCreateFolder}
          >
            <FileArchive className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
        <Button 
          onClick={onUploadDocument}
          className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentHeader;
