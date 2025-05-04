
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

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  attachments: string[];
  likes: string[];
  author: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

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
  
  // Fetch forum posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select('*, author:profiles(first_name, last_name, email)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
        
        // Fetch comments for each post
        if (data) {
          const commentsObj: Record<string, ForumComment[]> = {};
          
          for (const post of data) {
            const { data: commentsData, error: commentsError } = await supabase
              .from('forum_comments')
              .select('*, author:profiles(first_name, last_name, email)')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true });
              
            if (!commentsError) {
              commentsObj[post.id] = commentsData || [];
            }
          }
          
          setComments(commentsObj);
        }
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
      // Upload attachments if any
      const attachmentPaths: string[] = [];
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`File ${file.name} exceeds the 10MB limit`);
            continue;
          }
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `forum/${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('forum_attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            toast.error(`Failed to upload ${file.name}`);
          } else {
            attachmentPaths.push(filePath);
          }
        }
      }
      
      // Create post
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            title: newPostTitle,
            content: newPostContent,
            author_id: user.id,
            attachments: attachmentPaths,
            likes: []
          }
        ])
        .select('*, author:profiles(first_name, last_name, email)')
        .single();
      
      if (error) throw error;
      
      setPosts([data, ...posts]);
      setNewPostDialogOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setSelectedFiles([]);
      
      toast.success('Post created successfully');
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
      const { data, error } = await supabase
        .from('forum_comments')
        .insert([
          {
            post_id: postId,
            content: newCommentContent[postId],
            author_id: user.id
          }
        ])
        .select('*, author:profiles(first_name, last_name, email)')
        .single();
      
      if (error) throw error;
      
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), data]
      });
      
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
      const { error } = await supabase
        .from('forum_posts')
        .update({ likes: newLikes })
        .eq('id', postId);
      
      if (error) throw error;
      
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
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {getInitials(post.author?.first_name || '', post.author?.last_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {post.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Posted by {post.author?.first_name} {post.author?.last_name} • {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
                
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Attachments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.attachments.map((attachment, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Get public URL and open in new tab
                            const { data } = supabase.storage
                              .from('forum_attachments')
                              .getPublicUrl(attachment);
                            
                            window.open(data.publicUrl, '_blank');
                          }}
                        >
                          <Paperclip className="h-3 w-3 mr-1" />
                          {attachment.split('/').pop()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/50 p-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={post.likes.includes(user?.id || '') ? 'text-primary' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {(comments[post.id]?.length || 0)} Comments
                </div>
              </CardFooter>
              
              {/* Comments section */}
              <div className="border-t">
                <div className="p-3 max-h-60 overflow-y-auto">
                  {comments[post.id]?.map(comment => (
                    <div key={comment.id} className="mb-3">
                      <div className="flex items-start">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.author?.first_name || '', comment.author?.last_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-2 rounded-md flex-1">
                          <p className="text-xs font-medium">
                            {comment.author?.first_name} {comment.author?.last_name}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!comments[post.id] || comments[post.id].length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
                
                <div className="p-3 border-t bg-background">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Write a comment..."
                      value={newCommentContent[post.id] || ''}
                      onChange={(e) => setNewCommentContent({
                        ...newCommentContent,
                        [post.id]: e.target.value
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <Button 
                      size="icon"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newCommentContent[post.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
