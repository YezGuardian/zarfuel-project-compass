
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Image, Send, ThumbsUp, MessageSquare, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ForumPost, ForumComment } from '@/types/forum';

const ForumPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch forum posts - mocked since the tables don't exist yet
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Simulating empty posts until forum tables are created
        setPosts([]);
        setComments({});
      } catch (error) {
        console.error('Error fetching forum posts:', error);
        toast.error('Failed to load forum posts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handleCreatePost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsLoading(true);
    try {
      // Mock success for now
      toast.success('Post created successfully');
      setNewPostDialogOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddComment = async (postId: string) => {
    if (!user || !newCommentContent[postId]?.trim()) return;
    
    setIsLoading(true);
    try {
      // Mock success for now
      setNewCommentContent({
        ...newCommentContent,
        [postId]: ''
      });
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const userLiked = post.likes.includes(user.id);
    const newLikes = userLiked 
      ? post.likes.filter(id => id !== user.id) 
      : [...post.likes, user.id];
    
    try {
      // Mock success for now
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    } catch (error) {
      console.error('Error updating likes:', error);
      toast.error('Failed to update like');
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Committee Forum</h1>
          <p className="text-muted-foreground">
            Engage with other committee members, share ideas, and discuss topics
          </p>
        </div>
        <Button 
          className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
          onClick={() => setNewPostDialogOpen(true)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>
      
      {isLoading && posts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading forum posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-muted-foreground mt-1">Be the first to start a discussion!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Forum posts would be rendered here */}
        </div>
      )}
      
      {/* New Post Dialog */}
      <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Start a new discussion topic or share information with the committee.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(80vh-180px)]">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <label htmlFor="post-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="post-title"
                  placeholder="Enter post title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="post-content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="post-content"
                  placeholder="Write your post content here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={8}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Attachments (Max 10MB per file)
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <Input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles([...selectedFiles, ...files]);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Files
                      </label>
                    </Button>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <ul className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="text-sm flex items-center justify-between">
                            <div className="truncate">{file.name}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            >
                              &times;
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={() => setNewPostDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              disabled={isLoading || !newPostTitle.trim() || !newPostContent.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
