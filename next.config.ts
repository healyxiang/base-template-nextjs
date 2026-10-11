import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withSentryConfig } from "@sentry/nextjs/config"
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")
const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["next-mdx-remote"],
  async rewrites() {
    return [{ source: "/:key.txt", destination: "/api/indexnow?key=:key" }]
  },
}
const localized = withNextIntl(config)
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(localized, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
    })
  : localized
