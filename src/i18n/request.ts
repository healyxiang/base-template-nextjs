import { getRequestConfig } from "next-intl/server"
import { isLocale } from "@/config/site"
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = requested && isLocale(requested) ? requested : "en"
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
})
