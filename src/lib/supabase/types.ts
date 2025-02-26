export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bio_pages: {
        Row: {
          id: string
          username: string
          title: string
          description: string | null
          theme: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          username: string
          title: string
          description?: string | null
          theme?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          username?: string
          title?: string
          description?: string | null
          theme?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      links: {
        Row: {
          id: string
          short_code: string
          original_url: string
          title: string | null
          created_at: string
          updated_at: string
          user_id: string
          bio_page_id: string | null
          is_active: boolean
          expires_at: string | null
        }
        Insert: {
          id?: string
          short_code: string
          original_url: string
          title?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
          bio_page_id?: string | null
          is_active?: boolean
          expires_at?: string | null
        }
        Update: {
          id?: string
          short_code?: string
          original_url?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
          bio_page_id?: string | null
          is_active?: boolean
          expires_at?: string | null
        }
      }
      clicks: {
        Row: {
          id: string
          created_at: string
          link_id: string
          ip: string | null
          city: string | null
          country: string | null
          device: string | null
          browser: string | null
          os: string | null
          referer: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          link_id: string
          ip?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referer?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          link_id?: string
          ip?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referer?: string | null
          user_agent?: string | null
        }
      }
      daily_stats: {
        Row: {
          id: string
          date: string
          total_clicks: number
          unique_clicks: number
          new_links: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          total_clicks?: number
          unique_clicks?: number
          new_links?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_clicks?: number
          unique_clicks?: number
          new_links?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}