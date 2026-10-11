import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { serverClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/security"
import { localizedPath, type Locale } from "@/config/site"
import { WorkspaceShell } from "@/components/workspace-shell"
import { AdminPanel } from "@/components/admin-panel"
export const metadata = { robots: { index: false, follow: false } }
export default async function Admin({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const client = await serverClient()
  if (!client) notFound()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user)
    redirect(
      `${localizedPath(locale, "/login")}?next=${encodeURIComponent(localizedPath(locale, "/admin"))}`
    )
  if (!isAdmin(user.id)) notFound()
  const t = await getTranslations("UI")
  return (
    <WorkspaceShell>
      <h1>{t("admin")}</h1>
      <AdminPanel />
    </WorkspaceShell>
  )
}
