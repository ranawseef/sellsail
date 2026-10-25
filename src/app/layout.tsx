import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Inter for reading, Plus Jakarta Sans for headings.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "SellSail | Amazon to OnBuy repricer for UK sellers",
    template: "%s | SellSail",
  },
  description: site.description,
  applicationName: site.name,
  publisher: site.company,
  openGraph: { siteName: site.name, locale: "en_GB", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, address: false, email: false },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  legalName: site.company,
  url: site.url,
  logo: `${site.url}/logo.png`,
  description: site.description,
  email: site.email,
  telephone: site.phone,
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: site.email, telephone: site.phone, areaServed: "GB", availableLanguage: "en" },
  identifier: { "@type": "PropertyValue", propertyID: "Companies House", value: site.companyNumber },
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor College House, 17 King Edwards Road",
    addressLocality: "Ruislip",
    addressRegion: "London",
    postalCode: "HA4 7AE",
    addressCountry: "GB",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${jakarta.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
