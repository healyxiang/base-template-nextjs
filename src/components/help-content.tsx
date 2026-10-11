import { getTranslations } from "next-intl/server"
import { site } from "@/config/site"
import { Link } from "@/i18n/navigation"
export async function HelpContent() {
  const t = await getTranslations("UI")
  return (
    <>
      <h1>{t("helpTitle")}</h1>
      <p className="lead">{t("helpText", { credits: site.signupCredits, cost: site.taskCost })}</p>
      <div className="card">
        <h2>{t("contact")}</h2>
        <a className="text-link" href={`mailto:${site.supportEmail}`}>
          {site.supportEmail}
        </a>
      </div>
      <Link className="text-link" href="/pricing">
        {t("toPricing")} →
      </Link>
    </>
  )
}
