"use client"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { browserClient } from "@/lib/supabase/client"
import { safeReturnPath } from "@/lib/security"
import { localizedPath } from "@/config/site"
import { ServiceState } from "./service-state"
import { useAuth } from "./auth-provider"
export function LoginForm() {
  const t = useTranslations("UI")
  const locale = useLocale()
  const params = useSearchParams()
  const { configured, user } = useAuth()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const next = safeReturnPath(params.get("next"), localizedPath(locale, "/app"))
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const client = browserClient()
    if (!client) return
    setBusy(true)
    setMessage("")
    try {
      if (sent) {
        const { error } = await client.auth.verifyOtp({ email, token: code, type: "email" })
        if (error) throw error
        window.location.assign(next)
      } else {
        const { error } = await client.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        })
        if (error) throw error
        setSent(true)
        setMessage(t("codeSent"))
      }
    } catch {
      setMessage(t("networkError"))
    } finally {
      setBusy(false)
    }
  }
  async function google() {
    const client = browserClient()
    if (!client) return
    setBusy(true)
    try {
      const callback = new URL("/api/auth/callback", window.location.origin)
      callback.searchParams.set("next", next)
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      })
      if (error) throw error
    } catch {
      setMessage(t("networkError"))
      setBusy(false)
    }
  }
  if (!configured) return <ServiceState />
  if (user)
    return (
      <div className="notice">
        <p>{t("welcome")}</p>
        <a className="button" href={next}>
          {t("backApp")}
        </a>
      </div>
    )
  return (
    <form onSubmit={submit} className="form">
      <label>
        {t("email")}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          disabled={sent || busy}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {sent ? (
        <label>
          {t("code")}
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
      ) : null}
      <button className="button" disabled={busy}>
        {busy ? "…" : t(sent ? "verify" : "sendCode")}
      </button>
      {sent ? (
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => {
            setSent(false)
            setCode("")
          }}
        >
          {t("email")}
        </button>
      ) : null}
      <button
        type="button"
        className="button secondary"
        disabled={busy}
        onClick={() => void google()}
      >
        {t("google")}
      </button>
      <p role="status">{message || (params.get("error") ? t("networkError") : "")}</p>
    </form>
  )
}
