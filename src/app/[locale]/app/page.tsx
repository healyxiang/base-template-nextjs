import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
export default async function AppHome() {
  const t = await getTranslations("UI")
  return (
    <>
      <p className="eyebrow">{t("workspace")}</p>
      <h1>{t("overview")}</h1>
      <p className="lead">{t("overviewText")}</p>
      <div className="grid two">
        <Link className="card interactive" href="/app/demo">
          <span className="feature-number">✧</span>
          <h2>{t("demo")}</h2>
          <p>{t("tryDemo")} →</p>
        </Link>
        <Link className="card interactive" href="/app/account">
          <span className="feature-number">○</span>
          <h2>{t("account")}</h2>
          <p>{t("balance")} →</p>
        </Link>
      </div>
    </>
  )
}
