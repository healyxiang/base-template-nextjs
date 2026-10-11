export type Locale = "en" | "zh"
export const site = {
  name: "LaunchKit",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportEmail: "support@example.com",
  description: {
    en: "Everything you need to launch your next idea.",
    zh: "把下一个想法，快速变成产品。",
  },
  signupCredits: 10,
  taskCost: 1,
  nav: [
    { href: "/app", label: { en: "Overview", zh: "概览" }, icon: "home" },
    { href: "/app/demo", label: { en: "Demo task", zh: "示例任务" }, icon: "sparkles" },
    { href: "/app/account", label: { en: "Account & credits", zh: "账户与额度" }, icon: "user" },
    { href: "/app/help", label: { en: "Help", zh: "帮助" }, icon: "help" },
  ],
  plans: [
    { id: "starter", credits: 100, cents: 900, name: { en: "Starter", zh: "入门包" } },
    { id: "growth", credits: 250, cents: 1900, name: { en: "Growth", zh: "成长包" } },
    { id: "scale", credits: 750, cents: 4900, name: { en: "Scale", zh: "进阶包" } },
  ],
} as const
export function localizedPath(locale: string, path = "/") {
  return `${locale === "zh" ? "/zh" : ""}${path === "/" ? "" : path}` || "/"
}
export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString()
}
export function isLocale(value: string): value is Locale {
  return value === "en" || value === "zh"
}
