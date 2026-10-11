import { loadEnvConfig } from "@next/env"
import { pathToFileURL } from "node:url"
export function extractUrls(xml, origin) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  )
  return [
    ...new Set(
      urls.map((value) => {
        const url = new URL(value)
        if (url.origin !== origin || url.username || url.password)
          throw new Error(`Cross-origin URL: ${value}`)
        if (
          /^\/(?:zh\/)?(?:app|admin|login|payment)(?:\/|$)/.test(url.pathname) ||
          url.pathname.startsWith("/api/")
        )
          throw new Error(`Private URL: ${value}`)
        return url.href
      })
    ),
  ]
}
async function main() {
  loadEnvConfig(process.cwd())
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const explicit = args.filter((arg) => arg !== "--dry-run")
  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "").origin
  const key = process.env.INDEXNOW_KEY
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key || "")) throw new Error("Configure INDEXNOW_KEY")
  const response = await fetch(`${origin}/sitemap.xml`)
  if (!response.ok) throw new Error("Cannot read deployed sitemap")
  const urls = extractUrls(await response.text(), origin)
  const extras = explicit.map((value) => {
    const url = new URL(value, origin)
    if (url.origin !== origin || url.username || url.password)
      throw new Error("Explicit URL must be same origin")
    if (
      /^\/(?:zh\/)?(?:app|admin|login|payment)(?:\/|$)/.test(url.pathname) ||
      url.pathname.startsWith("/api/")
    )
      throw new Error("Explicit URL must be public")
    return url.href
  })
  const all = [...new Set([...urls, ...extras])]
  if (!all.length) throw new Error("No URLs found")
  const keyLocation = `${origin}/${key}.txt`
  const verification = await fetch(keyLocation)
  if (!verification.ok || (await verification.text()).trim() !== key)
    throw new Error("Deployed key file does not match")
  if (dryRun) {
    console.log(JSON.stringify({ host: new URL(origin).host, keyLocation, urlList: all }, null, 2))
    return
  }
  for (let i = 0; i < all.length; i += 10000) {
    const result = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(origin).host,
        key,
        keyLocation,
        urlList: all.slice(i, i + 10000),
      }),
    })
    if (![200, 202].includes(result.status))
      throw new Error(`IndexNow failed: ${result.status} ${await result.text()}`)
  }
  console.log(`Submitted ${all.length} URLs.`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
