"use client"
import useSWR from "swr"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { ServiceState } from "./service-state"
import { jsonFetcher } from "./account-panel"
import { track } from "@/lib/analytics"
import { Link } from "@/i18n/navigation"
type Status = { id: string; status: string; cents: number; currency: string; credits: number }
export function PaymentStatus() {
  const t = useTranslations("UI")
  const { user } = useAuth()
  const intent = useSearchParams().get("intent")
  const [checks, setChecks] = useState(0)
  const { data, error, mutate } = useSWR<Status>(
    user && intent ? `/api/payments/status?intent=${encodeURIComponent(intent)}` : null,
    jsonFetcher,
    {
      refreshInterval: (last) => (last?.status === "pending" && checks < 30 ? 2000 : 0),
      onSuccess: () => setChecks((v) => v + 1),
    }
  )
  useEffect(() => {
    if (data?.status !== "completed") return
    const key = `template:purchase:${data.id}`
    try {
      if (localStorage.getItem(key)) return
      track("purchase", {
        transaction_id: data.id,
        value: data.cents / 100,
        currency: data.currency,
      })
      localStorage.setItem(key, "1")
    } catch {}
  }, [data])
  return (
    <>
      <ServiceState />
      {user ? (
        <div className="card">
          <p role="status">
            {error || !intent
              ? t("networkError")
              : t(
                  data?.status === "completed"
                    ? "paymentComplete"
                    : data?.status === "refunded" || data?.status === "partially_refunded"
                      ? "paymentRefunded"
                      : "paymentPending"
                )}
          </p>
          <div className="button-row">
            <Link className="button" href="/app/account">
              {t("account")}
            </Link>
            <button
              className="button secondary"
              onClick={() => {
                setChecks(0)
                void mutate()
              }}
            >
              {t("checkAgain")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
