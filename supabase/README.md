# Supabase Configuration for ZarFuel Project Compass

This directory contains Supabase SQL scripts and configuration files needed to properly set up the Supabase backend for this application.

## 🚨 Current Issues and How to Fix Them

### 1. Foreign Key Relationship Errors

If you're seeing errors like:
```
"Could not find a relationship between 'event_participants' and 'user_id' in the schema cache"
```

This indicates issues with the database relationships. To fix these:

1. **Log in to the Supabase Dashboard** for your project
2. Go to **SQL Editor**
3. Create a **New Query**
4. Copy the contents of the `sql/fix_participants_relation.sql` file and paste them into the SQL editor
5. Run the query to fix the event participants relationships
6. Create another **New Query**
7. Copy the contents of the `sql/fix_meeting_minutes.sql` file and paste them into the SQL editor
8. Run the query to fix the meeting minutes relationships

### 2. Schema Error: "Could not find the 'participants' column of 'events'"

This error indicates a mismatch between the database schema and the application code. The application is trying to find a 'participants' column in the events table, but it doesn't exist because participants are stored in a separate `event_participants` table.

**To fix this issue:**

1. **Log in to the Supabase Dashboard** for your project
2. Go to **SQL Editor**
3. Create a **New Query**
4. Copy the contents of the `sql/events_table.sql` file and paste them into the SQL editor
5. Run the query to create/verify the tables

### 3. Row-Level Security (RLS) Policy Issue

If you're experiencing the following error when creating events:
```
new row violates row-level security policy for table "events"
```

You need to apply the Row-Level Security policies to the Supabase database.

**To fix this issue:**

1. **Log in to the Supabase Dashboard** for your project
2. Go to **SQL Editor**
3. Create a **New Query**
4. Copy the contents of the `sql/rls_policies.sql` file and paste them into the SQL editor
5. Run the query to apply the RLS policies

## Table Schema

### events

- `id` (UUID): Primary key
- `title` (text): Event title 
- `description` (text): Event description
- `start_time` (timestamp): Start time of the event
- `end_time` (timestamp): End time of the event
- `location` (text): Event location
- `is_meeting` (boolean): Whether this is a meeting
- `created_by` (UUID): User ID of the creator
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

### event_participants

- `id` (UUID): Primary key
- `event_id` (UUID): Foreign key to events
- `user_id` (UUID): Foreign key to auth.users
- `response` (text): Participant's response to the invitation
- `created_at` (timestamp): Creation timestamp

### meeting_minutes

- `id` (UUID): Primary key
- `event_id` (UUID): Foreign key to events
- `file_path` (text): Path to the uploaded file
- `file_name` (text): Name of the file
- `uploaded_by` (UUID): Foreign key to auth.users
- `created_at` (timestamp): Creation timestamp

## Important Notes

- Participants are stored in the `event_participants` table, not directly in the `events` table
- The application handles creating entries in both tables when you create a meeting with participants
- Users can only create events if they're authenticated and the `created_by` field matches their user ID
- Event participants can be added by the event creator
- All users can view events and participants

## SQL Files

- `sql/events_table.sql`: Creates/fixes the events and event_participants tables
- `sql/rls_policies.sql`: Sets up Row-Level Security policies for the tables
- `sql/functions.sql`: Contains SQL functions that can be used to bypass RLS policies when needed
- `sql/fix_participants_relation.sql`: Fixes foreign key relationships for event participants
- `sql/fix_meeting_minutes.sql`: Fixes foreign key relationships for meeting minutes 