import {
  Calculator,
  Clock,
  Download,
  History,
  PackageX,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Swords,
  TrendingUp,
} from "lucide-react";

export type Feature = {
  slug: string;
  title: string;
  short: string;
  /** The longer explanation on the features page. */
  detail: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tile: string; // tile background + icon colour classes
};

// Only what the product does today. AliExpress, eBay, new-listing creation and
// orders are announced as "coming soon" elsewhere, never listed here.
export const features: Feature[] = [
  {
    slug: "amazon-prices",
    title: "Amazon prices, read for you",
    short: "Live Amazon UK prices for every ASIN, no Amazon account needed.",
    detail:
      "SellSail reads the current Amazon UK offer for each of your ASINs, using the cheapest offer fulfilled by Amazon that is in stock and dispatched within 48 hours, delivery included. You don't need Amazon API keys: SellSail uses its own connection.",
    icon: ShoppingCart,
    tile: "bg-sky text-[#3b7fb0]",
  },
  {
    slug: "fee-aware-pricing",
    title: "Fee-aware pricing",
    short: "Every price covers OnBuy commission, payment fees and your profit.",
    detail:
      "Set margin bands by Amazon price: a profit percentage, a minimum profit in pounds and an optional fixed amount. SellSail adds OnBuy commission and payment fees on top, so every price pays for itself.",
    icon: TrendingUp,
    tile: "bg-mint text-sea",
  },
  {
    slug: "competition",
    title: "Competition",
    short: "Undercut cheaper OnBuy sellers, never below your floor.",
    detail:
      "SellSail asks OnBuy who is winning each listing. When another seller is cheaper, it prices just under them, down to a floor you choose: a minimum profit, or a small, capped loss to win new sales. Your band price is always the ceiling.",
    icon: Swords,
    tile: "bg-sun-soft text-[#8a6a00]",
  },
  {
    slug: "stock-price-sync",
    title: "Stock and price sync",
    short: "Changes reach OnBuy every few minutes, around the clock.",
    detail:
      "New prices and stock levels are sent to OnBuy in batches of up to 1,000, every 2 to 5 minutes depending on your plan. A change only counts as done once OnBuy confirms it.",
    icon: RefreshCw,
    tile: "bg-sky text-[#3b7fb0]",
  },
  {
    slug: "out-of-stock",
    title: "Out-of-stock protection",
    short: "Never sell an item Amazon can't deliver.",
    detail:
      "When Amazon has no qualifying offer, the OnBuy listing goes out of stock straight away. If no fresh Amazon price arrives for 24 hours, it goes out of stock too. When the offer comes back, so does the listing.",
    icon: PackageX,
    tile: "bg-coral text-[#b5532f]",
  },
  {
    slug: "safety-brakes",
    title: "Safety brakes",
    short: "Odd data is checked again before OnBuy sees it.",
    detail:
      "A price that suddenly drops by more than 60% has to be seen three times before it is used. A batch where every item looks sold out is treated as an Amazon glitch, not a sell-out. One switch pauses everything.",
    icon: ShieldCheck,
    tile: "bg-ink text-sun",
  },
  {
    slug: "listing-import",
    title: "Listing import",
    short: "Bring in your OnBuy listings, or upload a CSV of SKUs and ASINs.",
    detail:
      "Import your existing OnBuy listings in one go, 500 at a time, or upload a CSV. SKU prefixes you set are stripped to find the ASIN, and SKUs OnBuy no longer recognises are archived so they stop failing.",
    icon: Download,
    tile: "bg-lilac text-[#6b4fb0]",
  },
  {
    slug: "price-history",
    title: "Price history",
    short: "What changed, when and why, for every listing.",
    detail:
      "Every price and stock change is logged for 30 days, with the Amazon price behind it and whether competition moved it, so you can always see what SellSail did.",
    icon: History,
    tile: "bg-lilac text-[#6b4fb0]",
  },
  {
    slug: "automation",
    title: "Runs on its own",
    short: "Repricing, competition and sync run 24/7 in the background.",
    detail:
      "Once set up, SellSail keeps going without you: reading Amazon, checking competition and updating OnBuy. The Automation page shows each job's progress, and you can run any of them now.",
    icon: Clock,
    tile: "bg-sun-soft text-[#8a6a00]",
  },
  {
    slug: "fee-calculator",
    title: "Free fee calculator",
    short: "Work out OnBuy fees and profit, no account needed.",
    detail: "Our free OnBuy fee calculator works out commission, VAT, profit and break-even price. No account needed.",
    icon: Calculator,
    tile: "bg-white text-ink",
  },
];

/** Announced but not built yet. Shown with a "Coming soon" badge. */
export const comingSoon = [
  { title: "AliExpress as a source", text: "Reprice OnBuy listings from AliExpress prices, with the same bands and brakes." },
  { title: "eBay as a marketplace", text: "List and reprice on eBay alongside OnBuy, from one catalogue." },
  { title: "Create new OnBuy listings", text: "Turn an Amazon product into a new OnBuy listing in a few clicks." },
];
