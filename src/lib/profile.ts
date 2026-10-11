import "server-only"
import { site } from "@/config/site"
import { adminClient } from "./supabase/server"
import type { User } from "@supabase/supabase-js"
export async function ensureProfile(user: User) {
  const admin = adminClient()
  if (!admin) throw new Error("Supabase is not configured")
  const { data, error } = await admin.rpc("ensure_profile", {
    p_user: user.id,
    p_email: user.email || "",
    p_signup: site.signupCredits,
  })
  if (error) throw new Error("Unable to initialize account")
  return { admin, created: data === true }
}
