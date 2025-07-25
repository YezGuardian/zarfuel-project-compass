import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Repository {
  id: string;
  name: string;
  url: string;
}

const NewDocumentsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  
  useEffect(() => {
    fetchRepositories();
  }, []);
  
  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_repositories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setRepositories(data || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast.error('Failed to load document repositories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addRepository = async () => {
    if (!newRepoName.trim() || !newRepoUrl.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add http:// if missing
      let url = newRepoUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const { data, error } = await supabase
        .from('document_repositories')
        .insert({
          name: newRepoName.trim(),
          url,
          created_by: user?.id
        })
        .select();
        
      if (error) throw error;
      
      setRepositories([...repositories, data[0]]);
      setDialogOpen(false);
      setNewRepoName('');
      setNewRepoUrl('');
      toast.success('Repository added successfully');
    } catch (error) {
      console.error('Error adding repository:', error);
      toast.error('Failed to add repository');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Document Repository</h1>
          <p className="text-muted-foreground">Access important documents and resources</p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Repository
          </Button>
        )}
      </div>
      
      {isLoading && repositories.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading repositories...</span>
        </div>
      ) : repositories.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-lg font-medium">No document repositories found</p>
            <p className="text-muted-foreground mt-1">
              {isAdmin 
                ? 'Click the "Add Repository" button to add a new document location.' 
                : 'Check back later for document repositories.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-semibold">{repo.name}</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between mt-2"
                    onClick={() => handleOpenLink(repo.url)}
                  >
                    <span>Open Repository</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Document Repository</DialogTitle>
            <DialogDescription>
              Add a link to an external document storage location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Repository Name</Label>
              <Input
                id="name"
                placeholder="e.g., Company Policies"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Repository URL</Label>
              <Input
                id="url"
                placeholder="e.g., https://example.com/documents"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addRepository}
              disabled={!newRepoName.trim() || !newRepoUrl.trim() || isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Repository'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDocumentsPage; 