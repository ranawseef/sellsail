import {
  Calculator,
  ClipboardList,
  Clock,
  Download,
  History,
  PackageX,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
} from "lucide-react";

export type Feature = {
  slug: string;
  title: string;
  short: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tile: string; // tile background + icon colour classes
};

export const features: Feature[] = [
  { slug: "product-import", title: "Product import", short: "Bring in products from Amazon or AliExpress with a link.", icon: Download, tile: "bg-sky text-[#3b7fb0]" },
  { slug: "onbuy-listing", title: "OnBuy listing", short: "Turn an imported product into an OnBuy listing in one go.", icon: UploadCloud, tile: "bg-lilac text-[#6b4fb0]" },
  { slug: "fee-aware-floors", title: "Fee-aware floors", short: "Commission, VAT and delivery counted on every listing.", icon: TrendingUp, tile: "bg-mint text-sea" },
  { slug: "buy-box-watch", title: "Buy Box watch", short: "See what's winning and reprice what isn't.", icon: Clock, tile: "bg-sun-soft text-[#8a6a00]" },
  { slug: "stock-price-sync", title: "Stock and price sync", short: "Supplier changes reach your OnBuy listings on every sync.", icon: RefreshCw, tile: "bg-sky text-[#3b7fb0]" },
  { slug: "out-of-stock-pause", title: "Out-of-stock pause", short: "Never sell an item your supplier can't send.", icon: PackageX, tile: "bg-coral text-[#b5532f]" },
  { slug: "orders", title: "Orders dashboard", short: "Every OnBuy order next to its supplier link and profit.", icon: ClipboardList, tile: "bg-mint text-sea" },
  { slug: "safety-brakes", title: "Safety brakes", short: "A broken feed stops the run before OnBuy sees it.", icon: ShieldCheck, tile: "bg-ink text-sun" },
  { slug: "price-history", title: "Price history", short: "What changed, when and why, for every price.", icon: History, tile: "bg-lilac text-[#6b4fb0]" },
  { slug: "fee-calculator", title: "Free fee calculator", short: "Work out OnBuy fees and profit, no account needed.", icon: Calculator, tile: "bg-white text-ink" },
];
