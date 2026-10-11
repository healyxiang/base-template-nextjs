"use client"
import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { site, type Locale } from "@/config/site"
import { AccountLink, LanguageSwitch } from "./navigation"
const icons: Record<string, string> = { home: "◈", sparkles: "✧", user: "○", help: "?" }
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("UI")
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("template:sidebar:v1") === "collapsed"
      queueMicrotask(() => setCollapsed(stored))
    } catch {}
  }, [])
  function toggle() {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem("template:sidebar:v1", next ? "collapsed" : "expanded")
      } catch {}
      return next
    })
  }
  const nav = (compact: boolean) => (
    <nav aria-label={t("workspace")}>
      {site.nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label[locale]}
          aria-current={pathname === item.href ? "page" : undefined}
          className="workspace-link"
          onClick={() => dialog.current?.close()}
        >
          <span aria-hidden="true">{icons[item.icon]}</span>
          {compact ? <span className="sr-only">{item.label[locale]}</span> : item.label[locale]}
        </Link>
      ))}
    </nav>
  )
  return (
    <div className={`workspace ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar">
        <Link className="brand" href="/">
          {collapsed ? "L" : site.name}
        </Link>
        {nav(collapsed)}
        <div className="sidebar-bottom">
          <LanguageSwitch />
          <AccountLink />
          <button
            aria-expanded={!collapsed}
            aria-label={t(collapsed ? "expand" : "collapse")}
            title={t(collapsed ? "expand" : "collapse")}
            onClick={toggle}
          >
            {collapsed ? "→" : "←"} {!collapsed ? t("collapse") : null}
          </button>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <button
            className="mobile-menu"
            aria-label={t("menu")}
            onClick={() => dialog.current?.showModal()}
          >
            ☰
          </button>
          <span>{t("workspace")}</span>
          <Link href="/pricing">{t("toPricing")}</Link>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
      <dialog ref={dialog} className="mobile-dialog">
        <button
          aria-label={t("close")}
          onClick={() => dialog.current?.close()}
          className="dialog-close"
        >
          ×
        </button>
        <Link href="/" className="brand">
          {site.name}
        </Link>
        {nav(false)}
        <LanguageSwitch />
        <AccountLink />
      </dialog>
    </div>
  )
}
