import type { Metadata } from "next"
import { WorkspaceShell } from "@/components/workspace-shell"
export const metadata: Metadata = { robots: { index: false, follow: false } }
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
