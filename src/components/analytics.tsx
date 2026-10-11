"use client"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { reportPageView, flushAnalyticsEvents } from "@/lib/analytics"
import { useEffect } from "react"
export function Analytics() {
  const pathname = usePathname()
  const ga = process.env.NEXT_PUBLIC_GA4_ID
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID
  const enabled =
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  useEffect(() => {
    if (enabled && ga) reportPageView(pathname)
  }, [pathname, enabled, ga])
  if (!enabled) return null
  return (
    <>
      {ga && /^G-[A-Z0-9]+$/.test(ga) ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            onReady={() => {
              reportPageView(window.location.pathname)
              flushAnalyticsEvents()
            }}
          >{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(ga)},{send_page_view:false});`}</Script>
        </>
      ) : null}
      {clarity && /^[a-z0-9]+$/i.test(clarity) ? (
        <Script
          id="clarity-init"
          onReady={flushAnalyticsEvents}
          strategy="afterInteractive"
        >{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script',${JSON.stringify(clarity)});`}</Script>
      ) : null}
    </>
  )
}
