import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import path from "path"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  /* config options here */
}

export default withNextIntl(nextConfig)
