export function safeReturnPath(value: string | null, fallback = "/app") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value))
    return fallback
  return value
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin
}
export function isAdmin(id: string) {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(id)
}
