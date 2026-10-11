import type { MetadataRoute } from "next"
import { publicRoutes } from "@/config/public-routes"
import { absoluteUrl, localizedPath } from "@/config/site"
import { posts } from "@/lib/blog"
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = publicRoutes.flatMap((path) =>
    (["en", "zh"] as const).map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      alternates: {
        languages: {
          en: absoluteUrl(localizedPath("en", path)),
          zh: absoluteUrl(localizedPath("zh", path)),
        },
      },
    }))
  )
  const articles = (
    await Promise.all(
      (["en", "zh"] as const).map(async (locale) =>
        Promise.all(
          (await posts(locale)).map(async (p) => {
            const languages: Record<string, string> = {}
            for (const other of ["en", "zh"] as const) {
              if ((await posts(other)).some((entry) => entry.slug === p.slug))
                languages[other] = absoluteUrl(localizedPath(other, `/blog/${p.slug}`))
            }
            return {
              url: absoluteUrl(localizedPath(locale, `/blog/${p.slug}`)),
              lastModified: new Date(p.updated || p.date),
              alternates: { languages },
            }
          })
        )
      )
    )
  ).flat()
  return [...routes, ...articles]
}
