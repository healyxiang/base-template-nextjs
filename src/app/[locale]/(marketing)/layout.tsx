import { MarketingHeader, MarketingFooter } from "@/components/navigation"
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  )
}
