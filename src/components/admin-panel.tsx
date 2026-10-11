"use client"
import { useState, useRef } from "react"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { jsonFetcher } from "./account-panel"
type Row = Record<string, string | number | null>
type AdminData = { profiles: Row[]; orders: Row[]; ledger: Row[]; audit: Row[] }
export function AdminPanel() {
  const t = useTranslations("UI")
  const { data, error, mutate } = useSWR<AdminData>("/api/admin", jsonFetcher)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const pending = useRef<{
    requestId: string
    userId: string
    delta: number
    reason: string
  } | null>(null)
  async function adjust(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fields = new FormData(e.currentTarget)
    const input = {
      userId: String(fields.get("userId")),
      delta: Number(fields.get("delta")),
      reason: String(fields.get("reason")),
    }
    const previous = pending.current
    const body =
      previous &&
      previous.userId === input.userId &&
      previous.delta === input.delta &&
      previous.reason === input.reason
        ? previous
        : { ...input, requestId: crypto.randomUUID() }
    pending.current = body
    setBusy(true)
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error()
      pending.current = null
      setMessage(t("saved"))
      await mutate()
    } catch {
      setMessage(t("networkError"))
    } finally {
      setBusy(false)
    }
  }
  if (error) return <p role="alert">{t("networkError")}</p>
  return (
    <>
      <h2>{t("adjust")}</h2>
      <form className="form card" onSubmit={adjust}>
        <label>
          {t("userId")}
          <input name="userId" required />
        </label>
        <label>
          {t("delta")}
          <input name="delta" type="number" min="-1000000" max="1000000" required />
        </label>
        <label>
          {t("reason")}
          <input name="reason" required minLength={3} maxLength={500} />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "…" : t("save")}
        </button>
        <p role="status">{message}</p>
      </form>
      {data ? (
        (["profiles", "orders", "ledger", "audit"] as const).map((key) => (
          <section key={key}>
            <h2>{t(key === "profiles" ? "users" : key === "ledger" ? "activity" : key)}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {(key === "profiles"
                      ? ["id", "email", "balance"]
                      : key === "orders"
                        ? ["id", "user_id", "plan_id", "status", "cents"]
                        : key === "ledger"
                          ? ["user_id", "delta", "kind", "created_at"]
                          : ["actor_id", "user_id", "delta", "reason"]
                    ).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data[key].map((row) => (
                    <tr key={String(row.id)}>
                      {(key === "profiles"
                        ? ["id", "email", "balance"]
                        : key === "orders"
                          ? ["id", "user_id", "plan_id", "status", "cents"]
                          : key === "ledger"
                            ? ["user_id", "delta", "kind", "created_at"]
                            : ["actor_id", "user_id", "delta", "reason"]
                      ).map((col) => (
                        <td key={col}>{String(row[col] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : (
        <p role="status">…</p>
      )}
    </>
  )
}
