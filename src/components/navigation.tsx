"use client"
import { useTranslations, useLocale } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { site, type Locale } from "@/config/site"
import { useAuth } from "./auth-provider"
export function LanguageSwitch() {
  const locale = useLocale()
  const path = usePathname()
  return (
    <Link
      className="text-sm"
      href={path}
      locale={locale === "en" ? "zh" : "en"}
      aria-label={locale === "en" ? "切换中文" : "Switch to English"}
    >
      {locale === "en" ? "中文" : "English"}
    </Link>
  )
}
export function AccountLink() {
  const t = useTranslations("UI")
  const { user, signOut } = useAuth()
  return user ? (
    <button onClick={() => void signOut()} className="text-sm">
      {t("logout")}
    </button>
  ) : (
    <Link href="/login" className="text-sm">
      {t("login")}
    </Link>
  )
}
export function MarketingHeader() {
  const t = useTranslations("UI")
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        {site.name}
        <span className="brand-dot" />
      </Link>
      <nav aria-label="Main" className="header-links">
        <Link href="/features/demo">{t("features")}</Link>
        <Link href="/pricing">{t("pricing")}</Link>
        <Link href="/blog">{t("blog")}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitch />
        <AccountLink />
        <Link href="/app" className="button small">
          {t("openApp")}
        </Link>
      </div>
    </header>
  )
}
export function MarketingFooter() {
  const t = useTranslations("UI")
  const locale = useLocale() as Locale
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand">
          {site.name}
        </Link>
        <p>{site.description[locale]}</p>
      </div>
      <nav aria-label="Footer">
        {["about", "help", "privacy", "terms"].map((p) => (
          <Link key={p} href={`/${p}`}>
            {t(p)}
          </Link>
        ))}
      </nav>
      <small>
        © {new Date().getFullYear()} {site.name}
      </small>
    </footer>
  )
}
