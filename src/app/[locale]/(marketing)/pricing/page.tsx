import { getTranslations, setRequestLocale } from "next-intl/server"
import { PricingCards } from "@/components/pricing-cards"
import { pageMetadata } from "@/lib/seo"
import type { Locale } from "@/config/site"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UI" })
  return pageMetadata(locale, "/pricing", t("pricing"))
}
export default async function Pricing({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("UI")
  return (
    <section className="section">
      <p className="eyebrow">{t("pricing")}</p>
      <h1>{t("pricingTitle")}</h1>
      <p className="lead">{t("pricingText")}</p>
      <PricingCards />
      <p className="muted">{t("refundNote")}</p>
    </section>
  )
}
