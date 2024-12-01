export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          user_id: string
          prompt: string
          storage_path: string
          parameters: Json | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          storage_path: string
          parameters?: Json | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          storage_path?: string
          parameters?: Json | null
          created_at?: string
          metadata?: Json | null
        }
      }
    }
  }
} 