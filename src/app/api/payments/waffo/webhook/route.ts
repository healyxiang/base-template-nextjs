import { z } from "zod"
import { verifyWebhook, type WebhookEventData } from "@waffo/pancake-ts"
import { adminClient } from "@/lib/supabase/server"
import { paymentEnvironment } from "@/lib/payments/config"
export async function POST(request: Request) {
  const admin = adminClient()
  const store = process.env.WAFFO_STORE_ID
  if (!admin || !store) return new Response("Webhook is not configured", { status: 503 })
  let event
  try {
    event = verifyWebhook<WebhookEventData>(
      await request.text(),
      request.headers.get("x-waffo-signature"),
      { environment: paymentEnvironment() }
    )
  } catch {
    return new Response("Invalid signature", { status: 401 })
  }
  if (event.mode !== paymentEnvironment() || event.storeId !== store || !event.eventId || !event.id)
    return new Response("Unexpected source", { status: 400 })
  if (event.eventType === "order.completed" || event.eventType === "refund.succeeded") {
    const schema = z
      .object({
        orderId: z.string().min(1),
        currency: z.literal("USD"),
        buyerEmail: z.string().email(),
        amount: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
        chargedAmount: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
        refundedAmount: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
      })
      .passthrough()
    if (!schema.safeParse(event.data).success)
      return new Response("Invalid event data", { status: 400 })
  }
  const { error } = await admin.rpc("apply_payment", { p_event: event })
  if (error) {
    console.error("Webhook processing failed", { code: error.code, eventType: event.eventType })
    return new Response("Unable to process event", { status: 500 })
  }
  return Response.json({ received: true })
}
