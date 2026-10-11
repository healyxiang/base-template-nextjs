import "server-only"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { supabaseConfig } from "./config"
export async function serverClient() {
  const config = supabaseConfig()
  if (!config) return null
  const store = await cookies()
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /* Proxy refreshes cookies in server components. */
        }
      },
    },
  })
}
export function adminClient() {
  const config = supabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return config && key
    ? createClient(config.url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null
}
