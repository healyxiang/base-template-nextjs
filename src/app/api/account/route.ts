import { apiAuth } from "@/lib/api-auth"
import { ensureProfile } from "@/lib/profile"
import { isAdmin } from "@/lib/security"
export async function GET(request: Request) {
  const auth = await apiAuth(request)
  if (auth.response) return auth.response
  const { admin, created } = await ensureProfile(auth.user)
  const [profile, ledger] = await Promise.all([
    admin.from("profiles").select("id,email,balance").eq("id", auth.user.id).single(),
    admin
      .from("credit_ledger")
      .select("id,delta,kind,created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])
  if (profile.error || ledger.error)
    return Response.json({ error: "Account unavailable" }, { status: 500 })
  return Response.json(
    {
      profile: profile.data,
      ledger: ledger.data,
      admin: isAdmin(auth.user.id),
      signupCreated: created,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
