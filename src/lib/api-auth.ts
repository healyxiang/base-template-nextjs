import { serverClient, adminClient } from "./supabase/server"
import { isAdmin, sameOrigin } from "./security"
export async function apiAuth(
  request: Request,
  options: { write?: boolean; admin?: boolean } = {}
) {
  if (options.write && !sameOrigin(request))
    return { response: Response.json({ error: "Invalid origin" }, { status: 403 }) }
  const client = await serverClient()
  const admin = adminClient()
  if (!client || !admin)
    return { response: Response.json({ error: "Supabase is not configured" }, { status: 503 }) }
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return { response: Response.json({ error: "Sign in required" }, { status: 401 }) }
  if (options.admin && !isAdmin(user.id))
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) }
  return { user, client, admin }
}
