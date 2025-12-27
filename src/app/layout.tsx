import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Base Template Next.js",
  description: "前端项目模板",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
