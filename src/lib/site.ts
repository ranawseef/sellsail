// Single source for brand facts so names and copy stay consistent everywhere.
export const site = {
  name: "SellSail",
  url: "https://sellsail.io",
  description:
    "The Amazon to OnBuy repricer for UK sellers. Live Amazon prices, fee-aware OnBuy pricing, competition that never goes below your floor, and stock sync every few minutes.",
  email: "hello@sellsail.io",
  company: "Horizon Retail Solutions Ltd",
  companyNumber: "15884637",
  address: "2nd Floor College House, 17 King Edwards Road, Ruislip, London, HA4 7AE",
  disclaimer:
    "SellSail is an independent tool and is not affiliated with, endorsed by or sponsored by OnBuy / OnCommerce, Amazon or AliExpress. All trademarks belong to their owners.",
};

export const mainNav = [
  { href: "/features", label: "Features" },
  { href: "/dropshipping", label: "Dropshipping" },
  { href: "/onbuy-fee-calculator", label: "Fee calculator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export const footerNav = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/onbuy-fee-calculator", label: "OnBuy fee calculator" },
      { href: "/signup", label: "Start free trial" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Dropshipping",
    links: [
      { href: "/dropshipping", label: "Dropshipping to OnBuy" },
      { href: "/dropshipping/amazon-to-onbuy", label: "Amazon to OnBuy" },
      { href: "/dropshipping/aliexpress-to-onbuy", label: "AliExpress to OnBuy" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

/** The legal line shown in footers and emails. */
export const companyLine = `SellSail is a trading name of ${site.company}, registered in England and Wales, company number ${site.companyNumber}. Registered office: ${site.address}, United Kingdom.`;
