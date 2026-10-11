import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { site, type Locale, absoluteUrl } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/json-ld"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMetadata(locale, "/", site.name)
}
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("UI")
  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t("tagline")}</p>
        <h1>{t("headline")}</h1>
        <p className="hero-description">{t("subtitle")}</p>
        <div className="button-row">
          <Link className="button" href="/app/demo">
            {t("tryDemo")} <span>↗</span>
          </Link>
          <Link className="button secondary" href="/pricing">
            {t("pricing")}
          </Link>
        </div>
        <p className="muted">{t("signup", { credits: site.signupCredits })}</p>
        <div className="hero-preview">
          <div className="preview-dots">● ● ●</div>
          <div className="preview-inner">
            <div className="preview-sidebar">
              <b>{site.name}</b>
              <span>◈ {t("workspace")}</span>
              <span>✧ {t("demo")}</span>
            </div>
            <div>
              <p className="eyebrow">{t("balance")}</p>
              <strong className="preview-balance">
                {site.signupCredits}
                <span> {t("credits")}</span>
              </strong>
              <div className="preview-task">
                <span>✧ {t("demo")}</span>
                <span className="pill">
                  −{site.taskCost} {t("credits")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <p className="eyebrow">{site.name}</p>
        <h2>{t("features")}</h2>
        <div className="grid three">
          {["Auth", "Credits", "Content"].map((key, i) => (
            <article className="card" key={key}>
              <span className="feature-number">0{i + 1}</span>
              <h3>{t(`feature${key}`)}</h3>
              <p>{t(`feature${key}Text`)}</p>
            </article>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
        }}
      />
    </>
  )
}
