export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; created_at: string; updated_at: string; name: string; email: string; test_type: string | null; test_date: string | null; anxiety_level: number | null; goals: string | null; level_name: string | null; level_number: number | null; xp: number | null; streak_days: number | null; total_sessions: number | null; is_onboarded: boolean | null; password_hash: string | null }
        Insert: { id?: string; created_at?: string; updated_at?: string; name: string; email: string; test_type?: string | null; test_date?: string | null; anxiety_level?: number | null; goals?: string | null; level_name?: string | null; level_number?: number | null; xp?: number | null; streak_days?: number | null; total_sessions?: number | null; is_onboarded?: boolean | null; password_hash?: string | null }
        Update: { id?: string; created_at?: string; updated_at?: string; name?: string; email?: string; test_type?: string | null; test_date?: string | null; anxiety_level?: number | null; goals?: string | null; level_name?: string | null; level_number?: number | null; xp?: number | null; streak_days?: number | null; total_sessions?: number | null; is_onboarded?: boolean | null; password_hash?: string | null }
      }
      drive_sessions: {
        Row: { id: string; created_at: string; updated_at: string; user_id: string; duration_minutes: number; distance_km: number; speed_consistency: number | null; braking_score: number | null; smoothness_score: number | null; hazard_awareness: number | null; overall_score: number | null; highlights: string | null; improvements: string | null }
        Insert: { id?: string; created_at?: string; updated_at?: string; user_id: string; duration_minutes: number; distance_km: number; speed_consistency?: number | null; braking_score?: number | null; smoothness_score?: number | null; hazard_awareness?: number | null; overall_score?: number | null; highlights?: string | null; improvements?: string | null }
        Update: { id?: string; created_at?: string; updated_at?: string; user_id?: string; duration_minutes?: number; distance_km?: number; speed_consistency?: number | null; braking_score?: number | null; smoothness_score?: number | null; hazard_awareness?: number | null; overall_score?: number | null; highlights?: string | null; improvements?: string | null }
      }
      confidence_checkins: {
        Row: { id: string; created_at: string; updated_at: string; user_id: string; before_driving: number; after_driving: number | null; notes: string | null }
        Insert: { id?: string; created_at?: string; updated_at?: string; user_id: string; before_driving: number; after_driving?: number | null; notes?: string | null }
        Update: { id?: string; created_at?: string; updated_at?: string; user_id?: string; before_driving?: number; after_driving?: number | null; notes?: string | null }
      }
      anxiety_logs: {
        Row: { id: string; created_at: string; updated_at: string; user_id: string; level: number; trigger: string | null; notes: string | null }
        Insert: { id?: string; created_at?: string; updated_at?: string; user_id: string; level: number; trigger?: string | null; notes?: string | null }
        Update: { id?: string; created_at?: string; updated_at?: string; user_id?: string; level?: number; trigger?: string | null; notes?: string | null }
      }
    }
  }
}
