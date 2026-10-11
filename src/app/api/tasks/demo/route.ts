import { z } from "zod"
import { apiAuth } from "@/lib/api-auth"
import { ensureProfile } from "@/lib/profile"
import { site } from "@/config/site"
const schema = z.object({
  requestId: z.string().uuid(),
  simulateFailure: z.boolean().default(false),
})
export async function POST(request: Request) {
  const auth = await apiAuth(request, { write: true })
  if (auth.response) return auth.response
  const body = schema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: "Invalid task" }, { status: 400 })
  const { admin } = await ensureProfile(auth.user)
  const { data, error } = await admin.rpc("run_demo", {
    p_user: auth.user.id,
    p_task: body.data.requestId,
    p_cost: site.taskCost,
    p_fail: body.data.simulateFailure,
  })
  if (error) {
    const insufficient = error.message.includes("INSUFFICIENT_CREDITS")
    return Response.json(
      {
        error: insufficient ? "Insufficient credits" : "Task could not run",
        code: insufficient ? "INSUFFICIENT_CREDITS" : "TASK_ERROR",
      },
      { status: insufficient ? 402 : 409 }
    )
  }
  return Response.json(data)
}
