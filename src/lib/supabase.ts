import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabaseAccessToken = import.meta.env.VITE_SUPABASE_ACCESS_TOKEN as string
const tenantSchema = import.meta.env.VITE_SCHEMA_NAME as string

if (!supabaseUrl || !supabaseAnonKey || !supabaseAccessToken || !tenantSchema) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: tenantSchema },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
    },
  },
})

export const supabaseSchema = tenantSchema
