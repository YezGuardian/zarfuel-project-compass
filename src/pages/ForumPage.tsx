import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { refreshSupabaseSchema } from '@/integrations/supabase/client';
import { ForumPost, ForumComment } from '@/types/forum';

const ForumPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [schemaRefreshed, setSchemaRefreshed] = useState(false);
  
  // Refresh schema on load to ensure forum tables are recognized
  useEffect(() => {
    const initializeSchema = async () => {
      try {
        // Try to refresh the schema to make sure forum tables are recognized
        await refreshSupabaseSchema();
        setSchemaRefreshed(true);
      } catch (error) {
        console.error("Failed to refresh schema:", error);
        // Continue anyway - we'll retry on any API calls
      }
    };
    
    initializeSchema();
  }, []);
  
  // Fetch forum posts and users
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Ensure schema is refreshed
        if (!schemaRefreshed) {
          await refreshSupabaseSchema();
        }
        
        // Fetch users for @ mentions
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name', { ascending: true });
          
        if (usersError) throw usersError;
        setUsers(usersData || []);
        
        // Use any to bypass TypeScript errors while the schema is being updated
        const postsQuery = supabase
          .from('forum_posts' as any)
          .select(`
            *,
            author:author_id(
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
        
        const { data: postsData, error: postsError } = await postsQuery;
        
        if (postsError) throw postsError;
        setPosts(postsData || []);
        
        // Fetch comments for all posts
        if (postsData && postsData.length > 0) {
          const allComments: Record<string, ForumComment[]> = {};
          
          for (const post of postsData) {
            const commentsQuery = supabase
              .from('forum_comments' as any)
              .select(`
                *,
                author:author_id(
                  first_name,
                  last_name,
                  email
                )
              `)
              .eq('post_id', post.id)
              .order('created_at', { ascending: true });
              
            const { data: commentsData, error: commentsError } = await commentsQuery;
              
            if (commentsError) throw commentsError;
            allComments[post.id] = commentsData || [];
          }
          
          setComments(allComments);
        }
      } catch (error) {
        console.error('Error fetching forum data:', error);
        toast.error('Failed to load forum data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [schemaRefreshed]);
  
  // Create new forum post
  const handleCreatePost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsLoading(true);
    try {
      // Parse content for @mentions
      const mentionedUserIds = extractMentions(newPostContent, users);
      
      // Try to refresh schema if not already done
      if (!schemaRefreshed) {
        await refreshSupabaseSchema();
      }
      
      // Create the post
      const postResult = await (supabase
        .from('forum_posts' as any)
        .insert({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          author_id: user.id,
          mentioned_users: JSON.stringify(mentionedUserIds)
        })
        .select() as any);
      
      const { data, error } = postResult;
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Add new post to state
        const newPost: ForumPost = {
          ...data[0],
          author: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: user.email || ''
          },
          likes: [],
          attachments: []
        };
        
        setPosts([newPost, ...posts]);
        setComments({ ...comments, [newPost.id]: [] });
        
        // Create notifications for all users about the new post
        if (users.length > 0) {
          const notificationPromises = users.map(async (u) => {
            if (u.id !== user.id) {
              return (supabase
                .from('forum_notifications' as any)
                .insert({
                  user_id: u.id,
                  type: 'post_created',
                  content: `${profile?.first_name} ${profile?.last_name} created a new post: ${newPostTitle}`,
                  source_id: newPost.id
                }) as any);
            }
            return Promise.resolve();
          });
          
          await Promise.all(notificationPromises);
        }
        
        // Create mention notifications
        if (mentionedUserIds.length > 0) {
          const mentionNotificationPromises = mentionedUserIds.map(async (mentionedId) => {
            return (supabase
              .from('forum_notifications' as any)
              .insert({
                user_id: mentionedId,
                type: 'mention',
                content: `${profile?.first_name} ${profile?.last_name} mentioned you in a post: ${newPostTitle}`,
                source_id: newPost.id
              }) as any);
          });
          
          await Promise.all(mentionNotificationPromises);
        }
        
        toast.success('Post created successfully');
      }
      
      // Reset form
      setNewPostDialogOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing post
  const handleUpdatePost = async () => {
    if (!user || !editingPost || !newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsLoading(true);
    try {
      const mentionedUserIds = extractMentions(newPostContent, users);
      
      // Try to refresh schema if not already done
      if (!schemaRefreshed) {
        await refreshSupabaseSchema();
      }
      
      const { error } = await (supabase
        .from('forum_posts' as any)
        .update({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          mentioned_users: JSON.stringify(mentionedUserIds)
        })
        .eq('id', editingPost.id) as any);
        
      if (error) throw error;
      
      // Update post in state
      const updatedPosts = posts.map(p => 
        p.id === editingPost.id 
          ? { 
              ...p, 
              title: newPostTitle.trim(), 
              content: newPostContent.trim(),
              is_edited: true
            } 
          : p
      );
      
      setPosts(updatedPosts);
      
      // Create notifications for post edit
      if (users.length > 0) {
        const notificationPromises = users.map(async (u) => {
          if (u.id !== user.id) {
            return (supabase
              .from('forum_notifications' as any)
              .insert({
                user_id: u.id,
                type: 'post_edited',
                content: `${profile?.first_name} ${profile?.last_name} edited a post: ${newPostTitle}`,
                source_id: editingPost.id
              }) as any);
          }
          return Promise.resolve();
        });
        
        await Promise.all(notificationPromises);
      }
      
      // Create new mention notifications
      if (mentionedUserIds.length > 0) {
        const mentionNotificationPromises = mentionedUserIds.map(async (mentionedId) => {
          if (!editingPost.mentioned_users.includes(mentionedId)) {
            return (supabase
              .from('forum_notifications' as any)
              .insert({
                user_id: mentionedId,
                type: 'mention',
                content: `${profile?.first_name} ${profile?.last_name} mentioned you in an edited post: ${newPostTitle}`,
                source_id: editingPost.id
              }) as any);
          }
          return Promise.resolve();
        });
        
        await Promise.all(mentionNotificationPromises);
      }
      
      toast.success('Post updated successfully');
      setNewPostDialogOpen(false);
      setEditingPost(null);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error(`Failed to update post: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to refresh schema if not already done
      if (!schemaRefreshed) {
        await refreshSupabaseSchema();
      }
      
      const { error } = await (supabase
        .from('forum_posts' as any)
        .delete()
        .eq('id', postId) as any);
        
      if (error) throw error;
      
      // Remove post from state
      setPosts(posts.filter(p => p.id !== postId));
      
      // Create deletion notifications
      if (users.length > 0) {
        const post = posts.find(p => p.id === postId);
        const notificationPromises = users.map(async (u) => {
          if (u.id !== user.id) {
            return (supabase
              .from('forum_notifications' as any)
              .insert({
                user_id: u.id,
                type: 'post_deleted',
                content: `${profile?.first_name} ${profile?.last_name} deleted a post: ${post?.title}`,
                source_id: postId
              }) as any);
          }
          return Promise.resolve();
        });
        
        await Promise.all(notificationPromises);
      }
      
      toast.success('Post deleted successfully');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(`Failed to delete post: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Comment on a post
  const handleAddComment = async (postId: string) => {
    if (!user || !newCommentContent[postId]?.trim()) return;
    
    setIsLoading(true);
    try {
      // Try to refresh schema if not already done
      if (!schemaRefreshed) {
        await refreshSupabaseSchema();
      }
      
      const commentContent = newCommentContent[postId].trim();
      const mentionedUserIds = extractMentions(commentContent, users);
      
      const result = await (supabase
        .from('forum_comments' as any)
        .insert({
          post_id: postId,
          content: commentContent,
          author_id: user.id,
          mentioned_users: JSON.stringify(mentionedUserIds)
        })
        .select() as any);
        
      const { data, error } = result;
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Add new comment to state
        const newComment: ForumComment = {
          ...data[0],
          author: {
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: user.email || ''
          }
        };
        
        const postComments = comments[postId] || [];
        setComments({
          ...comments,
          [postId]: [...postComments, newComment]
        });
        
        // Reset the comment form for this post
        setNewCommentContent({
          ...newCommentContent,
          [postId]: ''
        });
        
        // Create notification for post author about the new comment
        const post = posts.find(p => p.id === postId);
        if (post && post.author_id !== user.id) {
          await (supabase
            .from('forum_notifications' as any)
            .insert({
              user_id: post.author_id,
              type: 'comment_created',
              content: `${profile?.first_name} ${profile?.last_name} commented on your post: ${post.title}`,
              source_id: postId
            }) as any);
        }
        
        // Create mention notifications
        if (mentionedUserIds.length > 0) {
          const mentionNotificationPromises = mentionedUserIds.map(async (mentionedId) => {
            if (mentionedId !== user.id) {
              return (supabase
                .from('forum_notifications' as any)
                .insert({
                  user_id: mentionedId,
                  type: 'mention',
                  content: `${profile?.first_name} ${profile?.last_name} mentioned you in a comment`,
                  source_id: newComment.id
                }) as any);
            }
            return Promise.resolve();
          });
          
          await Promise.all(mentionNotificationPromises);
        }
      
        toast.success('Comment added');
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(`Failed to add comment: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Like or dislike a post
  const handleLikePost = async (postId: string, isLike: boolean) => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      // Try to refresh schema if not already done
      if (!schemaRefreshed) {
        await refreshSupabaseSchema();
      }
      
      // Convert likes from string[] to actual like objects if needed
      const currentLikes = Array.isArray(post.likes) 
        ? post.likes 
        : (typeof post.likes === 'string' ? JSON.parse(post.likes) : []);
      
      // Check if user already liked/disliked
      const userLikeIndex = currentLikes.findIndex(like => like.userId === user.id);
      let newLikes;
      
      if (userLikeIndex >= 0) {
        // User already has a like/dislike, update or remove it
        const currentLike = currentLikes[userLikeIndex];
        if (currentLike.isLike === isLike) {
          // Remove like/dislike if clicking the same button
          newLikes = [...currentLikes.slice(0, userLikeIndex), ...currentLikes.slice(userLikeIndex + 1)];
        } else {
          // Change like to dislike or vice versa
          newLikes = [...currentLikes];
          newLikes[userLikeIndex] = { userId: user.id, isLike, userName: `${profile?.first_name} ${profile?.last_name}` };
        }
      } else {
        // Add new like/dislike
        newLikes = [...currentLikes, { userId: user.id, isLike, userName: `${profile?.first_name} ${profile?.last_name}` }];
      }
      
      // Update in database
      const { error } = await (supabase
        .from('forum_posts' as any)
        .update({ likes: JSON.stringify(newLikes) })
        .eq('id', postId) as any);
        
      if (error) throw error;
      
      // Update in state
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    } catch (error: any) {
      console.error('Error updating likes:', error);
      toast.error(`Failed to update like: ${error.message}`);
    }
  };
  
  // Parse content for @mentions
  const extractMentions = (content: string, users: any[]): string[] => {
    const mentionRegex = /@\[(.*?)\]/g;
    const matches = [...content.matchAll(mentionRegex)];
    
    const mentionedIds: string[] = [];
    matches.forEach(match => {
      const mentionedName = match[1];
      const nameParts = mentionedName.split(' ');
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        const user = users.find(u => 
          u.first_name.toLowerCase() === firstName.toLowerCase() && 
          u.last_name.toLowerCase() === lastName.toLowerCase()
        );
        
        if (user && !mentionedIds.includes(user.id)) {
          mentionedIds.push(user.id);
        }
      }
    });
    
    return mentionedIds;
  };
  
  // Start editing a post
  const handleEditPost = (post: ForumPost) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setNewPostDialogOpen(true);
  };
  
  // Format display names and dates
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const getLikesData = (likes: any): Array<{userId: string; isLike: boolean; userName: string}> => {
    if (!likes) return [];
    if (typeof likes === 'string') {
      try {
        return JSON.parse(likes) || [];
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(likes) ? likes : [];
  };
  
  const getLikesCount = (likes: any, isLike: boolean): number => {
    const likesData = getLikesData(likes);
    return likesData.filter(like => like && like.isLike === isLike).length;
  };
  
  const getLikeStatus = (likes: any, userId?: string): 'like' | 'dislike' | null => {
    if (!userId) return null;
    const likesData = getLikesData(likes);
    const userLike = likesData.find(like => like && like.userId === userId);
    if (!userLike) return null;
    return userLike.isLike ? 'like' : 'dislike';
  };
  
  const getLikeUsersList = (likes: any, isLike: boolean): string => {
    const likesData = getLikesData(likes);
    const filteredLikes = likesData.filter(like => like && like.isLike === isLike);
    if (filteredLikes.length === 0) return 'No one yet';
    
    const names = filteredLikes.map(like => like.userName || 'Anonymous').join('\n');
    return names;
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
          onClick={() => {
            setEditingPost(null);
            setNewPostTitle('');
            setNewPostContent('');
            setNewPostDialogOpen(true);
          }}
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
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(post.author?.first_name || '', post.author?.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {post.author?.first_name} {post.author?.last_name} · {formatDate(post.created_at)}
                        {post.is_edited && <span className="ml-2 italic text-xs">(edited)</span>}
                      </div>
                    </div>
                  </div>
                  
                  {user && post.author_id === user.id && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 pt-0">
                <div className="text-sm whitespace-pre-wrap">{post.content}</div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-3 pb-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={() => handleLikePost(post.id, true)}
                  >
                    <ThumbsUp className="h-4 w-4" 
                      fill={
                        getLikeStatus(post.likes, user?.id) === 'like' ? 'currentColor' : 'none'
                      }
                    />
                    <span title={getLikeUsersList(post.likes, true)}>
                      {getLikesCount(post.likes, true)}
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={() => handleLikePost(post.id, false)}
                  >
                    <ThumbsDown className="h-4 w-4"
                      fill={
                        getLikeStatus(post.likes, user?.id) === 'dislike' ? 'currentColor' : 'none'
                      }
                    />
                    <span title={getLikeUsersList(post.likes, false)}>
                      {getLikesCount(post.likes, false)}
                    </span>
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {(comments[post.id]?.length || 0)} comments
                </div>
              </CardFooter>
              
              {/* Comments section */}
              <div className="bg-muted/30 px-6 py-3 border-t">
                {comments[post.id]?.map(comment => (
                  <div key={comment.id} className="flex items-start gap-3 mb-4">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.author?.first_name || '', comment.author?.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-background rounded-lg p-3">
                        <div className="font-semibold text-sm">
                          {comment.author?.first_name} {comment.author?.last_name}
                        </div>
                        <div className="text-sm mt-1">{comment.content}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(comment.created_at)}
                        {comment.is_edited && <span className="ml-2 italic">(edited)</span>}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* New comment form */}
                {user && (
                  <div className="flex items-start gap-3 mt-4">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {getInitials(profile?.first_name || '', profile?.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-end gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        className="min-h-10 flex-1"
                        value={newCommentContent[post.id] || ''}
                        onChange={(e) => setNewCommentContent({
                          ...newCommentContent,
                          [post.id]: e.target.value
                        })}
                      />
                      <Button 
                        size="sm" 
                        className="h-8"
                        disabled={!newCommentContent[post.id]?.trim() || isLoading}
                        onClick={() => handleAddComment(post.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* New Post / Edit Post Dialog */}
      <Dialog open={newPostDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingPost(null);
          setNewPostTitle('');
          setNewPostContent('');
        }
        setNewPostDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {editingPost 
                ? 'Update your post content and title.' 
                : 'Start a new discussion topic or share information with the committee.'}
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
                <p className="text-xs text-muted-foreground">
                  Use @[First Last] to tag users (e.g., @[John Doe])
                </p>
                <Textarea
                  id="post-content"
                  placeholder="Write your post content here... Use @[First Last] to mention users"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={8}
                />
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setNewPostDialogOpen(false);
                setEditingPost(null);
                setNewPostTitle('');
                setNewPostContent('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingPost ? handleUpdatePost : handleCreatePost}
              disabled={isLoading || !newPostTitle.trim() || !newPostContent.trim()}
            >
              {isLoading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
