# Forum System Documentation

This document describes the forum functionality for the ZARFUEL Project Compass application.

## Database Schema

### Tables

#### forum_posts
- `id` (UUID, primary key): Unique identifier for each post
- `title` (TEXT): Post title
- `content` (TEXT): Post content
- `author_id` (UUID): Foreign key to auth.users
- `created_at` (TIMESTAMPTZ): Post creation time
- `updated_at` (TIMESTAMPTZ): Post last update time
- `is_edited` (BOOLEAN): Flag indicating if post has been edited
- `likes` (JSONB): Array of user likes/dislikes

#### forum_comments
- `id` (UUID, primary key): Unique identifier for each comment
- `post_id` (UUID): Foreign key to forum_posts
- `content` (TEXT): Comment content
- `author_id` (UUID): Foreign key to auth.users
- `created_at` (TIMESTAMPTZ): Comment creation time
- `updated_at` (TIMESTAMPTZ): Comment last update time
- `is_edited` (BOOLEAN): Flag indicating if comment has been edited
- `likes` (JSONB): Array of user likes/dislikes
- `parent_comment_id` (UUID, nullable): Foreign key to forum_comments for replies

#### forum_notifications
- `id` (UUID, primary key): Unique identifier for each notification
- `user_id` (UUID): Foreign key to auth.users
- `type` (TEXT): Notification type (post_created, comment_created, etc.)
- `content` (TEXT): Notification content/message
- `source_id` (UUID): ID of the post, comment, etc. that triggered the notification
- `is_read` (BOOLEAN): Flag indicating if notification has been read
- `created_at` (TIMESTAMPTZ): Notification creation time

## Notification Types

The following notification types are supported:

- `post_created`: When a new post is created
- `post_edited`: When a post is edited
- `post_deleted`: When a post is deleted
- `comment_created`: When a comment is created on a post
- `comment_reply`: When a comment is made in reply to another comment
- `post_liked`: When a post is liked or disliked
- `comment_liked`: When a comment is liked or disliked

## Features

The forum system supports the following features:

1. Create, read, update, and delete posts
2. Comment on posts
3. Reply to comments (nested comments)
4. Like/dislike posts and comments
5. Automatic notifications to all users for new posts
6. Automatic notifications to post authors for comments
7. Automatic notifications to comment authors for replies
8. Automatic notifications for likes/dislikes

## Row Level Security (RLS)

Row Level Security policies are applied to ensure users can only:

- View all posts and comments
- Create posts and comments
- Edit and delete only their own posts and comments
- See only their own notifications
- Update only their own notifications (e.g., mark as read)

## Database Indexes

Indexes are created on:
- `post_id` in forum_comments table
- `user_id` in forum_notifications table

This helps ensure efficient queries for fetching comments for a post and notifications for a user. 