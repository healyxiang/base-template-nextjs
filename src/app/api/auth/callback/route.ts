import { NextResponse } from "next/server"
import { serverClient } from "@/lib/supabase/server"
import { safeReturnPath } from "@/lib/security"
import { site } from "@/config/site"
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const client = await serverClient()
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (!error)
      return NextResponse.redirect(new URL(safeReturnPath(url.searchParams.get("next")), site.url))
  }
  return NextResponse.redirect(new URL("/login?error=callback", site.url))
}
