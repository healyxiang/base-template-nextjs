import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import GithubSlugger from "github-slugger"
import { posts, post, headings } from "@/lib/blog"
import { site, type Locale, absoluteUrl, localizedPath } from "@/config/site"
import { pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/json-ld"
import { Link } from "@/i18n/navigation"
type Props = { params: Promise<{ locale: Locale; slug: string }> }
export async function generateStaticParams() {
  return (
    await Promise.all(
      (["en", "zh"] as const).map(async (locale) =>
        (await posts(locale)).map((p) => ({ locale, slug: p.slug }))
      )
    )
  ).flat()
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const entry = await post(locale, slug)
  if (!entry) notFound()
  const metadata = pageMetadata(locale, `/blog/${slug}`, entry.title, entry.description)
  const languages: Record<string, string> = {}
  for (const other of ["en", "zh"] as const) {
    if (await post(other, slug))
      languages[other] = absoluteUrl(localizedPath(other, `/blog/${slug}`))
  }
  if (languages.en) languages["x-default"] = languages.en
  return {
    ...metadata,
    alternates: { canonical: absoluteUrl(localizedPath(locale, `/blog/${slug}`)), languages },
    openGraph: {
      ...metadata.openGraph,
      type: "article" as const,
      publishedTime: entry.date,
      modifiedTime: entry.updated || entry.date,
      authors: [entry.author],
    },
  }
}
export default async function Article({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const entry = await post(locale, slug)
  if (!entry) notFound()
  const t = await getTranslations("UI")
  const slugger = new GithubSlugger()
  const toc = headings(entry.content).map((title) => ({ title, id: slugger.slug(title) }))
  const related = (await posts(locale)).filter((p) => p.slug !== slug).slice(0, 3)
  return (
    <section className="section article-section">
      <p className="eyebrow">{t("blog")}</p>
      <h1>{entry.title}</h1>
      <p className="lead">{entry.description}</p>
      <p className="muted">
        {entry.author} · <time dateTime={entry.date}>{entry.date}</time>
      </p>
      <div className="article-layout">
        <article className="prose">
          <MDXRemote
            source={entry.content}
            options={{ mdxOptions: { rehypePlugins: [rehypeSlug] }, blockJS: true }}
          />
        </article>
        <aside className="article-toc">
          <strong>{t("contents")}</strong>
          {toc.map((h) => (
            <a key={h.id} href={`#${h.id}`}>
              {h.title}
            </a>
          ))}
        </aside>
      </div>
      <div className="card cta">
        <h2>{t("cta")}</h2>
        <Link className="button" href="/app">
          {t("openApp")}
        </Link>
      </div>
      {related.length ? (
        <>
          <h2>{t("related")}</h2>
          {related.map((p) => (
            <p key={p.slug}>
              <Link className="text-link" href={`/blog/${p.slug}`}>
                {p.title}
              </Link>
            </p>
          ))}
        </>
      ) : null}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: entry.title,
          description: entry.description,
          datePublished: entry.date,
          dateModified: entry.updated || entry.date,
          inLanguage: locale,
          author: { "@type": "Person", name: entry.author },
          publisher: { "@type": "Organization", name: site.name },
          mainEntityOfPage: absoluteUrl(localizedPath(locale, `/blog/${slug}`)),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: t("blog"),
              item: absoluteUrl(localizedPath(locale, "/blog")),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: entry.title,
              item: absoluteUrl(localizedPath(locale, `/blog/${slug}`)),
            },
          ],
        }}
      />
    </section>
  )
}
