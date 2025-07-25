export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          actual: number | null
          estimated: number | null
          id: string
          name: string
        }
        Insert: {
          actual?: number | null
          estimated?: number | null
          id?: string
          name: string
        }
        Update: {
          actual?: number | null
          estimated?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          company_visibility: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string | null
          title: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          company?: string | null
          company_visibility?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          company?: string | null
          company_visibility?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      deletion_logs: {
        Row: {
          deleted_at: string | null
          deleted_by: string
          deleted_by_name: string | null
          details: Json | null
          id: string
          record_id: string
          table_name: string
        }
        Insert: {
          deleted_at?: string | null
          deleted_by: string
          deleted_by_name?: string | null
          details?: Json | null
          id?: string
          record_id: string
          table_name: string
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string
          deleted_by_name?: string | null
          details?: Json | null
          id?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      document_repositories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          downloaded_by: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          downloaded_by?: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_id?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          downloaded_by?: Json | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          is_meeting: boolean | null
          location: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_meeting?: boolean | null
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_meeting?: boolean | null
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          likes: Json | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          likes?: Json | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          likes?: Json | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          source_id: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          source_id: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          source_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          attachments: string[] | null
          author_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          likes: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          likes?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          likes?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          organization: string | null
          position: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          organization?: string | null
          position?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          organization?: string | null
          position?: string | null
          role?: string
        }
        Relationships: []
      }
      meeting_minutes: {
        Row: {
          content: string | null
          created_at: string
          event_id: string | null
          file_name: string | null
          file_path: string | null
          id: string
          source_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          event_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          source_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          event_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          source_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          read: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      phases: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          position: number
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          invited_by: string | null
          last_name: string | null
          organization: string | null
          phone: string | null
          position: string | null
          role: string
          title: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          invited_by?: string | null
          last_name?: string | null
          organization?: string | null
          phone?: string | null
          position?: string | null
          role?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          invited_by?: string | null
          last_name?: string | null
          organization?: string | null
          phone?: string | null
          position?: string | null
          role?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          category: string | null
          description: string | null
          id: string
          impact: string | null
          likelihood: string | null
          mitigation_strategy: string | null
          name: string
          responsible_person: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          likelihood?: string | null
          mitigation_strategy?: string | null
          name: string
          responsible_person?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          likelihood?: string | null
          mitigation_strategy?: string | null
          name?: string
          responsible_person?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          end_date: string | null
          id: string
          phase_id: string | null
          progress_summary: string | null
          responsible_teams: string[] | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          phase_id?: string | null
          progress_summary?: string | null
          responsible_teams?: string[] | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          phase_id?: string | null
          progress_summary?: string | null
          responsible_teams?: string[] | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_forum_comment: {
        Args: {
          p_post_id: string
          p_content: string
          p_author_id: string
          p_parent_comment_id?: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_content: string
          p_link: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refresh_schema_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_comment_likes: {
        Args: { comment_id: string; likes_json: string }
        Returns: undefined
      }
      update_post_likes: {
        Args: { post_id: string; likes_json: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
