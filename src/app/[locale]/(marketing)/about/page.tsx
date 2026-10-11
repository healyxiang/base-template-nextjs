import { getTranslations } from "next-intl/server"
import { site, type Locale } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMetadata(locale, "/about", locale === "zh" ? "关于" : "About")
}
export default async function About() {
  const t = await getTranslations("UI")
  return (
    <section className="section narrow">
      <p className="eyebrow">{site.name}</p>
      <h1>{t("about")}</h1>
      <p className="lead">{t("aboutText")}</p>
    </section>
  )
}
