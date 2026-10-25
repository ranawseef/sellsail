// Single source for brand facts so names and copy stay consistent everywhere.
export const site = {
  name: "SellSail",
  url: "https://sellsail.io",
  description:
    "The Amazon to OnBuy repricer for UK sellers. Live Amazon prices, fee-aware OnBuy pricing, competition that never goes below your floor, and stock sync every few minutes.",
  email: "hello@sellsail.io",
  phone: "+44 7383 318529",
  phoneHref: "tel:+447383318529",
  whatsapp: `https://wa.me/447383318529?text=${encodeURIComponent("Hi SellSail, I'd like a quick demo.")}`,
  company: "VIVIDDEALS LTD",
  companyNumber: "15917561",
  address: "2 Frederick Street, Kings Cross, London, WC1X 0ND",
  /** The address split up, for structured data. */
  addressParts: { street: "2 Frederick Street, Kings Cross", city: "London", postcode: "WC1X 0ND", country: "GB" },
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
      { href: "/security", label: "Security" },
      { href: "/legal", label: "Legal information" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cookies", label: "Cookie notice" },
      { href: "/refunds", label: "Refunds and cancellation" },
      { href: "/acceptable-use", label: "Acceptable use" },
      { href: "/data-processing", label: "Data processing" },
    ],
  },
];

/** The legal line shown in footers and emails. */
export const companyLine = `SellSail is a trading name of ${site.company}, registered in England and Wales, company number ${site.companyNumber}. Registered office: ${site.address}, United Kingdom.`;
