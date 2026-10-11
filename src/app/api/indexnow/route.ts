export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")
  const configured = process.env.INDEXNOW_KEY
  if (!configured || !/^[a-zA-Z0-9-]{8,128}$/.test(configured) || key !== configured)
    return new Response("Not found", { status: 404 })
  return new Response(configured, {
    headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
  })
}
