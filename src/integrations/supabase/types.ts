export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      post_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_name: string
          content: string
          created_at: string
          flair: string | null
          id: string
          title: string
          upvotes: number
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          flair?: string | null
          id?: string
          title: string
          upvotes?: number
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          flair?: string | null
          id?: string
          title?: string
          upvotes?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_skills: {
        Row: {
          created_at: string
          id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          rating: number | null
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_comments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          author: string
          category: string | null
          compatible_with: string[]
          content_ko: string | null
          content_ko_updated_at: string | null
          created_at: string
          description_en: string | null
          description_ko: string | null
          downvotes: number
          featured: boolean
          forks: number
          github_url: string
          id: string
          is_reviewed: boolean
          name: string
          name_ko: string | null
          public_id: string | null
          saves: number
          source_id: string | null
          source_path: string
          source_repo: string
          stars: number | null
          summary_ko: Json | null
          updated_at: string
          upvotes: number
          view_count: number
        }
        Insert: {
          author: string
          category?: string | null
          compatible_with?: string[]
          content_ko?: string | null
          content_ko_updated_at?: string | null
          created_at?: string
          description_en?: string | null
          description_ko?: string | null
          downvotes?: number
          featured?: boolean
          forks?: number
          github_url: string
          id?: string
          is_reviewed?: boolean
          name: string
          name_ko?: string | null
          public_id?: string | null
          saves?: number
          source_id?: string | null
          source_path: string
          source_repo: string
          stars?: number | null
          summary_ko?: Json | null
          updated_at?: string
          upvotes?: number
          view_count?: number
        }
        Update: {
          author?: string
          category?: string | null
          compatible_with?: string[]
          content_ko?: string | null
          content_ko_updated_at?: string | null
          created_at?: string
          description_en?: string | null
          description_ko?: string | null
          downvotes?: number
          featured?: boolean
          forks?: number
          github_url?: string
          id?: string
          is_reviewed?: boolean
          name?: string
          name_ko?: string | null
          public_id?: string | null
          saves?: number
          source_id?: string | null
          source_path?: string
          source_repo?: string
          stars?: number | null
          summary_ko?: Json | null
          updated_at?: string
          upvotes?: number
          view_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_id: string
          vote_type?: number
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_vote_counts: {
        Args: never
        Returns: {
          down_count: number
          request_id: string
          up_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_upvote: { Args: { _post_id: string }; Returns: undefined }
      increment_skill_save: { Args: { _skill_id: string }; Returns: undefined }
      increment_skill_view: { Args: { _skill_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
