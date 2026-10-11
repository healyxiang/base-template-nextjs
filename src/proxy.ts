import createMiddleware from "next-intl/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"
import { applySessionCookies } from "./lib/supabase/proxy"
import { supabaseConfig } from "./lib/supabase/config"
const intl = createMiddleware(routing)
export default async function proxy(request: NextRequest) {
  const makeResponse = () =>
    request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.next({ request: { headers: request.headers } })
      : intl(request)
  let response = makeResponse()
  const config = supabaseConfig()
  if (config) {
    const client = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items, headers) {
          response = applySessionCookies(request, response, makeResponse, items, headers)
        },
      },
    })
    await client.auth.getUser()
    response.headers.set("Cache-Control", "private, no-store")
  }
  return response
}
export const config = { matcher: ["/((?!_next|_vercel|.*\\..*).*)"] }
