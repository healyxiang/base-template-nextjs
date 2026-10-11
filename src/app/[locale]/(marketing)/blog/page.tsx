import { getTranslations, setRequestLocale } from "next-intl/server"
import { posts } from "@/lib/blog"
import { Link } from "@/i18n/navigation"
import { pageMetadata } from "@/lib/seo"
import type { Locale } from "@/config/site"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UI" })
  return pageMetadata(locale, "/blog", t("blog"))
}
export default async function Blog({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [entries, t] = await Promise.all([posts(locale), getTranslations("UI")])
  return (
    <section className="section">
      <p className="eyebrow">{t("blog")}</p>
      <h1>{t("blogTitle")}</h1>
      <div className="grid two">
        {entries.map((entry) => (
          <article key={entry.slug} className="card">
            <time dateTime={entry.date}>{entry.date}</time>
            <h2>
              <Link href={`/blog/${entry.slug}`}>{entry.title}</Link>
            </h2>
            <p>{entry.description}</p>
            <Link className="text-link" href={`/blog/${entry.slug}`}>
              {t("readArticle")} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
