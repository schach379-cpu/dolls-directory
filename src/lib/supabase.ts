import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser client (for client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (same for now, can be extended with service role later)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
