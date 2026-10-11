import type { SetAllCookies } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"
// Rebuild the response after updating request cookies so Server Components see
// refreshed tokens on THIS request, while preserving next-intl's rewrite/locale headers.
export function applySessionCookies(
  request: NextRequest,
  previous: NextResponse,
  makeResponse: () => NextResponse,
  items: Parameters<SetAllCookies>[0],
  headers: Record<string, string>
) {
  items.forEach(({ name, value }) => request.cookies.set(name, value))
  const response = makeResponse()
  previous.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  items.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
  return response
}
