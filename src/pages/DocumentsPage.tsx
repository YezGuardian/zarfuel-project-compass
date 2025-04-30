
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
  FilePresentation
} from 'lucide-react';
import { toast } from 'sonner';

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
        return <FilePresentation className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    if (!isAdmin()) {
      toast.error("Only admin users can upload documents");
      return;
    }
    
    // In a real app, this would open a file picker
    setIsUploading(true);
    
    setTimeout(() => {
      toast.success("Document uploaded successfully");
      setIsUploading(false);
    }, 2000);
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
        
        <Button 
          onClick={handleUploadClick} 
          disabled={isUploading || !isAdmin()} 
          className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </div>
      
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
    </div>
  );
};

export default DocumentsPage;
