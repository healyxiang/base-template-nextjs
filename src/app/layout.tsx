import type { Metadata } from "next"
import { site } from "@/config/site"
import "./globals.css"
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description.en,
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
