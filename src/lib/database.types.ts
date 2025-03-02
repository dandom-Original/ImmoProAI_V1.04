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
      clients: {
        Row: {
          id: string
          name: string
          company: string
          email: string
          phone: string | null
          address: string | null
          notes: string | null
          status: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          email: string
          phone?: string | null
          address?: string | null
          notes?: string | null
          status?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          email?: string
          phone?: string | null
          address?: string | null
          notes?: string | null
          status?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      client_relationships: {
        Row: {
          id: string
          client_id: string
          relationship_stage: string
          relationship_score: number
          last_contact_date: string | null
          last_contact_type: string | null
          next_follow_up: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          relationship_stage?: string
          relationship_score?: number
          last_contact_date?: string | null
          last_contact_type?: string | null
          next_follow_up?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          relationship_stage?: string
          relationship_score?: number
          last_contact_date?: string | null
          last_contact_type?: string | null
          next_follow_up?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_events: {
        Row: {
          id: string
          client_id: string
          event_type: string
          event_date: string
          notes: string | null
          outcome: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          event_type: string
          event_date: string
          notes?: string | null
          outcome?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          event_type?: string
          event_date?: string
          notes?: string | null
          outcome?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_tasks: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          task_type: string
          priority: string
          status: string
          due_date: string
          completed_at: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          task_type?: string
          priority?: string
          status?: string
          due_date: string
          completed_at?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          task_type?: string
          priority?: string
          status?: string
          due_date?: string
          completed_at?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string
          city: string
          postal_code: string
          country: string
          property_type: string
          status: string
          price: number | null
          size: number | null
          bedrooms: number | null
          bathrooms: number | null
          features: string[] | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          address: string
          city: string
          postal_code: string
          country: string
          property_type: string
          status?: string
          price?: number | null
          size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          features?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          address?: string
          city?: string
          postal_code?: string
          country?: string
          property_type?: string
          status?: string
          price?: number | null
          size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          features?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_profiles: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          property_types: string[]
          min_price: number | null
          max_price: number | null
          min_size: number | null
          max_size: number | null
          min_bedrooms: number | null
          max_bedrooms: number | null
          min_bathrooms: number | null
          max_bathrooms: number | null
          locations: string[]
          required_features: string[] | null
          desired_features: string[] | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          property_types: string[]
          min_price?: number | null
          max_price?: number | null
          min_size?: number | null
          max_size?: number | null
          min_bedrooms?: number | null
          max_bedrooms?: number | null
          min_bathrooms?: number | null
          max_bathrooms?: number | null
          locations: string[]
          required_features?: string[] | null
          desired_features?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          property_types?: string[]
          min_price?: number | null
          max_price?: number | null
          min_size?: number | null
          max_size?: number | null
          min_bedrooms?: number | null
          max_bedrooms?: number | null
          min_bathrooms?: number | null
          max_bathrooms?: number | null
          locations?: string[]
          required_features?: string[] | null
          desired_features?: string[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          client_id: string
          property_id: string
          purchase_profile_id: string
          match_score: number
          match_reasons: string[] | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          purchase_profile_id: string
          match_score?: number
          match_reasons?: string[] | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          purchase_profile_id?: string
          match_score?: number
          match_reasons?: string[] | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          description: string | null
          file_path: string
          file_type: string
          file_size: number
          entity_type: string
          entity_id: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          file_path: string
          file_type: string
          file_size: number
          entity_type: string
          entity_id: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          file_path?: string
          file_type?: string
          file_size?: number
          entity_type?: string
          entity_id?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          entity_type: string | null
          entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          entity_type?: string | null
          entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          entity_type?: string | null
          entity_id?: string | null
          is_read?: boolean
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
