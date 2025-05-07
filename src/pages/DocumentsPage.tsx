
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  FileText, 
  Download, 
  Trash2, 
  Upload,
  Search,
  FileArchive,
  FilePlus,
  File as FileIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateFolderDialog from '@/components/documents/CreateFolderDialog';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { Document } from '@/types/document';

interface Folder {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  created_by: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const DocumentsPage: React.FC = () => {
  const { user, isAdmin, profile } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Fetch documents, folders and users
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select(`
            *,
            uploader:uploaded_by(
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
          
        if (documentsError) throw documentsError;
        
        // Fix for TS error by ensuring the data matches Document type
        const typedDocuments: Document[] = documentsData?.map(doc => {
          // Handle the case where uploader might be null or an error object
          let uploaderValue: Document['uploader'] = null;
          if (doc.uploader && typeof doc.uploader === 'object' && 'first_name' in doc.uploader) {
            uploaderValue = {
              first_name: doc.uploader.first_name,
              last_name: doc.uploader.last_name,
              email: doc.uploader.email
            };
          }
          
          return {
            ...doc,
            downloaded_by: Array.isArray(doc.downloaded_by) ? doc.downloaded_by : (doc.downloaded_by ? [doc.downloaded_by] : []),
            uploader: uploaderValue
          };
        }) || [];
        
        // Fetch folders
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .order('name');
          
        if (foldersError) throw foldersError;
        
        // Fetch users for display
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email');
          
        if (usersError) throw usersError;
        
        setDocuments(typedDocuments);
        setFolders(foldersData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
  
  // Handle document download
  const handleDownload = async (document: Document) => {
    window.open(document.file_path, '_blank');
    
    // Track download
    if (user) {
      try {
        // Get current downloaded_by
        const { data, error } = await supabase
          .from('documents')
          .select('downloaded_by')
          .eq('id', document.id)
          .single();
          
        if (error) throw error;
        
        // Fix for TS error by handling downloaded_by array safely
        const downloadedBy = data?.downloaded_by ? 
          (Array.isArray(data.downloaded_by) ? data.downloaded_by : []) : [];
        
        const newDownloadedBy = [
          ...downloadedBy, 
          { 
            user_id: user.id, 
            name: `${profile?.first_name || ''} ${profile?.last_name || ''}`,
            email: user.email,
            timestamp: new Date().toISOString()
          }
        ];
        
        await supabase
          .from('documents')
          .update({ downloaded_by: newDownloadedBy })
          .eq('id', document.id);
          
        // Create notification for admin users when a document is downloaded
        if (isAdmin()) {
          const notificationContent = `${profile?.first_name || user.email} downloaded ${document.file_name}`;
          
          await supabase
            .from('notifications')
            .insert([
              {
                user_id: user.id,
                type: 'document',
                content: notificationContent,
                link: '/documents'
              }
            ]);
        }
      } catch (error) {
        console.error('Error tracking download:', error);
      }
    }
  };
  
  // Handle document deletion
  const handleDelete = async (documentId: string, documentName: string) => {
    if (!isAdmin()) {
      toast.error('Only admins can delete documents');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
        
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
      
      // Create notification for admin users
      if (user && isAdmin()) {
        const notificationContent = `${profile?.first_name || user.email} deleted document: ${documentName}`;
        
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: user.id,
              type: 'document',
              content: notificationContent,
              link: '/documents'
            }
          ]);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground">
            Access, manage and share project documents
          </p>
        </div>
        
        <div className="flex space-x-2">
          {isAdmin() && (
            <Button 
              variant="outline" 
              onClick={() => setCreateFolderOpen(true)}
            >
              <FileArchive className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          )}
          <Button 
            onClick={() => setUploadDialogOpen(true)}
            className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedFolder(null)}>
              All Documents
            </TabsTrigger>
            {folders.map(folder => (
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
            isAdmin={isAdmin()}
            folders={folders}
          />
        </TabsContent>
        
        {folders.map(folder => (
          <TabsContent key={folder.id} value={folder.id} className="space-y-4">
            <DocumentTable 
              documents={filteredDocuments.filter(doc => doc.folder_id === folder.id)} 
              isLoading={isLoading}
              handleDownload={handleDownload}
              handleDelete={handleDelete}
              formatFileSize={formatFileSize}
              isAdmin={isAdmin()}
              folders={folders}
            />
          </TabsContent>
        ))}
      </Tabs>
      
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

// Document Table component
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
  folders
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
              documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      {doc.file_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.folder_id ? 
                      folders.find(f => f.id === doc.folder_id)?.name || 'Unknown' : 
                      '-'}
                  </TableCell>
                  <TableCell>{doc.file_type || '-'}</TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {doc.uploader ? 
                      `${doc.uploader.first_name || ''} ${doc.uploader.last_name || ''}`.trim() || doc.uploader.email : 
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </TableCell>
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

export default DocumentsPage;
