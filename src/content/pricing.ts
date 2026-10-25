// Public plans. Prices and limits match src/config/plans.ts.
export const plans = [
  { name: "Starter", price: "£29", note: "Up to 5,000 listings · competition checks", cta: "Start free trial", href: "/signup", featured: false },
  { name: "Growth", price: "£69", note: "Up to 20,000 listings · faster sync", cta: "Start free trial", href: "/signup", featured: true },
  { name: "Pro", price: "£149", note: "Up to 50,000 listings · priority sync", cta: "Start free trial", href: "/signup", featured: false },
  { name: "Agency", price: "£249+", note: "Several OnBuy accounts", cta: "Talk to us", href: "/contact", featured: false },
];

export const planIncludes = [
  "Live Amazon UK prices",
  "Fee-aware OnBuy pricing",
  "Competition repricing",
  "Stock and price sync",
  "Safety brakes and price history",
  "Email support from a UK team",
];
