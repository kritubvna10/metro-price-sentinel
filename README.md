Metro Vancouver Price Sentinel Network
Metro Vancouver's first culturally-specific grocery affordability tracker. Monitors prices at 10 stores across Metro Vancouver and calculates two metrics no other public tool tracks:

Store Premium Score — how much each store charges above or below the Statistics Canada BC provincial baseline
Poverty Penalty — the extra dollars low-income families pay per bi-weekly basket just because they cannot afford to buy in bulk

Pilot data: April–May 2026

What's in this repo
metro-price-sentinel/
├── index.html                  # Interactive dashboard (loads CSV via PapaParse)
├── about.html                  # Methodology, community guides, case studies
├── sentinel_prices_master.csv  # Price data — update this file to refresh the dashboard
└── README.md
The dashboard reads sentinel_prices_master.csv at runtime using fetch() + PapaParse. No data is hardcoded in the HTML. To update the dashboard, replace or edit the CSV — no code changes needed.

Deploy to GitHub Pages
First deploy
bash# 1. Create a new GitHub repo (e.g. metro-price-sentinel)
# 2. Push this folder
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/metro-price-sentinel.git
git push -u origin main

# 3. Enable GitHub Pages
# GitHub repo → Settings → Pages → Source: Deploy from branch → Branch: main / (root)
Your site will be live at https://YOUR_USERNAME.github.io/metro-price-sentinel/ within a few minutes.

Data update workflow
CSV column reference
ColumnDescriptionstore_nameFull store name (must match exactly for city/chain mapping)store_postalStore postal codeproduct_nameProduct name (used for category detection)personaCommunity basket: South Asian, Chinese, Filipino, Korean, European, Indigenous, Otherssize_typesmall or bulkdescriptionProduct description as listed on store websiteprice_cadPrice in Canadian dollars (leave blank if unavailable)uniteach or per_kgavailableTrue or Falseprice_approximateTrue if price is estimatedcollection_dateDate collected (YYYY-MM-DD)needs_manual_reviewTrue if data needs verification
Weekly update steps

Collect new prices from store websites (pcexpress.ca, walmart.ca, saveonfoods.com)
Add new rows to sentinel_prices_master.csv — keep the header row unchanged
Set available = False and leave price_cad blank for out-of-stock items
Commit and push:

bashgit add sentinel_prices_master.csv
git commit -m "Price update YYYY-MM-DD"
git push
GitHub Pages redeploys automatically. No rebuild step needed.
Adding a new store

Add its rows to the CSV with the new store_name
Add a city mapping in index.html inside STORE_CITY:

js   'New Store Name Here': 'City Name',

Add a chain mapping inside STORE_CHAIN:

js   'New Store Name Here': 'Chain Name',

Category → StatCan baseline mapping
The dashboard auto-categorizes products by keyword matching on product_name:
CategoryKeywordsStatCan BC BaselineStaplerice, bread, oil, flour, atta, shortening, noodle, sesame oil, soy sauce$4.89Producetomato, onion, potato, carrot, eggplant, bok choy, garlic, ginger…$3.42Proteinchicken, beef, pork, tofu, tilapia, mackerel, salmon, egg, dal…$9.18Dairymilk, yogurt, cheese, soy milk, cream, butter$5.64
Source: Statistics Canada Table 18-10-0245-01, BC Consumer Price Index (food components).

Local development
No build tools required. Open directly in a browser:
bash# macOS / Linux
open index.html

# Or serve locally to avoid any fetch() restrictions:
python3 -m http.server 8000
# then visit http://localhost:8000

Note: Some browsers block fetch() on file:// URLs. If the dashboard shows a CSV load error when opened directly, use the Python server above or deploy to GitHub Pages.


Project background

7 culturally specific baskets built from peer-reviewed research: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others
10 stores across Vancouver, Burnaby, Surrey, Richmond, Coquitlam, Langley
1,424 price data points collected April–May 2026
2 package sizes (small + bulk) per product to calculate the poverty penalty

The poverty penalty in the pilot data ranges from $19.26 to $51.22 per bi-weekly trip — between $500 and $1,319 per year — paid by families who cannot afford bulk purchases.
See about.html for full methodology, community guides, and the research decisions behind each basket.

Contact
Kritubvna Sharma
kritubvnabhattarai10@gmail.com

Data collected from store websites. Some prices approximate. Pilot phase — April–May 2026.
