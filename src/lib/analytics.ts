export type AnalyticsEvent =
  "sign_up" | "begin_checkout" | "purchase" | "task_success" | "insufficient_credits"

type PendingEvent = {
  name: AnalyticsEvent
  params: Record<string, string | number>
  gaSent: boolean
  claritySent: boolean
}
declare global {
  interface Window {
    templateLastPageView?: string
    templateAnalyticsQueue?: PendingEvent[]
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }
}
function enabled() {
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  )
}
export function flushAnalyticsEvents() {
  const ga = !!process.env.NEXT_PUBLIC_GA4_ID
  const clarity = !!process.env.NEXT_PUBLIC_CLARITY_ID
  window.templateAnalyticsQueue = (window.templateAnalyticsQueue || []).filter((event) => {
    if (ga && !event.gaSent && window.gtag) {
      window.gtag("event", event.name, event.params)
      event.gaSent = true
    }
    if (clarity && !event.claritySent && window.clarity) {
      window.clarity("event", event.name)
      event.claritySent = true
    }
    return (ga && !event.gaSent) || (clarity && !event.claritySent)
  })
}
export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}) {
  if (!enabled()) return
  // Preserve early conversions until afterInteractive scripts have initialized.
  const queue = (window.templateAnalyticsQueue ||= [])
  queue.push({ name: event, params, gaSent: false, claritySent: false })
  if (queue.length > 50) queue.shift()
  flushAnalyticsEvents()
}
export function reportPageView(path: string) {
  if (!window.gtag || window.templateLastPageView === path) return
  window.templateLastPageView = path
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
  })
}
