import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "InchDesk - 方寸桌面",
  description: "An AI-powered Bento-style workspace",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
