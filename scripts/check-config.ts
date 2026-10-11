import { loadEnvConfig } from "@next/env"
loadEnvConfig(process.cwd())
async function check() {
  const { site } = await import("../src/config/site")
  let errors = 0
  const fail = (message: string) => {
    console.error(`ERROR: ${message}`)
    errors++
  }
  let url: URL | undefined
  try {
    url = new URL(site.url)
    if (!["http:", "https:"].includes(url.protocol)) throw new Error()
  } catch {
    fail("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL")
  }
  if (
    process.argv.includes("--production") &&
    (!url || url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname))
  )
    fail("Production requires your canonical HTTPS domain")
  if (!Number.isInteger(site.signupCredits) || site.signupCredits < 0)
    fail("signupCredits must be a non-negative integer")
  if (!Number.isInteger(site.taskCost) || site.taskCost <= 0)
    fail("taskCost must be a positive integer")
  if (new Set(site.plans.map((plan) => plan.id)).size !== site.plans.length)
    fail("Plan IDs must be unique")
  for (const plan of site.plans) {
    if (
      !/^[a-z][a-z0-9_]*$/.test(plan.id) ||
      !Number.isInteger(plan.credits) ||
      plan.credits <= 0 ||
      !Number.isInteger(plan.cents) ||
      plan.cents <= 0
    )
      fail("Invalid credit pack configuration")
  }
  const auth = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]
  if (auth.some((key) => !!process.env[key]))
    for (const key of auth) if (!process.env[key]) fail(`Missing ${key}`)
  if (process.argv.includes("--production"))
    for (const key of auth) if (!process.env[key]) fail(`Missing ${key}`)
  if (process.env.ONLINE_PAYMENT_ENABLED === "true")
    for (const key of [
      ...auth,
      "WAFFO_MERCHANT_ID",
      "WAFFO_PRIVATE_KEY",
      "WAFFO_STORE_ID",
      ...site.plans.map((plan) => `WAFFO_PRODUCT_${plan.id.toUpperCase()}`),
    ])
      if (!process.env[key]) fail(`Missing ${key}`)
  if (!["test", "prod"].includes(process.env.WAFFO_ENVIRONMENT || "test"))
    fail("WAFFO_ENVIRONMENT must be test or prod")
  if (
    process.argv.includes("--production") &&
    process.env.ONLINE_PAYMENT_ENABLED === "true" &&
    process.env.WAFFO_ENVIRONMENT !== "prod"
  )
    fail("Production payments require WAFFO_ENVIRONMENT=prod")
  if (process.env.INDEXNOW_KEY && !/^[A-Za-z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY))
    fail("Invalid INDEXNOW_KEY")
  if (process.env.NEXT_PUBLIC_GA4_ID && !/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA4_ID))
    fail("Invalid GA4 ID")
  if (
    process.env.NEXT_PUBLIC_CLARITY_ID &&
    !/^[a-z0-9]+$/i.test(process.env.NEXT_PUBLIC_CLARITY_ID)
  )
    fail("Invalid Clarity ID")
  for (const id of (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean))
    if (!/^[0-9a-f-]{36}$/i.test(id.trim())) fail("ADMIN_USER_IDS must contain user UUIDs")
  if (site.supportEmail.endsWith("@example.com"))
    console.warn("Replace the example support email and legal content before launch.")
  console.log(
    errors
      ? `${errors} configuration error(s)`
      : "Configuration OK (unconfigured services remain in preview mode)."
  )
  process.exitCode = errors ? 1 : 0
}
void check()
