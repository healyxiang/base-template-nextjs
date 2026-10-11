import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig } from "./config"
export function browserClient() {
  const config = supabaseConfig()
  return config ? createBrowserClient(config.url, config.key) : null
}
