"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { site, localizedPath, type Locale } from "@/config/site"
import { useAuth } from "./auth-provider"
import { track } from "@/lib/analytics"
export function PricingCards() {
  const router = useRouter()
  const t = useTranslations("UI")
  const locale = useLocale() as Locale
  const { user, configured, ready } = useAuth()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  async function buy(planId: string) {
    if (!configured) {
      setError(t("notConfigured"))
      return
    }
    if (!user) {
      router.push(
        `${localizedPath(locale, "/login")}?next=${encodeURIComponent(localizedPath(locale, "/pricing"))}`
      )
      return
    }
    setBusy(planId)
    setError("")
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, locale }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(response.status === 503 ? t("notConfigured") : t("networkError"))
        return
      }
      const plan = site.plans.find((p) => p.id === planId)!
      track("begin_checkout", { currency: "USD", value: plan.cents / 100 })
      window.location.assign(data.url)
    } catch {
      setError(t("networkError"))
    } finally {
      setBusy(null)
    }
  }
  return (
    <>
      <div className="grid three pricing-grid">
        {site.plans.map((plan, i) => (
          <article key={plan.id} className={`card pricing-card ${i === 1 ? "featured" : ""}`}>
            <p className="eyebrow">{plan.name[locale]}</p>
            <h2>
              ${plan.cents / 100}
              <span> USD</span>
            </h2>
            <p className="plan-credits">
              {plan.credits} {t("credits")}
            </p>
            <button
              className={`button ${i === 1 ? "" : "secondary"}`}
              disabled={!ready || !!busy}
              onClick={() => void buy(plan.id)}
            >
              {busy === plan.id ? "…" : t("buy")}
            </button>
          </article>
        ))}
      </div>
      <p role="status" className="error">
        {error}
      </p>
    </>
  )
}
