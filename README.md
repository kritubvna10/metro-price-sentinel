# Metro Vancouver Price Sentinel Network

> **Live site:** [metro-price-sentinel.netlify.app](https://metro-price-sentinel.netlify.app)

Metro Vancouver's first culturally-specific grocery affordability tracker. Monitors prices at 10 stores across Metro Vancouver and calculates two metrics no other public tool tracks:

- **Store Premium Score** — how much each store charges above or below the Statistics Canada BC provincial baseline
- **Poverty Penalty** — the extra dollars low-income families pay per bi-weekly basket *just because* they cannot afford to buy in bulk

**GLOCAL Foundation of Canada · Task T01207 · Pilot data: April–May 2026**

---

## What's in this repo

The dashboard reads sentinel_prices_master.csv at runtime using fetch() + PapaParse. No data is hardcoded in the HTML. To update the dashboard, replace or edit the CSV — no code changes needed.

## Project background

- 7 culturally specific baskets: South Asian, Chinese, Filipino, Korean, European, Indigenous, Others
- 10 stores across Vancouver, Burnaby, Surrey, Richmond, Coquitlam, Langley
- 1,308 price data points collected April-May 2026
- 2 package sizes (small + bulk) per product to calculate the poverty penalty

Contact: Kritubvna Sharma, GLOCAL Foundation of Canada, Task T01207
Email: kritubvnabhattarai10@gmail.com
