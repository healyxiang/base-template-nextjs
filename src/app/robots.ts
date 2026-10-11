import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/config/site"
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/app",
        "/zh/app",
        "/admin",
        "/zh/admin",
        "/login",
        "/zh/login",
        "/payment/",
        "/zh/payment/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
