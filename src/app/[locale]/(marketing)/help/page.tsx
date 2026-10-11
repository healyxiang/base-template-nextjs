import { HelpContent } from "@/components/help-content"
import { pageMetadata } from "@/lib/seo"
import type { Locale } from "@/config/site"
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMetadata(locale, "/help", locale === "zh" ? "帮助" : "Help")
}
export default function Help() {
  return (
    <section className="section narrow">
      <HelpContent />
    </section>
  )
}
