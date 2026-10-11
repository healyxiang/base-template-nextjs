import type { Metadata } from "next"
import { absoluteUrl, localizedPath, site, type Locale } from "@/config/site"
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string = site.description[locale]
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(localizedPath(locale, path)),
      languages: {
        en: absoluteUrl(localizedPath("en", path)),
        zh: absoluteUrl(localizedPath("zh", path)),
        "x-default": absoluteUrl(path),
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(localizedPath(locale, path)),
      siteName: site.name,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  }
}
