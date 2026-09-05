# Metro Vancouver Price Sentinel Network

Metro Vancouver's first culturally-specific grocery affordability tracker. Monitors prices across **22 stores** in Metro Vancouver and calculates two metrics no other public tool tracks:

- **Store Premium Score** — how much each store charges above or below the Statistics Canada BC provincial baseline.
- **Poverty Penalty** — the extra dollars low-income families pay per bi-weekly basket simply because they cannot afford to buy in bulk.

> **Data: May–September 2026** — 17,430 price observations across 22 stores and 7 culturally specific baskets (125 store snapshots).

This is a [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript single-page app. It is **not** a set of static HTML pages — the dashboard is compiled at build time and reads the price CSV in the browser at runtime.

---

## What's in this repo

```
metro-price-sentinel/
├── index.html                          # Vite entry HTML (mounts the React app)
├── src/
│   ├── main.tsx                        # App bootstrap
│   ├── App.tsx                         # Routes: "/" (home) and "/dashboard"
│   ├── pages/Dashboard.tsx             # Interactive dashboard
│   ├── components/                     # Home sections + dashboard widgets
│   ├── hooks/usePriceData.ts           # Loads + aggregates the CSV, derives city/chain
│   └── data/storeData.ts              # Static seed data for narrative sections
├── public/
│   └── data/sentinel_prices_master.csv # Price data — update this file to refresh the dashboard
├── vite.config.ts                      # base is set to "/metro-price-sentinel/"
└── README.md
```

The dashboard fetches `public/data/sentinel_prices_master.csv` at runtime (via `fetch()` + PapaParse) and aggregates it per store. No price data is hardcoded in the dashboard. **Just like the old static site, you only need to edit the CSV and push** — the GitHub Actions workflow rebuilds and redeploys automatically (see [Deploy](#deploy-to-github-pages)). The Vite rebuild still happens, but it runs in CI so you never do it by hand.

---

## Local development

```bash
# Install dependencies (first time only)
npm install

# Start the dev server with hot reload
npm run dev
# then open the URL Vite prints (default http://localhost:5173)
```

Other scripts:

```bash
npm run build     # Type-check (tsc -b) + production build into dist/
npm run preview   # Serve the production build locally to sanity-check it
npm run lint      # ESLint
```

---

## Deploy to GitHub Pages

The site lives under a sub-path, so `vite.config.ts` sets:

```ts
base: '/metro-price-sentinel/',
```

If you rename the repo, update that `base` to match (`/<repo-name>/`).

### Automatic deploy (recommended)

`.github/workflows/deploy.yml` rebuilds and redeploys the site on **every push to `main`**. With this enabled, updating the dashboard is as simple as the old static site: edit, commit, push — the live site updates in a couple of minutes.

One-time setup:

1. Push this project to the `main` branch on GitHub.
2. **GitHub repo → Settings → Pages → Source: GitHub Actions.**

That's it. The workflow installs deps, runs `npm run build`, copies `index.html` → `404.html` (so `/dashboard` survives a refresh), and deploys.

Your site will be live at `https://YOUR_USERNAME.github.io/metro-price-sentinel/`.

### Manual deploy (fallback)

If you'd rather publish by hand to the `gh-pages` branch instead of using Actions:

```bash
npm run build
cp dist/index.html dist/404.html          # SPA routing fix
npx gh-pages -d dist
# or target a specific remote:
# npx gh-pages -d dist -r https://github.com/YOUR_USERNAME/metro-price-sentinel.git
```

Then set **Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**.

> Pick **one** Pages source — "GitHub Actions" *or* "Deploy from a branch" — not both.

---

## Data update workflow

### CSV column reference

| Column | Description |
| --- | --- |
| `store_name` | Full store name (must match exactly for city/chain mapping) |
| `store_postal` | Store postal code |
| `product_name` | Product name (used for category detection) |
| `persona` | Community basket: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others |
| `size_type` | `small` or `bulk` |
| `description` | Product description as listed on the store website |
| `price_cad` | Price in Canadian dollars (leave blank if unavailable) |
| `unit` | `each` or `per_kg` |
| `available` | `True` or `False` |
| `price_approximate` | `True` if the price is estimated |
| `collection_date` | Date collected (`YYYY-MM-DD`) |
| `needs_manual_review` | `True` if the data needs verification |
| `is_on_sale` | `TRUE` or `FALSE` — whether the item was on sale when collected |
| `regular_price_cad` | Pre-sale price in CAD, populated only when the collected `description` contained a recoverable "was $X.XX" figure; left blank otherwise. A blank value does **not** mean "not on sale" — use `is_on_sale` for that |

### Weekly update steps

1. Collect new prices from store websites (pcexpress.ca, walmart.ca, saveonfoods.com, nofrills.ca).
2. Edit `public/data/sentinel_prices_master.csv` with fresh data — **keep the header row unchanged**.
3. For out-of-stock items, set `available = False` and leave `price_cad` blank.
4. Commit and push:

   ```bash
   git add public/data/sentinel_prices_master.csv
   git commit -m "Price update YYYY-MM-DD"
   git push
   ```

That's all. With automatic deploy enabled (see [Deploy](#deploy-to-github-pages)), the push triggers GitHub Actions, which rebuilds and republishes the dashboard within a couple of minutes — no manual rebuild step.

**Collection rotation:** Prices are now gathered on a weekly rolling rotation of five batches (A through E), each covering a subset of the 22 stores. The rotation is currently operating and is on its second full loop through every store. On-sale items are recorded at their sale price, with the exact original ("was") price captured in `regular_price_cad` whenever the listing exposes it.

### Adding a new store

1. Add the store's rows to the CSV using its exact `store_name`.
2. City and chain are derived from the store name in `src/hooks/usePriceData.ts`. If the new name doesn't already contain a recognized city/chain substring, extend the matchers:
   - `deriveCity()` — add a `name.includes('<City>')` branch.
   - `deriveChain()` — add a `name.includes('<Chain>')` branch.

   Otherwise the store falls back to city/chain `"Other"`.

---

## Category → StatCan baseline mapping

| Category | Keywords | StatCan BC Baseline |
| --- | --- | --- |
| Staple | rice, bread, oil, flour, atta, shortening, noodle, sesame oil, soy sauce | $4.89 |
| Produce | tomato, onion, potato, carrot, eggplant, bok choy, garlic, ginger… | $3.42 |
| Protein | chicken, beef, pork, tofu, tilapia, mackerel, salmon, egg, dal… | $9.18 |
| Dairy | milk, yogurt, cheese, soy milk, cream, butter | $5.64 |

Source: Statistics Canada Table 18-10-0245-01, BC Consumer Price Index (food components).

---

## Project background

- **7 culturally specific baskets** built from peer-reviewed research: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others.
- **22 stores** across Vancouver, Burnaby, Surrey, Richmond, Coquitlam, Langley, Delta, North Vancouver, New Westminster, and Maple Ridge.
- **3 chain tiers** — discount (No Frills, FreshCo/CHALO!), mid-tier (Superstore, Save-On-Foods), mass (Walmart).
- **17,430 price observations** collected May–September 2026 across 125 store snapshots, updated weekly.
- **2 package sizes** (small + bulk) per product, recorded for the planned poverty-penalty analysis.

Across the current data, the gap between the most and least expensive store for the full basket is **$175.65 per bi-weekly trip** (Save-On-Foods Fleetwood Surrey at **$479.63** vs. CHALO! FreshCo 138 St & 72 Ave at **$303.98**) — roughly **$4,567 per year** over 26 trips — the premium a family pays simply for where they shop.

*Figures above reflect the dataset as of August 13, 2026; the live dashboard always shows current calculated values, which shift as prices are refreshed.*

> **Bulk-vs-small "poverty penalty" analysis is future work**, pending structured package-size data across all stores. The figure above is the store-to-store price gap computed directly from the master CSV, not a small-vs-bulk penalty.

The `/dashboard` route provides the interactive store comparison; the home page sections explain the methodology, community baskets, and the research decisions behind each one.

---

## Contact

**Kritubvna Sharma** — kritubvnabhattarai10@gmail.com

_Data collected from store websites. Some prices approximate. Data: May–September 2026, updated weekly. Last updated September 5, 2026._
