# Metro Vancouver Price Sentinel Network

Metro Vancouver's first culturally-specific grocery affordability tracker. Monitors prices at 10 stores across Metro Vancouver and calculates two metrics no other public tool tracks:

- **Store Premium Score** — how much each store charges above or below the Statistics Canada BC provincial baseline
- **Poverty Penalty** — the extra dollars low-income families pay per bi-weekly basket *just because* they cannot afford to buy in bulk

**Pilot data: April–May 2026**

---

## What's in this repo

```
metro-price-sentinel/
├── index.html                  # Interactive dashboard (loads CSV via PapaParse)
├── about.html                  # Methodology, community guides, case studies
├── sentinel_prices_master.csv  # Price data — update this file to refresh the dashboard
└── README.md
```

The dashboard reads `sentinel_prices_master.csv` at runtime using `fetch()` + PapaParse. **No data is hardcoded in the HTML.** To update the dashboard, replace or edit the CSV — no code changes needed.

---

## Deploy to GitHub Pages

### First deploy

```bash
# 1. Create a new GitHub repo (e.g. metro-price-sentinel)
# 2. Push this folder
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/metro-price-sentinel.git
git push -u origin main

# 3. Enable GitHub Pages
# GitHub repo → Settings → Pages → Source: Deploy from branch → Branch: main / (root)
```

Your site will be live at `https://YOUR_USERNAME.github.io/metro-price-sentinel/` within a few minutes.

---

## Data update workflow

### CSV column reference

| Column | Description |
|--------|-------------|
| `store_name` | Full store name (must match exactly for city/chain mapping) |
| `store_postal` | Store postal code |
| `product_name` | Product name (used for category detection) |
| `persona` | Community basket: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others |
| `size_type` | `small` or `bulk` |
| `description` | Product description as listed on store website |
| `price_cad` | Price in Canadian dollars (leave blank if unavailable) |
| `unit` | `each` or `per_kg` |
| `available` | `True` or `False` |
| `price_approximate` | `True` if price is estimated |
| `collection_date` | Date collected (YYYY-MM-DD) |
| `needs_manual_review` | `True` if data needs verification |

### Weekly update steps

1. Collect new prices from store websites (pcexpress.ca, walmart.ca, saveonfoods.com)
2. Add new rows to `sentinel_prices_master.csv` — keep the header row unchanged
3. Set `available = False` and leave `price_cad` blank for out-of-stock items
4. Commit and push:

```bash
git add sentinel_prices_master.csv
git commit -m "Price update YYYY-MM-DD"
git push
```

GitHub Pages redeploys automatically. No rebuild step needed.

### Adding a new store

1. Add its rows to the CSV with the new `store_name`
2. Add a city mapping in `index.html` inside `STORE_CITY`:
   ```js
   'New Store Name Here': 'City Name',
   ```
3. Add a chain mapping inside `STORE_CHAIN`:
   ```js
   'New Store Name Here': 'Chain Name',
   ```

---

## Category → StatCan baseline mapping

The dashboard auto-categorizes products by keyword matching on `product_name`:

| Category | Keywords | StatCan BC Baseline |
|----------|----------|-------------------|
| Staple | rice, bread, oil, flour, atta, shortening, noodle, sesame oil, soy sauce | $4.89 |
| Produce | tomato, onion, potato, carrot, eggplant, bok choy, garlic, ginger… | $3.42 |
| Protein | chicken, beef, pork, tofu, tilapia, mackerel, salmon, egg, dal… | $9.18 |
| Dairy | milk, yogurt, cheese, soy milk, cream, butter | $5.64 |

Source: Statistics Canada Table 18-10-0245-01, BC Consumer Price Index (food components).

---

## Local development

No build tools required. Open directly in a browser:

```bash
# macOS / Linux
open index.html

# Or serve locally to avoid any fetch() restrictions:
python3 -m http.server 8000
# then visit http://localhost:8000
```

> **Note:** Some browsers block `fetch()` on `file://` URLs. If the dashboard shows a CSV load error when opened directly, use the Python server above or deploy to GitHub Pages.

---

## Project background

- **7 culturally specific baskets** built from peer-reviewed research: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others
- **10 stores** across Vancouver, Burnaby, Surrey, Richmond, Coquitlam, Langley
- **1,408 price data points** collected April–May 2026
- **2 package sizes** (small + bulk) per product to calculate the poverty penalty

The poverty penalty in the pilot data ranges from **$19.26 to $51.22 per bi-weekly trip** — between **$500 and $1,319 per year** — paid by families who cannot afford bulk purchases.

See [about.html](about.html) for full methodology, community guides, and the research decisions behind each basket.

---

## Contact

**Kritubvna Sharma**
kritubvnabhattarai10@gmail.com

---

*Data collected from store websites. Some prices approximate. Pilot phase — April–May 2026.*
