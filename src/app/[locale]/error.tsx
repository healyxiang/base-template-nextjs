"use client"
import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { useTranslations } from "next-intl"
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("UI")
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.captureException(error)
  }, [error])
  return (
    <section className="section">
      <h1>{t("networkError")}</h1>
      <button className="button" onClick={reset}>
        {t("checkAgain")}
      </button>
    </section>
  )
}
