# CLAUDE.md — SellSail (sellsail.io)

Read this file at the start of every session. It is the standing brief for the project.
If something here conflicts with a request, ask before proceeding. If a fact here is outdated or wrong, say so and propose the fix.

## 1. What we are building

**SellSail** is a UK-focused SaaS for dropshippers who sell on **OnBuy** (OnBuy now trades as "OnCommerce", with easyShop/Comet). Core promise:

- Take supplier feed items and reprice them for OnBuy with a **profit margin that survives OnBuy fees**.
- Manage listings and orders.
- Monitor buy-box / competitor position and reprice within safe limits.

Goal: become the best-known OnBuy repricing/automation SaaS, ahead of Re-Pricer, by being cheaper, safer and clearer.

**Owner:** Waseef. UK-based eBay/OnBuy dropshipper with a registered UK Ltd company. Part-time, newer programmer: comfortable with JavaScript, Node, PHP, APIs and browser automation. Explain decisions briefly, prefer simple boring solutions, and tell me when something is risky. Be direct and action-oriented. Do not pad answers.

## 2. Workflow and hosting (read carefully)

- **Code lives on GitHub** (private repo `sellsail`). I do NOT run or edit code on my own computer. Work happens in your cloud environment (Claude Code on the web / Codespaces): you clone the repo, edit, run, test, then push.
- **Hosting: Hostinger Node.js Web App** (Business/Cloud-type plan). Hostinger builds and redeploys automatically from the GitHub `main` branch on each push (GitHub integration, private repo authorized).
- **Never edit files on the live server and never ask me for SSH, FTP or hosting passwords.** GitHub is the single source of truth. Hostinger overwrites `public_html` and `hbuilds/` on every deploy, so manual server edits will be lost anyway.
- **Branching:** work on a feature branch, push it, and I merge to `main` when I have checked it. Never push straight to `main` unless I say so. Keep `main` always deployable.
- Commit in small logical commits with clear messages. Don't commit secrets, `node_modules`, or build output.
- npm runs automatically during Hostinger deploy and cannot be run over SSH. Keep `package.json` scripts (`build`, `start`) correct and lockfile committed.
- Config comes from **environment variables** set in the Hostinger dashboard (and a local-style `.env` only inside the cloud dev environment, git-ignored). Provide `.env.example` with fake values.

### Hostinger limits to respect (verified from Hostinger docs; re-check if unsure)
- Supported Node versions: 18, 20, 22, 24. Use **Node 22 LTS** and pin it in `package.json` (`engines`).
- Supported frameworks include Next.js, Express, NestJS, Fastify.
- Only the last two successful builds are kept. One GitHub account per hosting plan.
- Databases: Hostinger MySQL is available; Supabase (Postgres) and MongoDB Atlas are supported by Hostinger's connect wizard. **Redis is not documented as available: do not depend on Redis/BullMQ.**
- **Unknown / must be tested before relying on it:** cron jobs, always-on background workers, CPU/RAM/process limits. Hostinger's Node.js docs do not cover these. Do not build the real repricing scheduler until the "background job test" (task 1 below) proves a background process stays alive on this plan.
- No Stop/Delete button for Node deployments, and an existing domain must be removed from its other website before being attached to a Node app. Do not suggest removing websites without warning me.

## 3. Phases (do not skip ahead)

**Phase 1 (now): public site + free tools.**
- Stack: **TypeScript + Next.js (App Router)**, one app, deployed to Hostinger. Tailwind CSS for styling. Keep dependencies few.
- Pages: Home, Pricing (£29 / £69 / £149, Agency £249+ "contact us"), Features, Blog, About, Contact, Privacy, Terms, Cookie notice.
- **Free OnBuy fee & profit calculator** (main link magnet and SEO asset). See section 7.
- Waitlist / beta signup form with safe storage.
- Server-render or statically generate marketing pages so search engines see full HTML.

**Phase 2: the real product (repricer, listings, orders, dashboard).**
- Only after the background-job test passes. If the Hostinger plan cannot keep workers alive, the worker moves to a Hostinger VPS (or similar) and the web app stays here.
- Likely: Fastify or NestJS API + worker, PostgreSQL (Supabase or VPS-hosted), Stripe billing, scheduler implemented with a database-backed job table (no Redis dependency) unless we move to a VPS.
- Until then, keep fee/margin logic in pure, dependency-free, well-tested TypeScript functions in a shared `src/lib` so the worker can reuse them.

If I ask for Phase 2 work early, remind me of this and ask whether it is a prototype or the real thing.

## 4. Brand and trademark rules (important)

- Brand: **SellSail**. Domain: sellsail.io (owned). Consider buying sellsail.co.uk as a redirect.
- **"OnBuy" is a registered trademark of Visor Commerce Ltd.** Never use it in the brand name, domain, logo, social handles or company name.
- Using "OnBuy" **descriptively** in page titles, headings, copy and URL paths is fine (e.g. `/onbuy-fee-calculator`, "OnBuy repricer") because that is how sellers search.
- Every page footer must carry: *"SellSail is an independent tool and is not affiliated with, endorsed by or sponsored by OnBuy / OnCommerce."*
- Do not copy OnBuy logos or screenshots, and do not imply partnership. Same for eBay, Amazon and any competitor.
- Before final brand commitment, I search the UK IPO trade mark register for "SellSail" in Classes 9, 35 and 42. This cannot be automated.

## 5. Market and competitor context (verify before relying on it)

- Main specialist competitor: **Re-Pricer** (about £34.95 / £79 / £149 per month).
- Others: Avasam, CedCommerce, Linnworks, Rithum, StreetPricer, Boardfy, Reprice the Box.
- Positioning: fee-aware safe repricing (never sell below a floor that covers OnBuy fees, VAT and delivery), clear UK pricing, simple setup for small dropshippers.
- Competitor details change. Re-check live competitor pages when writing copy or comparisons and cite what you saw. Never invent features, prices, statistics or testimonials.

## 6. OnBuy API facts (re-verify against current OnBuy docs before coding)

- API v2 base: `https://api.onbuy.com/v2`. Auth: consumer key + secret key → access token.
- Rate limits noted in research: **600 GET/hour and 240 write calls/hour per site**. Every sync must respect them (queue, batch, back off on 429).
- **No webhooks.** Orders and listings must be polled.
- Price/stock updates use `PUT /v2/listings/by-sku`. Prices can take up to ~2 hours to appear on the site.
- The "check winning" endpoint only covers the seller's own listings. There is no official competitor-price endpoint, so do not promise exact competitor-price tracking unless a compliant method is found. Research options and risks and tell me.
- Official partners can use a Provider-Token. Check whether I should apply.
- Use OnBuy **test/sandbox keys** for development, never live keys.
- Commission is charged on the **VAT-inclusive and delivery-inclusive** price. Confirm current category commission rates from OnBuy's official fee page. Never hardcode rates: keep them in a config file with a "last verified" date.

## 7. Free fee and profit calculator (first real feature)

Inputs: item cost, supplier delivery cost, selling price (inc. VAT), delivery charged to customer, VAT rate, OnBuy category commission %, other/payment fees, packaging, target profit.
Outputs: net profit £, margin %, ROI %, **break-even price**, **recommended price for a target margin**.

Requirements:
- Fee rates come from `src/config/fees.ts` with a `lastVerified` date shown on the page.
- Fee maths is one pure function in `src/lib/fees.ts` with unit tests (VAT-inclusive commission, zero values, rounding to pence). Use integer pence, no float money bugs.
- Works with no login. Runs in the browser; no personal data is sent anywhere.
- Clear disclaimer: estimates only, check OnBuy's current fees.
- Supporting pages: "OnBuy fees explained", "How to price for OnBuy dropshipping", internally linked to the calculator.

## 8. SEO plan

Search intent to cover (validate volumes with a real keyword tool; do not invent volumes):
- OnBuy repricer / repricing software / automation
- OnBuy fees / commission calculator / profit calculator
- OnBuy dropshipping / how to dropship on OnBuy
- win the buy box on OnBuy
- OnBuy listing management / order management / API
- Re-Pricer alternative / comparison pages (factual only)

Rules:
- One primary keyword per page. Unique `<title>` and meta description, one `<h1>`, clean URLs, canonical tags (use Next.js metadata API).
- JSON-LD schema: `Organization`, `SoftwareApplication` (once the product exists), `FAQPage` where genuinely useful, `BreadcrumbList`.
- `sitemap.xml`, `robots.txt`, fast pages (Core Web Vitals, optimised images, minimal client JS), mobile first.
- Domain Authority/Rating are third-party scores earned by backlinks, not by the domain name. Link plan: free calculator, genuinely useful guides, directories (G2, Capterra, SourceForge, Product Hunt), seller communities. No spam or link schemes that break Google's rules.
- For AI assistants to recommend the brand, keep its name and description consistent everywhere and publish clear factual pages (pricing, features, FAQs). Add `llms.txt` only if cheap to maintain.
- Every blog post must be useful to a real seller and based on verified facts; no fabricated statistics.

## 9. Security, privacy and legal (UK)

- **Never expose secrets.** API keys, DB credentials and SMTP details live only in environment variables, never in code, never in git, never printed in chat. If a secret is ever committed, treat it as leaked and tell me so I can rotate it.
- Forms and APIs: validate input server-side (e.g. zod), use parameterised queries only, escape output, CSRF/origin checks, rate limiting or honeypot against spam.
- HTTPS only; set sensible security headers.
- UK GDPR: privacy policy, cookie consent (decline non-essential by default; load analytics only after consent), a way to delete data. I pay the ICO data protection fee (£52 at time of research; verify).
- Terms must say the service is an independent tool, prices and fees are the seller's responsibility, and results are not guaranteed.
- UK VAT threshold £90k (verify). Do not present legal or tax points as fact; flag them for an accountant or solicitor.
- When the real repricer exists: customer OnBuy keys encrypted at rest, per-tenant isolation, audit log of every price change, per-account kill switch, price floors that cannot be bypassed, circuit breakers that stop a run if a supplier feed looks broken (mass price jump, empty feed).

## 10. Working agreement for Claude Code

1. **Research before claiming.** For anything about OnBuy, fees, competitors, Hostinger limits, laws or prices, check current official sources and tell me the source and date. If you cannot verify it, say "unverified".
2. **Small steps.** Plan briefly, change a few files, show me what changed, then continue.
3. Ask before: adding a dependency, changing the project structure, deleting files, changing hosting/deploy settings, or anything involving real customer data or live API keys.
4. Keep it simple. Prefer readable code over clever abstractions. Comment the "why", not the "what".
5. After each task tell me: what you did, how to test it, and any risk. Run `npm run build` and the tests before saying a change is ready; a failing build means Hostinger will fail to deploy.
6. Write tests for fee/margin maths before building UI around it.
7. Accessibility and mobile: semantic HTML, labelled fields, keyboard usable, readable contrast.
8. If I ask for something that conflicts with this file (for example "OnBuy" in the brand name, or editing the live server), push back and explain.

## 11. Suggested project layout

```
src/
  app/                  Next.js routes (pages, API routes)
  components/
  lib/fees.ts           pure fee/margin maths (+ fees.test.ts)
  config/fees.ts        commission rates + lastVerified
public/                 static assets, robots.txt
.env.example
.gitignore
CLAUDE.md
README.md
package.json            engines: node 22; scripts: build, start, test
```

## 12. First tasks

1. **Background job test (prove or disprove always-on workers on this plan).** Deploy a minimal app that writes a timestamp to the database every minute, plus a page that shows the last 20 timestamps. Leave it 24 hours and report whether it kept running, and what happens after a restart or idle period. Also report any CPU/RAM limits shown in hPanel. Do this before designing the repricer scheduler.
2. Create the repo skeleton: Next.js + TypeScript + Tailwind, `.gitignore`, `.env.example`, README, Node 22 `engines`, working `build` and `start`. Confirm it deploys on Hostinger from `main`.
3. Build `fees.ts` + tests + `config/fees.ts` (research current OnBuy commission first).
4. Build the calculator page and supporting guide pages.
5. Build Home, Pricing, Privacy, Terms, Contact and the footer disclaimer.
6. Add sitemap, robots.txt, schema, and consent-gated analytics.
7. Waitlist/beta form with safe storage (decide database: Hostinger MySQL vs Supabase; recommend one and explain why).
