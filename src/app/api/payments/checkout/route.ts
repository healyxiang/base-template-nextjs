import { z } from "zod"
import { apiAuth } from "@/lib/api-auth"
import { ensureProfile } from "@/lib/profile"
import { waffoClient } from "@/lib/payments/waffo"
import { paymentReady, paymentProduct, paymentEnvironment } from "@/lib/payments/config"
import { absoluteUrl, localizedPath } from "@/config/site"
const schema = z.object({ planId: z.string(), locale: z.enum(["en", "zh"]) })
export async function POST(request: Request) {
  const auth = await apiAuth(request, { write: true })
  if (auth.response) return auth.response
  const body = schema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: "Invalid plan" }, { status: 400 })
  const plan = paymentProduct(body.data.planId)
  const waffo = waffoClient()
  if (!paymentReady() || !plan || !waffo)
    return Response.json({ error: "Payment is not configured" }, { status: 503 })
  if (!auth.user.email) return Response.json({ error: "Email required" }, { status: 400 })
  const { admin } = await ensureProfile(auth.user)
  const { data: intent, error } = await admin
    .from("purchase_intents")
    .insert({
      user_id: auth.user.id,
      buyer_email: auth.user.email.toLowerCase(),
      plan_id: plan.id,
      product_id: plan.productId,
      credits: plan.credits,
      cents: plan.cents,
      environment: paymentEnvironment(),
    })
    .select("id")
    .single()
  if (error || !intent) return Response.json({ error: "Unable to start payment" }, { status: 500 })
  try {
    const session = await waffo.checkout.createSession({
      productId: plan.productId,
      currency: "USD",
      buyerEmail: auth.user.email,
      language: body.data.locale === "zh" ? "zh-Hans" : "en",
      orderMerchantExternalId: intent.id,
      metadata: { purchaseIntentId: intent.id, productId: plan.productId },
      successUrl: absoluteUrl(
        localizedPath(body.data.locale, `/payment/success?intent=${intent.id}`)
      ),
    })
    const { error: updateError } = await admin
      .from("purchase_intents")
      .update({ checkout_session_id: session.sessionId })
      .eq("id", intent.id)
    if (updateError) throw new Error("Session storage failed")
    return Response.json({ url: session.checkoutUrl, intentId: intent.id })
  } catch {
    return Response.json({ error: "Checkout unavailable. Please retry." }, { status: 502 })
  }
}
