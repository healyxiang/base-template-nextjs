import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/json-ld"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UI" })
  return pageMetadata(locale, "/features/demo", t("landingTitle"), t("landingText"))
}
export default async function Landing({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("UI")
  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t("demo")}</p>
        <h1>{t("landingTitle")}</h1>
        <p className="hero-description">{t("landingText")}</p>
        <Link className="button" href="/app/demo">
          {t("tryDemo")} ↗
        </Link>
      </section>
      <section className="section">
        <h2>{t("how")}</h2>
        <div className="grid three">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card">
              <span className="feature-number">0{n}</span>
              <h3>{t(`step${n}`)}</h3>
            </div>
          ))}
        </div>
        <h2>{t("faq")}</h2>
        <details className="card">
          <summary>{t("faqQ")}</summary>
          <p>{t("faqA")}</p>
        </details>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: t("faqQ"),
                acceptedAnswer: { "@type": "Answer", text: t("faqA") },
              },
            ],
          }}
        />
      </section>
    </>
  )
}
