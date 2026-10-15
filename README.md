# SellSail

Marketing site for SellSail (sellsail.io): OnBuy repricing and Amazon/AliExpress to OnBuy dropshipping for UK sellers.

Phase 1 is frontend only: Next.js (App Router) + TypeScript + Tailwind CSS v4 with shadcn/ui-style components.

## Pages

`/`, `/features`, `/dropshipping`, `/dropshipping/amazon-to-onbuy`, `/dropshipping/aliexpress-to-onbuy`,
`/onbuy-fee-calculator`, `/pricing`, `/guides`, `/about`, `/contact`, `/beta`, `/privacy`, `/terms`, `/cookies`,
plus `sitemap.xml`, `robots.txt` and a 404 page.

## Scripts

- `npm run build`: production build (webpack, single worker, to stay under Hostinger's process limit)
- `npm start`: serve the build
- `npm run lint`

## Before launch

- Fill in `[bracketed]` placeholders (company details, listing limits).
- Have privacy, terms and cookie pages reviewed by a solicitor.
- Check OnBuy fee rates in `src/lib/calc.ts` against OnBuy's current fee page.
- The beta form does not store emails yet (no backend in phase 1).
