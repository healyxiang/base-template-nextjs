"use client"
import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { ServiceState } from "./service-state"
import { track } from "@/lib/analytics"
import { site } from "@/config/site"
import { Link } from "@/i18n/navigation"
export function DemoTask() {
  const t = useTranslations("UI")
  const { user } = useAuth()
  const [fail, setFail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const previous = useRef<{ requestId: string; simulateFailure: boolean } | null>(null)
  const [retryable, setRetryable] = useState(false)
  async function run(retry = false) {
    const body = retry
      ? previous.current
      : { requestId: crypto.randomUUID(), simulateFailure: fail }
    if (!body) return
    previous.current = body
    setBusy(true)
    setMessage("")
    setRetryable(true)
    try {
      const response = await fetch("/api/tasks/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.code === "INSUFFICIENT_CREDITS" ? t("insufficient") : t("networkError"))
        if (data.code === "INSUFFICIENT_CREDITS") track("insufficient_credits")
        return
      }
      setBalance(data.balance)
      setMessage(t(data.status === "failed" ? "taskFailed" : "taskSuccess"))
      if (data.status === "succeeded" && !data.replayed)
        track("task_success", { credit_cost: site.taskCost })
    } catch {
      setMessage(t("networkError"))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <ServiceState />
      {user ? (
        <div className="card">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={fail}
              disabled={busy}
              onChange={(e) => setFail(e.target.checked)}
            />
            {t("simulateFailure")}
          </label>
          <div className="button-row">
            <button className="button" disabled={busy} onClick={() => void run()}>
              {t(busy ? "running" : "run")}
            </button>
            {retryable ? (
              <button className="button secondary" disabled={busy} onClick={() => void run(true)}>
                {t("retry")}
              </button>
            ) : null}
          </div>
          <p role="status">{message}</p>
          {balance !== null ? (
            <p>
              {t("balance")}: <strong>{balance}</strong>
            </p>
          ) : null}
        </div>
      ) : null}
      <Link href="/pricing" className="text-link">
        {t("toPricing")} →
      </Link>
    </>
  )
}
