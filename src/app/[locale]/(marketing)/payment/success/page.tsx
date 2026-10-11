import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { PaymentStatus } from "@/components/payment-status"
export const metadata = { robots: { index: false, follow: false } }
export default async function Success() {
  const t = await getTranslations("UI")
  return (
    <section className="section narrow">
      <h1>{t("paymentTitle")}</h1>
      <Suspense fallback={<p>…</p>}>
        <PaymentStatus />
      </Suspense>
    </section>
  )
}
