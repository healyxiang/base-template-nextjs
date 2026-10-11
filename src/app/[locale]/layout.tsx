import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { site, isLocale } from "@/config/site"
import { AuthProvider } from "@/components/auth-provider"
import { Analytics } from "@/components/analytics"
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }]
}
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : {},
  },
  openGraph: { images: ["/opengraph-image"] },
  twitter: { images: ["/opengraph-image"] },
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
