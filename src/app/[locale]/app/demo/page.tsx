import { getTranslations } from "next-intl/server"
import { site } from "@/config/site"
import { DemoTask } from "@/components/demo-task"
export default async function Demo() {
  const t = await getTranslations("UI")
  return (
    <>
      <p className="eyebrow">{t("workspace")}</p>
      <h1>{t("demo")}</h1>
      <p className="lead">{t("demoText", { cost: site.taskCost })}</p>
      <DemoTask />
    </>
  )
}
