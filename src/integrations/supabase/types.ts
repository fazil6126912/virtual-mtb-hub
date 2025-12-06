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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          is_group_message: boolean
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          is_group_message?: boolean
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_group_message?: boolean
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          id: string
          invited_by_id: string
          invited_by_name: string
          invited_user_email: string
          mtb_id: string
          mtb_name: string
          read: boolean
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by_id: string
          invited_by_name: string
          invited_user_email: string
          mtb_id: string
          mtb_name: string
          read?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by_id?: string
          invited_by_name?: string
          invited_user_email?: string
          mtb_id?: string
          mtb_name?: string
          read?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invitations_mtb"
            columns: ["mtb_id"]
            isOneToOne: false
            referencedRelation: "mtbs"
            referencedColumns: ["id"]
          },
        ]
      }
      mtb_cases: {
        Row: {
          added_at: string
          case_id: string
          id: string
          mtb_id: string
        }
        Insert: {
          added_at?: string
          case_id: string
          id?: string
          mtb_id: string
        }
        Update: {
          added_at?: string
          case_id?: string
          id?: string
          mtb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mtb_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtb_cases_mtb_id_fkey"
            columns: ["mtb_id"]
            isOneToOne: false
            referencedRelation: "mtbs"
            referencedColumns: ["id"]
          },
        ]
      }
      mtb_members: {
        Row: {
          id: string
          joined_at: string
          mtb_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          mtb_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          mtb_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mtb_members_mtb_id_fkey"
            columns: ["mtb_id"]
            isOneToOne: false
            referencedRelation: "mtbs"
            referencedColumns: ["id"]
          },
        ]
      }
      mtbs: {
        Row: {
          created_at: string
          display_picture: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          display_picture?: string | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          display_picture?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number | null
          cancer_type: string | null
          created_at: string
          id: string
          name: string
          sex: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          cancer_type?: string | null
          created_at?: string
          id?: string
          name: string
          sex?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          cancer_type?: string | null
          created_at?: string
          id?: string
          name?: string
          sex?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          case_id: string
          created_at: string
          extracted_data: Json | null
          file_category: string | null
          id: string
          name: string
          size: number | null
          storage_path: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          extracted_data?: Json | null
          file_category?: string | null
          id?: string
          name: string
          size?: number | null
          storage_path?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          extracted_data?: Json | null
          file_category?: string | null
          id?: string
          name?: string
          size?: number | null
          storage_path?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_mtb_member: {
        Args: { _mtb_id: string; _user_id: string }
        Returns: boolean
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
