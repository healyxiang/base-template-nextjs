"use client"
import useSWR from "swr"
import { useTranslations, useLocale } from "next-intl"
import { track } from "@/lib/analytics"
import { useAuth } from "./auth-provider"
import { ServiceState } from "./service-state"
import { Link } from "@/i18n/navigation"
type RecordItem = { id: string; delta: number; kind: string; created_at: string }
type Account = { profile: { email: string; balance: number }; ledger: RecordItem[]; admin: boolean }
export class ApiError extends Error {
  constructor(public status: number) {
    super("Request failed")
  }
}
export async function jsonFetcher(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new ApiError(response.status)
  const data = await response.json()
  if (data.signupCreated) track("sign_up")
  return data
}
export function AccountPanel() {
  const t = useTranslations("UI")
  const locale = useLocale()
  const { user } = useAuth()
  const { data, error, isLoading } = useSWR<Account>(
    user ? ["/api/account", user.id] : null,
    ([url]: [string, string]) => jsonFetcher(url)
  )
  return (
    <>
      <ServiceState />
      {user && isLoading ? <p role="status">…</p> : null}
      {error ? (
        <p role="alert">
          {t(error instanceof ApiError && error.status === 503 ? "notConfigured" : "networkError")}
        </p>
      ) : null}
      {user && data ? (
        <>
          <div className="card balance-card">
            <p>{data.profile.email}</p>
            <span>{t("balance")}</span>
            <strong>{data.profile.balance}</strong>
            <Link className="button small" href="/pricing">
              {t("buy")}
            </Link>
            {data.admin ? (
              <Link className="text-link" href="/admin">
                {t("admin")}
              </Link>
            ) : null}
          </div>
          <h2>{t("activity")}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("kind")}</th>
                  <th>{t("change")}</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString(locale)}</td>
                    <td>{item.kind}</td>
                    <td>
                      {item.delta > 0 ? "+" : ""}
                      {item.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.ledger.length ? <p>{t("empty")}</p> : null}
          </div>
        </>
      ) : null}
    </>
  )
}
