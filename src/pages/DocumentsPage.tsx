
import React, { useState } from 'react';
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
import { documents, Document } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search,
  File,
  FileText,
  FileImage,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { toast } from 'sonner';
import DocumentFolders from '@/components/documents/DocumentFolders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const { user, isAdmin } = useAuth();
  
  // Get unique categories for filters
  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  
  // Filter documents based on current filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'docx':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'pptx':
        return <Presentation className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Handle download button click
  const handleDownloadClick = (document: Document) => {
    // In a real app, this would download the file
    toast.success(`Downloading ${document.name}`);
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
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col items-center">
                      {getFileIcon(document.fileType)}
                      <h3 className="mt-4 font-medium text-center">{document.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{document.fileSize} • {document.uploadDate}</p>
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
    </div>
  );
};

export default DocumentsPage;
