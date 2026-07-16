import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabaseAccessToken = import.meta.env.VITE_SUPABASE_ACCESS_TOKEN?.trim()
const tenantSchema = import.meta.env.VITE_SCHEMA_NAME?.trim()

export const missingSupabaseEnvVars = [
  ['VITE_SUPABASE_URL', supabaseUrl],
  ['VITE_SUPABASE_ANON_KEY', supabaseAnonKey],
  ['VITE_SUPABASE_ACCESS_TOKEN', supabaseAccessToken],
  ['VITE_SCHEMA_NAME', tenantSchema],
].filter(([, value]) => !value).map(([name]) => name)

export const isSupabaseConfigured = missingSupabaseEnvVars.length === 0
export const supabaseSchema = tenantSchema ?? 'public'

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      db: { schema: supabaseSchema },
      global: {
        headers: {
          Authorization: ['Bearer', supabaseAccessToken!].join(' '),
        },
      },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    `Supabase environment variables are missing (${missingSupabaseEnvVars.join(', ')}). Running ClearLane in local demo mode.`,
  )
}
