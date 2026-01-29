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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          sitter_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          sitter_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          sitter_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          owner_id: string
          sitter_id: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          owner_id: string
          sitter_id: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          owner_id?: string
          sitter_id?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          owner_id: string
          rating: number
          sitter_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          owner_id: string
          rating: number
          sitter_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          rating?: number
          sitter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_profiles: {
        Row: {
          accepted_pet_sizes: string[] | null
          accepted_pet_types: string[] | null
          address: string | null
          approximate_latitude: number | null
          approximate_longitude: number | null
          availability_overrides: Json | null
          bio: string | null
          created_at: string
          email: string
          experience: string | null
          first_name: string
          hourly_rate: number | null
          id: string
          last_name: string
          phone: string | null
          photos: string[] | null
          services: string[] | null
          status: Database["public"]["Enums"]["sitter_status"]
          town: string
          updated_at: string
          user_id: string
          weekly_schedule: Json | null
        }
        Insert: {
          accepted_pet_sizes?: string[] | null
          accepted_pet_types?: string[] | null
          address?: string | null
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          availability_overrides?: Json | null
          bio?: string | null
          created_at?: string
          email: string
          experience?: string | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          last_name: string
          phone?: string | null
          photos?: string[] | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["sitter_status"]
          town: string
          updated_at?: string
          user_id: string
          weekly_schedule?: Json | null
        }
        Update: {
          accepted_pet_sizes?: string[] | null
          accepted_pet_types?: string[] | null
          address?: string | null
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          availability_overrides?: Json | null
          bio?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          last_name?: string
          phone?: string | null
          photos?: string[] | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["sitter_status"]
          town?: string
          updated_at?: string
          user_id?: string
          weekly_schedule?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      sitter_profiles_public: {
        Row: {
          accepted_pet_sizes: string[] | null
          accepted_pet_types: string[] | null
          approximate_latitude: number | null
          approximate_longitude: number | null
          availability_overrides: Json | null
          bio: string | null
          created_at: string | null
          experience: string | null
          first_name: string | null
          hourly_rate: number | null
          id: string | null
          last_name: string | null
          photos: string[] | null
          services: string[] | null
          status: Database["public"]["Enums"]["sitter_status"] | null
          town: string | null
          updated_at: string | null
          user_id: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          accepted_pet_sizes?: string[] | null
          accepted_pet_types?: string[] | null
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          availability_overrides?: Json | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          last_name?: string | null
          photos?: string[] | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["sitter_status"] | null
          town?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          accepted_pet_sizes?: string[] | null
          accepted_pet_types?: string[] | null
          approximate_latitude?: number | null
          approximate_longitude?: number | null
          availability_overrides?: Json | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          last_name?: string | null
          photos?: string[] | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["sitter_status"] | null
          town?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_message_partner_info: {
        Args: { partner_ids: string[] }
        Returns: {
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      get_single_partner_info: {
        Args: { partner_id: string }
        Returns: {
          first_name: string
          last_name: string
        }[]
      }
      get_sitter_average_rating: {
        Args: { sitter_uuid: string }
        Returns: number
      }
      get_sitter_contact_info: {
        Args: { sitter_profile_id: string }
        Returns: {
          address: string
          email: string
          phone: string
        }[]
      }
      get_sitter_review_count: {
        Args: { sitter_uuid: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "sitter"
      sitter_status: "pending_approval" | "active" | "rejected" | "suspended"
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
      app_role: ["admin", "user", "sitter"],
      sitter_status: ["pending_approval", "active", "rejected", "suspended"],
    },
  },
} as const
