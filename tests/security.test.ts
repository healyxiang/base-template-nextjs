import { test } from "node:test"
import assert from "node:assert/strict"
import { safeReturnPath, sameOrigin, isAdmin } from "../src/lib/security"
import { localizedPath, site } from "../src/config/site"
import { extractUrls } from "../scripts/indexnow.mjs"
test("login return paths cannot leave this origin", () => {
  for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "/\r\nevil"])
    assert.equal(safeReturnPath(path), "/app")
  assert.equal(safeReturnPath("/zh/app/demo?x=1"), "/zh/app/demo?x=1")
})
test("write origin and admin allowlist fail closed", () => {
  assert.equal(sameOrigin(new Request("https://example.test/api/tasks/demo")), false)
  assert.equal(
    sameOrigin(
      new Request("https://example.test/api/tasks/demo", {
        headers: { origin: "https://evil.test" },
      })
    ),
    false
  )
  assert.equal(
    sameOrigin(
      new Request("https://example.test/api/tasks/demo", {
        headers: { origin: "https://example.test" },
      })
    ),
    true
  )
  process.env.ADMIN_USER_IDS = "a, b"
  assert.equal(isAdmin("b"), true)
  assert.equal(isAdmin("c"), false)
  delete process.env.ADMIN_USER_IDS
})
test("locale routing and public pricing defaults", () => {
  assert.equal(localizedPath("en", "/app"), "/app")
  assert.equal(localizedPath("zh", "/app"), "/zh/app")
  assert.equal(localizedPath("en"), "/")
  assert.equal(
    site.plans.reduce((n, p) => n + p.credits, 0),
    1100
  )
})
test("IndexNow sitemap extraction deduplicates, rejects foreign and private URLs", () => {
  assert.deepEqual(
    extractUrls(
      "<loc>https://example.test/blog/a</loc><loc>https://example.test/blog/a</loc>",
      "https://example.test"
    ),
    ["https://example.test/blog/a"]
  )
  assert.throws(() => extractUrls("<loc>https://evil.test/</loc>", "https://example.test"))
  assert.throws(() =>
    extractUrls("<loc>https://example.test/zh/app/account</loc>", "https://example.test")
  )
})

test("session refresh forwards cookies to this request and preserves locale rewrite", async () => {
  const { NextRequest, NextResponse } = await import("next/server")
  const { applySessionCookies } = await import("../src/lib/supabase/proxy")
  const request = new NextRequest("https://example.test/app", {
    headers: { cookie: "session=old" },
  })
  const makeResponse = () => {
    const headers = new Headers(request.headers)
    headers.set("x-next-intl-locale", "en")
    return NextResponse.rewrite(new URL("/en/app", request.url), { request: { headers } })
  }
  const previous = makeResponse()
  previous.cookies.set("NEXT_LOCALE", "en")
  const response = applySessionCookies(
    request,
    previous,
    makeResponse,
    [{ name: "session", value: "new", options: { path: "/", httpOnly: true } }],
    { "Cache-Control": "private, no-store" }
  )
  assert.equal(response.headers.get("x-middleware-request-cookie"), "session=new")
  assert.equal(response.headers.get("x-middleware-request-x-next-intl-locale"), "en")
  assert.equal(response.headers.get("x-middleware-rewrite"), "https://example.test/en/app")
  assert.equal(response.cookies.get("session")?.value, "new")
  assert.equal(response.cookies.get("NEXT_LOCALE")?.value, "en")
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
})

test("analytics queues early conversions and deduplicates only consecutive pageviews", async () => {
  const { track, flushAnalyticsEvents, reportPageView } = await import("../src/lib/analytics")
  const gaCalls: unknown[][] = []
  const clarityCalls: unknown[][] = []
  const originalEnv = { ...process.env }
  const fakeWindow = {
    location: { origin: "https://example.test" },
    templateAnalyticsQueue: [],
    templateLastPageView: undefined,
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
    clarity: undefined as ((...args: unknown[]) => void) | undefined,
  }
  Object.defineProperty(globalThis, "window", { value: fakeWindow, configurable: true })
  try {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true"
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production"
    process.env.NEXT_PUBLIC_GA4_ID = "G-TEST"
    process.env.NEXT_PUBLIC_CLARITY_ID = "test"
    track("sign_up")
    assert.equal(fakeWindow.templateAnalyticsQueue.length, 1)
    fakeWindow.gtag = (...args) => gaCalls.push(args)
    flushAnalyticsEvents()
    flushAnalyticsEvents()
    assert.equal(gaCalls.length, 1)
    fakeWindow.clarity = (...args) => clarityCalls.push(args)
    flushAnalyticsEvents()
    assert.equal(clarityCalls.length, 1)
    assert.equal(fakeWindow.templateAnalyticsQueue.length, 0)
    reportPageView("/")
    reportPageView("/")
    reportPageView("/pricing")
    reportPageView("/")
    assert.equal(gaCalls.length, 4)
    process.env.NEXT_PUBLIC_VERCEL_ENV = "preview"
    track("task_success")
    assert.equal(gaCalls.length, 4)
  } finally {
    for (const key of [
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_VERCEL_ENV",
      "NEXT_PUBLIC_GA4_ID",
      "NEXT_PUBLIC_CLARITY_ID",
    ]) {
      if (originalEnv[key] === undefined) delete process.env[key]
      else process.env[key] = originalEnv[key]
    }
    Reflect.deleteProperty(globalThis, "window")
  }
})
