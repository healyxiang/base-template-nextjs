import "server-only"
import { WaffoPancake } from "@waffo/pancake-ts"
import { paymentEnvironment } from "./config"
export function waffoClient() {
  const merchantId = process.env.WAFFO_MERCHANT_ID
  const privateKey = process.env.WAFFO_PRIVATE_KEY?.replace(/\\n/g, "\n")
  return merchantId && privateKey
    ? new WaffoPancake({ merchantId, privateKey, environment: paymentEnvironment() })
    : null
}
