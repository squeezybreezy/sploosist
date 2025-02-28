
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
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          description: string | null
          type: string
          thumbnail_url: string | null
          video_thumbnail_timestamp: number | null
          date_added: string
          last_visited: string | null
          last_checked: string | null
          is_alive: boolean | null
          content_changed: boolean | null
          favicon: string | null
          category_id: string | null
          splat_count: number | null
        }
        Insert: {
          id: string
          user_id: string
          url: string
          title: string
          description?: string | null
          type: string
          thumbnail_url?: string | null
          video_thumbnail_timestamp?: number | null
          date_added?: string
          last_visited?: string | null
          last_checked?: string | null
          is_alive?: boolean | null
          content_changed?: boolean | null
          favicon?: string | null
          category_id?: string | null
          splat_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          description?: string | null
          type?: string
          thumbnail_url?: string | null
          video_thumbnail_timestamp?: number | null
          date_added?: string
          last_visited?: string | null
          last_checked?: string | null
          is_alive?: boolean | null
          content_changed?: boolean | null
          favicon?: string | null
          category_id?: string | null
          splat_count?: number | null
        }
      }
      bookmark_tags: {
        Row: {
          bookmark_id: string
          tag_id: string
        }
        Insert: {
          bookmark_id: string
          tag_id: string
        }
        Update: {
          bookmark_id?: string
          tag_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          icon?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          color?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
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
