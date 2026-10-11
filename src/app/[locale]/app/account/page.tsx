import { getTranslations } from "next-intl/server"
import { AccountPanel } from "@/components/account-panel"
export default async function Account() {
  const t = await getTranslations("UI")
  return (
    <>
      <h1>{t("account")}</h1>
      <AccountPanel />
    </>
  )
}
