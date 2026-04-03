# NH Property Tax Map

An interactive choropleth map of New Hampshire property tax rates by municipality, built with [D3.js](https://d3js.org/).

**[View the live map](https://jsundram.github.io/nh_tax_map/)**

Originally developed as an [Observable notebook](https://observablehq.com/d/07351787e2402746), now a standalone static site.

## Features

- Choropleth visualization of total property tax rates across all 259 NH municipalities
- Year selector (2022–2025)
- Hover tooltips with full tax rate breakdown (Municipal, County, State Ed, Local Ed)
- County highlighting on hover
- County boundary and water body overlays
- Smart label placement: labels are sized, rotated, and split across lines to fit inside each polygon
- Zoom and pan for exploring small municipalities
- Download as SVG or PNG
- Adaptive label colors for readability on dark backgrounds

## Running locally

No build step required. Serve the files over HTTP (ES modules require it):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploying to GitHub Pages

Push to a GitHub repository, then enable Pages in Settings (source: main branch, root directory). The site works as-is with no build step.

## Updating tax data

Tax rate xlsx files are published annually by the [NH Department of Revenue Administration](https://www.revenue.nh.gov/about-dra/municipal-and-property-division/municipal-and-property-reports/municipal-and-village).

To add a new year:

1. Download the xlsx file and place it in `data/`
2. Add the year to `YEAR_FILES` and `YEAR_CONFIG` in `scripts/convert_xlsx.py` (check the sheet name and column layout — these have changed between years)
3. Run the converter:
   ```bash
   uv run scripts/convert_xlsx.py
   ```
   This generates `data/tax_rates_YYYY.json` for each year and sets `data/tax_rates.json` to the latest.
4. Add the new year as an `<option>` in the year selector in `index.html`
5. Add the year to the `YEARS` array in `js/data.js`

## Rebuilding derived data

The county boundary and water body GeoJSON files are derived from other sources. You only need to rebuild them if the underlying town boundaries change.

**County boundaries** (derived from shared edges between town polygons):
```bash
uv run scripts/build_counties.py
```

**Water bodies** (downloaded from Census TIGER/Line, filtered by area):
```bash
uv run scripts/build_water.py
```

## Project structure

```
index.html              Single-page app
css/style.css           Layout, tooltips, buttons
js/
  main.js               Entry point: load data, render, wire up controls
  data.js               Data loading, caching, GeoJSON/tax data merge
  map.js                SVG rendering: projection, paths, labels, zoom
  legend.js             Color legend (ported from @d3/color-legend, ISC)
  tooltip.js            Hover tooltips and county highlighting
  download.js           SVG and PNG export
data/
  nh_towns.geojson      NH municipal boundaries (NH GRANIT)
  nh_counties.geojson   County boundary lines (derived from town polygons)
  nh_water.geojson      Water bodies (Census TIGER/Line)
  tax_rates_YYYY.json   Per-year tax rate data (converted from xlsx)
  *.xlsx                Source xlsx files from NH DRA
scripts/
  convert_xlsx.py       Convert NH DRA xlsx files to JSON
  build_counties.py     Derive county boundaries from town polygons
  build_water.py        Download and filter water body polygons
```

## Data sources

- **Town boundaries**: [NH GRANIT](https://granit.unh.edu/) — Political Boundaries
- **Tax rates**: [NH Department of Revenue Administration](https://www.revenue.nh.gov/about-dra/municipal-and-property-division/municipal-and-property-reports/municipal-and-village) (2022–2025)
- **Water bodies**: [US Census Bureau TIGER/Line](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html) — Area Water shapefiles

## License

Tax rate data is public record. Town boundary data is from NH GRANIT (public domain). The color legend is ported from [@d3/color-legend](https://observablehq.com/@d3/color-legend) under the ISC license.
