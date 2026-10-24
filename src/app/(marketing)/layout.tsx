import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Public marketing pages: the site header and footer around each page.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
