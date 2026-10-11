"use client"
import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.captureException(error)
  }, [error])
  return (
    <html lang="en">
      <body>
        <h1>Something went wrong.</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
