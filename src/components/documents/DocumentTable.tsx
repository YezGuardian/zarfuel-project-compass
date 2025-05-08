
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Download, 
  Trash2,
  FileText,
  FileIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { Document } from '@/types/document';

interface Folder {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  created_by: string;
}

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  handleDownload: (doc: Document) => void;
  handleDelete: (id: string, name: string) => void;
  formatFileSize: (bytes: number) => string;
  isAdmin: boolean;
  folders: Folder[];
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  handleDownload,
  handleDelete,
  formatFileSize,
  isAdmin,
  folders,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          {documents.length} document{documents.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading documents...</div>
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="mt-2 text-muted-foreground">No documents found</div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      {doc.file_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.folder_id
                      ? folders.find((f) => f.id === doc.folder_id)?.name || 'Unknown'
                      : '-'}
                  </TableCell>
                  <TableCell>{doc.file_type || '-'}</TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {doc.uploader
                      ? `${doc.uploader.first_name || ''} ${doc.uploader.last_name || ''}`.trim() || 
                        (doc.uploader.email || 'Unknown')
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>{format(new Date(doc.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc.id, doc.file_name)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DocumentTable;
