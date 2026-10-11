import { getTranslations } from "next-intl/server"
import type { Locale } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UI" })
  return pageMetadata(locale, "/terms", t("terms"))
}
export default async function Policy({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations("UI")
  return (
    <section className="section narrow">
      <h1>{t("terms")}</h1>
      <div className="notice">{t("legalNotice")}</div>
      <p className="lead">
        {locale === "zh"
          ? "请合法使用本服务。额度包为一次性购买，没有过期时间。退款会撤回额度，包括已经使用的额度，并可能产生负余额。请在此补充退款条件、支持流程及适用条款。"
          : "Your account is for lawful use of the service. Credit packs are one-time purchases and do not expire. Refunds revoke credits, including credits already used, and can produce a negative balance. Describe your refund eligibility, support process, and applicable terms here."}
      </p>
    </section>
  )
}
