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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      august_query_submissions: {
        Row: {
          about_brand: string
          brand_category: string
          brand_name: string
          budget: string
          city: string
          created_at: string
          email: string
          event_source_url: string | null
          fb_event_id: string | null
          fb_lead_sent_at: string | null
          fb_reported_status: string | null
          fbc: string | null
          fbp: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          status: string
        }
        Insert: {
          about_brand: string
          brand_category: string
          brand_name: string
          budget: string
          city: string
          created_at?: string
          email: string
          event_source_url?: string | null
          fb_event_id?: string | null
          fb_lead_sent_at?: string | null
          fb_reported_status?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string
        }
        Update: {
          about_brand?: string
          brand_category?: string
          brand_name?: string
          budget?: string
          city?: string
          created_at?: string
          email?: string
          event_source_url?: string | null
          fb_event_id?: string | null
          fb_lead_sent_at?: string | null
          fb_reported_status?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_initial: string
          author_name: string
          body: Json
          category: string
          content_updated_at: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          is_placeholder: boolean
          is_published: boolean
          published_at: string | null
          read_time_label: string | null
          slug: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_initial?: string
          author_name?: string
          body?: Json
          category?: string
          content_updated_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_placeholder?: boolean
          is_published?: boolean
          published_at?: string | null
          read_time_label?: string | null
          slug: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_initial?: string
          author_name?: string
          body?: Json
          category?: string
          content_updated_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_placeholder?: boolean
          is_published?: boolean
          published_at?: string | null
          read_time_label?: string | null
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      brands: {
        Row: {
          avatar_url: string | null
          bio: string
          collection: string | null
          created_at: string
          handle: string
          id: string
          industry_key: string
          is_placeholder: boolean
          is_published: boolean
          links: Json
          name: string
          post_permalinks: string[]
          published_at: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          collection?: string | null
          created_at?: string
          handle: string
          id?: string
          industry_key: string
          is_placeholder?: boolean
          is_published?: boolean
          links?: Json
          name?: string
          post_permalinks?: string[]
          published_at?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          collection?: string | null
          created_at?: string
          handle?: string
          id?: string
          industry_key?: string
          is_placeholder?: boolean
          is_published?: boolean
          links?: Json
          name?: string
          post_permalinks?: string[]
          published_at?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          event_source_url: string | null
          fb_event_id: string | null
          fb_lead_sent_at: string | null
          fb_reported_status: string | null
          fbc: string | null
          fbp: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          event_source_url?: string | null
          fb_event_id?: string | null
          fb_lead_sent_at?: string | null
          fb_reported_status?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_source_url?: string | null
          fb_event_id?: string | null
          fb_lead_sent_at?: string | null
          fb_reported_status?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
        }
        Relationships: []
      }
      desktop_dock_apps: {
        Row: {
          href: string | null
          icon_url: string
          id: string
          is_live: boolean
          kind: Database["public"]["Enums"]["window_kind"] | null
          label: string
          notification_count: number | null
          order_index: number
          window_id: string | null
        }
        Insert: {
          href?: string | null
          icon_url: string
          id?: string
          is_live?: boolean
          kind?: Database["public"]["Enums"]["window_kind"] | null
          label: string
          notification_count?: number | null
          order_index?: number
          window_id?: string | null
        }
        Update: {
          href?: string | null
          icon_url?: string
          id?: string
          is_live?: boolean
          kind?: Database["public"]["Enums"]["window_kind"] | null
          label?: string
          notification_count?: number | null
          order_index?: number
          window_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "desktop_dock_apps_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "desktop_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      desktop_windows: {
        Row: {
          content: Json
          created_at: string
          default_open: boolean
          id: string
          is_ambient_muted: boolean
          is_live: boolean
          is_stream_master: boolean
          kind: Database["public"]["Enums"]["window_kind"]
          media_url: string | null
          order_index: number
          title: string
          updated_at: string
          video_height: number | null
          video_url: string | null
          video_width: number | null
        }
        Insert: {
          content?: Json
          created_at?: string
          default_open?: boolean
          id?: string
          is_ambient_muted?: boolean
          is_live?: boolean
          is_stream_master?: boolean
          kind: Database["public"]["Enums"]["window_kind"]
          media_url?: string | null
          order_index?: number
          title: string
          updated_at?: string
          video_height?: number | null
          video_url?: string | null
          video_width?: number | null
        }
        Update: {
          content?: Json
          created_at?: string
          default_open?: boolean
          id?: string
          is_ambient_muted?: boolean
          is_live?: boolean
          is_stream_master?: boolean
          kind?: Database["public"]["Enums"]["window_kind"]
          media_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
          video_height?: number | null
          video_url?: string | null
          video_width?: number | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          brand_name: string | null
          created_at: string
          designation: string | null
          email: string
          event_id: string
          id: string
          name: string
          phone: string
          reason: string | null
          status: Database["public"]["Enums"]["registration_status"]
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          designation?: string | null
          email: string
          event_id: string
          id?: string
          name: string
          phone: string
          reason?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          designation?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string
          phone?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          cover_image_url: string | null
          created_at: string
          description: string
          duration_label: string | null
          event_date: string | null
          host_name: string
          host_role: string
          id: string
          is_placeholder: boolean
          is_published: boolean
          learn_items: string[]
          location: string | null
          price_inr: number
          published_at: string | null
          registered_count: number
          slug: string
          time_label: string | null
          title: string
          updated_at: string
          waiting_count: number
        }
        Insert: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          event_date?: string | null
          host_name?: string
          host_role?: string
          id?: string
          is_placeholder?: boolean
          is_published?: boolean
          learn_items?: string[]
          location?: string | null
          price_inr?: number
          published_at?: string | null
          registered_count?: number
          slug: string
          time_label?: string | null
          title: string
          updated_at?: string
          waiting_count?: number
        }
        Update: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          event_date?: string | null
          host_name?: string
          host_role?: string
          id?: string
          is_placeholder?: boolean
          is_published?: boolean
          learn_items?: string[]
          location?: string | null
          price_inr?: number
          published_at?: string | null
          registered_count?: number
          slug?: string
          time_label?: string | null
          title?: string
          updated_at?: string
          waiting_count?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      stream_comments: {
        Row: {
          created_at: string
          id: string
          message: string
          name: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          name: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          name?: string
          visitor_id?: string
        }
        Relationships: []
      }
      whatsapp_leads: {
        Row: {
          contact_submission_id: string | null
          created_at: string
          fb_reported_status: string | null
          id: string
          interested: boolean | null
          phone: string
          preferred_time: string | null
          updated_at: string
          wa_id: string | null
          wa_name: string | null
        }
        Insert: {
          contact_submission_id?: string | null
          created_at?: string
          fb_reported_status?: string | null
          id?: string
          interested?: boolean | null
          phone: string
          preferred_time?: string | null
          updated_at?: string
          wa_id?: string | null
          wa_name?: string | null
        }
        Update: {
          contact_submission_id?: string | null
          created_at?: string
          fb_reported_status?: string | null
          id?: string
          interested?: boolean | null
          phone?: string
          preferred_time?: string | null
          updated_at?: string
          wa_id?: string | null
          wa_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_leads_contact_submission_id_fkey"
            columns: ["contact_submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_registration_counts: {
        Args: { p_event_id: string }
        Returns: {
          registered_count: number
          waiting_count: number
        }[]
      }
      increment_post_view: { Args: { p_slug: string }; Returns: number }
      register_for_event: {
        Args: {
          p_brand_name?: string
          p_designation?: string
          p_email: string
          p_event_id: string
          p_name: string
          p_phone: string
          p_reason?: string
        }
        Returns: Database["public"]["Enums"]["registration_status"]
      }
    }
    Enums: {
      registration_status: "registered" | "waiting" | "cancelled"
      window_kind:
        | "video"
        | "article"
        | "photo"
        | "email"
        | "document"
        | "newsfeed"
        | "chat"
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
      registration_status: ["registered", "waiting", "cancelled"],
      window_kind: [
        "video",
        "article",
        "photo",
        "email",
        "document",
        "newsfeed",
        "chat",
      ],
    },
  },
} as const
