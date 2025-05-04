
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Document } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search,
  File,
  FileText,
  FileImage,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Presentation,
  Plus,
  Folder
} from 'lucide-react';
import { toast } from 'sonner';
import DocumentFolders from '@/components/documents/DocumentFolders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploader:profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set((data || []).map(doc => doc.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter documents based on current filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'docx':
      case 'doc':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-8 w-8 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Handle download button click
  const handleDownloadClick = async (document: Document) => {
    try {
      // Get the public URL for the file
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);
        
      if (data) {
        // Update the downloaded_by array
        if (user) {
          const newDownloadedBy = document.downloaded_by 
            ? [...document.downloaded_by, user.id]
            : [user.id];
            
          await supabase
            .from('documents')
            .update({ downloaded_by: newDownloadedBy })
            .eq('id', document.id);
        }
        
        // Open the file in a new tab
        window.open(data.publicUrl, '_blank');
        toast.success(`Downloading ${document.file_name}`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !uploadCategory) {
      toast.error('Please select a file and category');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Get file extension
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Check if file type is allowed
      const allowedTypes = ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'csv', 'txt'];
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        toast.error('File type not allowed');
        setIsUploading(false);
        return;
      }
      
      // Create a unique file name
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `${user!.id}/${fileName}`;
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // Add document record to database
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          file_name: selectedFile.name,
          file_type: fileExt,
          file_size: selectedFile.size,
          file_path: filePath,
          category: uploadCategory,
          uploaded_by: user!.id
        }]);
        
      if (insertError) throw insertError;
      
      toast.success('File uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadCategory('');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground">
            Access and manage project documentation
          </p>
        </div>
        
        <Button 
          className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
          onClick={() => setUploadDialogOpen(true)}
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <Tabs defaultValue="folders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="folders" className="space-y-4">
          <DocumentFolders />
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Find Documents</CardTitle>
              <CardDescription>Search for documents by name or filter by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zarfuel-blue"></div>
              </div>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col items-center">
                      {getFileIcon(document.file_type)}
                      <h3 className="mt-4 font-medium text-center">{document.file_name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(document.created_at).toLocaleDateString()}
                      </p>
                      {document.uploader && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded by: {document.uploader.first_name} {document.uploader.last_name}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-4 flex justify-between items-center">
                      <span className="text-xs bg-muted-foreground/20 py-1 px-2 rounded-sm">
                        {document.category}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadClick(document)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No documents match your current search criteria
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the repository
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-140px)] p-1">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="document-file">File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="document-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="document-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-3 text-sm">
                    Selected file: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document-category">Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger id="document-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    <SelectItem value="Reports">Reports</SelectItem>
                    <SelectItem value="Presentations">Presentations</SelectItem>
                    <SelectItem value="Minutes">Minutes</SelectItem>
                    <SelectItem value="Contracts">Contracts</SelectItem>
                    <SelectItem value="Designs">Designs</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload}
              disabled={isUploading || !selectedFile || !uploadCategory}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
