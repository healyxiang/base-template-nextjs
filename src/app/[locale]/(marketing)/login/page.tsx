import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { LoginForm } from "@/components/login-form"
export const metadata = { robots: { index: false, follow: false } }
export default async function Login() {
  const t = await getTranslations("UI")
  return (
    <section className="section narrow">
      <p className="eyebrow">{t("welcome")}</p>
      <h1>{t("login")}</h1>
      <p className="lead">{t("loginText")}</p>
      <Suspense fallback={<p>…</p>}>
        <LoginForm />
      </Suspense>
    </section>
  )
}
