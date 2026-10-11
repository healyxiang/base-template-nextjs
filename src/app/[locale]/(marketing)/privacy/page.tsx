import { getTranslations } from "next-intl/server"
import type { Locale } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UI" })
  return pageMetadata(locale, "/privacy", t("privacy"))
}
export default async function Policy({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations("UI")
  return (
    <section className="section narrow">
      <h1>{t("privacy")}</h1>
      <div className="notice">{t("legalNotice")}</div>
      <p className="lead">
        {locale === "zh"
          ? "我们使用账户信息提供登录、支付及额度服务。支付由支付服务商处理。启用后，Google Analytics 和 Microsoft Clarity 用于分析产品使用情况。请在此补充数据保留、删除、服务商和用户权利说明。"
          : "We use account details to provide sign-in, purchases and credit balances. Payment processing is handled by our payment provider. When enabled, Google Analytics and Microsoft Clarity help us understand product usage. Describe your retention, deletion, providers, and user rights here."}
      </p>
    </section>
  )
}
