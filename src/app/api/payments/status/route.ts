import { z } from "zod"
import { apiAuth } from "@/lib/api-auth"
export async function GET(request: Request) {
  const auth = await apiAuth(request)
  if (auth.response) return auth.response
  const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get("intent"))
  if (!id.success) return Response.json({ error: "Invalid intent" }, { status: 400 })
  const { data, error } = await auth.admin
    .from("purchase_intents")
    .select("id,status,cents,currency,credits")
    .eq("id", id.data)
    .eq("user_id", auth.user.id)
    .maybeSingle()
  if (error) return Response.json({ error: "Payment status unavailable" }, { status: 500 })
  return data
    ? Response.json(data, { headers: { "Cache-Control": "private, no-store" } })
    : Response.json({ error: "Not found" }, { status: 404 })
}
