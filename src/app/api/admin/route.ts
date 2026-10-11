import { z } from "zod"
import { apiAuth } from "@/lib/api-auth"
const schema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  delta: z
    .number()
    .int()
    .min(-1000000)
    .max(1000000)
    .refine((n) => n !== 0),
  reason: z.string().trim().min(3).max(500),
})
export async function GET(request: Request) {
  const auth = await apiAuth(request, { admin: true })
  if (auth.response) return auth.response
  const [profiles, orders, ledger, audit] = await Promise.all(
    ["profiles", "purchase_intents", "credit_ledger", "admin_audit_logs"].map((table) =>
      auth.admin.from(table).select("*").order("created_at", { ascending: false }).limit(100)
    )
  )
  if ([profiles, orders, ledger, audit].some((r) => r.error))
    return Response.json({ error: "Admin data unavailable" }, { status: 500 })
  return Response.json(
    { profiles: profiles.data, orders: orders.data, ledger: ledger.data, audit: audit.data },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
export async function POST(request: Request) {
  const auth = await apiAuth(request, { write: true, admin: true })
  if (auth.response) return auth.response
  const body = schema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: "Invalid adjustment" }, { status: 400 })
  const { error } = await auth.admin.rpc("adjust_credits", {
    p_id: body.data.requestId,
    p_actor: auth.user.id,
    p_user: body.data.userId,
    p_delta: body.data.delta,
    p_reason: body.data.reason,
  })
  return error
    ? Response.json({ error: "Adjustment failed" }, { status: 409 })
    : Response.json({ ok: true })
}
