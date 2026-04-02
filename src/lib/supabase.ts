import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Note: The Database generic is not used here because @supabase/supabase-js v2.101+
// requires CLI-generated types for the new PostgrestVersion:12 schema. Table-level
// type safety is provided via explicit casts in queries (see hooks.ts).
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SupabaseClient = typeof supabase
