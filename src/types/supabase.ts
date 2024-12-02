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
      images: {
        Row: {
          id: string
          user_id: string
          prompt: string
          storage_path: string
          created_at: string
          is_favorite: boolean
          parameters: Json
        }
        Insert: {
          user_id: string
          prompt: string
          storage_path: string
          is_favorite?: boolean
          parameters?: Json
          created_at?: string
        }
        Update: {
          is_favorite?: boolean
          parameters?: Json
        }
      }
    }
  }
} 