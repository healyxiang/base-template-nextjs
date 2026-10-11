import "server-only"
import { site } from "@/config/site"
export function paymentEnvironment() {
  return process.env.WAFFO_ENVIRONMENT === "prod" ? ("prod" as const) : ("test" as const)
}
export function paymentProduct(planId: string) {
  const plan = site.plans.find((p) => p.id === planId)
  const productId = process.env[`WAFFO_PRODUCT_${planId.toUpperCase()}`]?.trim()
  return plan && productId ? { ...plan, productId } : null
}
export function paymentReady() {
  return (
    process.env.ONLINE_PAYMENT_ENABLED === "true" &&
    !!process.env.WAFFO_MERCHANT_ID &&
    !!process.env.WAFFO_PRIVATE_KEY &&
    !!process.env.WAFFO_STORE_ID
  )
}
