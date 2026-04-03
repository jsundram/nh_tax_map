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

## How it works

### Architecture

The site is a single-page application with no build step. ES modules load D3.js from a CDN via an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap), so there are no bundlers, transpilers, or `node_modules` involved.

**Data flow:**

1. On page load, `data.js` fetches all data files in parallel: the town boundary GeoJSON, county boundaries, water bodies, and tax rate JSON for every available year. GeoJSON files are cached since they don't change between years.
2. Tax rate records are merged into the GeoJSON features by matching municipality names. A normalization layer handles name discrepancies between data sources (e.g., "Erving's Grant (U)" → "Ervings Location").
3. `map.js` takes the merged GeoJSON and renders the SVG: projecting coordinates with `d3.geoIdentity().reflectY(true).fitExtent(...)`, drawing town polygons, county boundaries, water bodies, and computing label placements.
4. `tooltip.js` wires up mouse events on both town paths and text labels, with a lookup index from town names to features and path elements for county highlighting.
5. When the user changes the year, only the tax rate JSON is swapped. The GeoJSON is re-merged with the new rates via `structuredClone` and the SVG is re-rendered.

**Dependencies:** The only runtime dependency is [D3.js v7](https://d3js.org/), loaded as an ES module from CDN. Python scripts use [uv](https://docs.astral.sh/uv/) with inline script metadata for dependency management (openpyxl, geopandas, shapely) — no virtual environments or requirements files needed.

### Label placement algorithm

Fitting readable labels inside irregularly-shaped polygons is a hard problem. Common approaches like centroid placement or the [pole of inaccessibility](https://github.com/mapbox/polylabel) find a single "best point," but don't account for the shape of the text — a long town name needs horizontal space, not just distance from edges. This project uses a custom algorithm that directly optimizes for the largest font size that fits.

The algorithm works in four stages:

**Stage 1: Line-split variants.** For multi-word names, the algorithm generates all possible line-break variants. "Second College" can be rendered as one line or split into "Second" / "College". Each variant produces an array of measured text widths (at a reference font size) using SVG `getComputedTextLength()`. All variants are tried and the one achieving the largest font size wins.

**Stage 2: Position search.** For each variant, `findBestPlacement()` scans 30 evenly-spaced horizontal scanlines across the polygon's vertical extent. At each y-coordinate, it computes ray-casting intersections with the polygon boundary to find horizontal segments that are inside the polygon. For each segment, it centers the text horizontally and runs a font-size fit test. The position achieving the largest font size wins, with ties broken by distance to the polygon's centroid (preferring more centered labels).

**Stage 3: Font size binary search.** At each candidate position, `fitFontSize()` uses binary search (converging to 0.25px precision) to find the largest font size where the text block fits. The fit test (`textFitsInPolygon()`) checks whether the full text bounding box — accounting for per-line widths and line height — is contained within the polygon. It does this by sampling three vertical positions per line (at 10%, 50%, and 90% of line height) and verifying via ray-casting that the horizontal span of each line falls within a single interior segment of the polygon at each sample point.

**Stage 4: Rotation search.** If the horizontal placement didn't reach the maximum font size, the algorithm tries rotations in 10° steps from -40° to +40°. For each angle, it rotates the polygon (not the text), runs the full position+font-size search on the rotated polygon, then maps the result back to the original coordinate space. A rotation is only accepted if it improves the font size by more than 0.5px (to avoid unnecessary rotation when horizontal is nearly as good). If a rotation helps, ±5° refinement is tried around the best angle.

The net effect: labels are as large as possible, centered when there's room, rotated only when it meaningfully helps, and split across lines when that allows a larger font size. Labels that can't fit at the minimum font size (4px) are omitted — these are genuinely tiny polygons where zoom-and-hover is the better UX.

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
