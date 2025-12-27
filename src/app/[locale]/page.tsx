import { getTranslations } from "next-intl/server"
import { ExampleComponent } from "@/components/example-component"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations("HomePage")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">{t("title")}</h1>
        <p className="text-center text-gray-600 mb-8">{t("description")}</p>
        <ExampleComponent />
      </div>
    </main>
  )
}
