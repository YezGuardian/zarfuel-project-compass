
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderIcon, FileIcon, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FolderContentsDialog from './FolderContentsDialog';
import CreateFolderDialog from './CreateFolderDialog';
import { useAuth } from '@/contexts/AuthContext';

interface Folder {
  id: string;
  name: string;
  icon: string;
}

const DocumentFolders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderContentOpen, setFolderContentOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchFolders();

    // Set up real-time updates for folders
    const foldersChannel = supabase
      .channel('folders-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'folders'
        }, 
        () => {
          fetchFolders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foldersChannel);
    };
  }, []);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('name');

      if (error) throw error;
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setFolderContentOpen(true);
  };

  const getFolderIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'file-text':
        return <FileText className="h-12 w-12 text-blue-500" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
      case 'file-image':
        return <FileImage className="h-12 w-12 text-purple-500" />;
      case 'file':
        return <File className="h-12 w-12 text-orange-500" />;
      default:
        return <FolderIcon className="h-12 w-12 text-yellow-500" />;
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          icon: 'folder',
        })
        .select()
        .single();

      if (error) throw error;
      
      setFolders([...folders, data as Folder]);
      toast.success('Folder created successfully');
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Document Folders</h2>
        {isAdmin() && (
          <Button 
            onClick={() => setCreateFolderOpen(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Folder
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="w-full h-40 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                {getFolderIcon(folder.icon)}
                <h3 className="mt-4 font-medium text-center">{folder.name}</h3>
              </CardContent>
            </Card>
          ))}
          {isAdmin() && (
            <Card 
              className="cursor-pointer border-dashed hover:bg-accent/50 transition-colors"
              onClick={() => setCreateFolderOpen(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                <Plus className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium text-center">Create Folder</h3>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={folderContentOpen} onOpenChange={setFolderContentOpen}>
        {selectedFolder && (
          <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
            <FolderContentsDialog 
              folder={selectedFolder}
              onClose={() => {
                setFolderContentOpen(false);
                setSelectedFolder(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <CreateFolderDialog 
              onSubmit={async (name) => {
                const success = await handleCreateFolder(name);
                if (success) setCreateFolderOpen(false);
                return success;
              }}
              onCancel={() => setCreateFolderOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentFolders;
