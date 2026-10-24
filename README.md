# SellSail

SellSail (sellsail.io): Amazon → OnBuy dropshipping repricer for UK sellers, multi-tenant, plus the public marketing site.

Next.js 16 (App Router, webpack build, single worker for Hostinger) + TypeScript + Tailwind CSS v4, MySQL/MariaDB via `mysql2`.
Read `CLAUDE.md`, `AGENTS.md` and `docs/saas-plan.md` before changing anything.

## Layout

- `src/app/(marketing)` public pages; `src/app/(auth)` login and signup; `src/app/app/*` the dashboard.
- `src/app/api/cron/tick` (Hostinger cron), `src/app/api/stripe/webhook`, `src/app/api/amazon/callback`.
- `src/server` everything that touches the database or the network:
  `auth` (sessions, passwords, rate limits), `crypto` (AES-256-GCM secrets), `connections` (proxy, OnBuy, Amazon),
  `integrations` (OnBuy and SP-API clients), `jobs` (scheduler, reprice, push, import), `billing` (Stripe),
  `repos` (queries), `actions` (server actions).
- `src/lib` pure code shared by server and browser (pricing formula, SKU rules, CSV parsing, formatting).
- `src/server/net/egress.ts` is the only way an OnBuy or Amazon request leaves the app: through the workspace's proxy, or not at all.
  `scripts/check-egress.mjs` fails the build if anything else opens a connection.

## Scripts

- `npm run build`: egress guard, then the production build
- `npm start`: serve the build
- `npm test`: unit tests, plus database tests when `TEST_DATABASE_URL` points at a throwaway database
- `npm run typecheck`, `npm run lint`

## Configuration

All settings are environment variables; see `.env.example` (fake values). Migrations run automatically on first use.

## Before launch

- Confirm the plan limits in `src/config/plans.ts` (SKU and Amazon-account limits are placeholders) and put the same numbers on `/pricing`.
- Review the default pricing bands in `src/lib/pricing.ts` (`DEFAULT_BANDS`), which are SellSail's suggestion.
- Have privacy, terms and cookie pages reviewed by a solicitor (they don't yet describe the paid service or Stripe).
- Check OnBuy fee rates in `src/lib/calc.ts` against OnBuy's current fee page.
- Replace the example product photos in `src/content/product-images.ts`.
