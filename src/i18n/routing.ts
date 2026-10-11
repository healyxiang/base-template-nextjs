import { defineRouting } from "next-intl/routing"
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: { maxAge: 31536000 },
})
