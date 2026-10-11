"use client"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { localizedPath } from "@/config/site"
import { useAuth } from "./auth-provider"
export function ServiceState() {
  const t = useTranslations("UI")
  const { ready, configured, user } = useAuth()
  const path = localizedPath(useLocale(), usePathname())
  if (!ready) return <p role="status">…</p>
  if (!configured)
    return (
      <div className="notice">
        <strong>{t("configuration")}</strong>
        <p>{t("notConfigured")}</p>
      </div>
    )
  if (!user)
    return (
      <div className="notice">
        <p>{t("signInRequired")}</p>
        <Link className="button small" href={`/login?next=${encodeURIComponent(path)}`}>
          {t("login")}
        </Link>
      </div>
    )
  return null
}
