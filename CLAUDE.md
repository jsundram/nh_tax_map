# CLAUDE.md

## Project overview

Interactive choropleth map of NH property tax rates (2022-2025) built with D3.js. Static site, no build step. Served via GitHub Pages at https://jsundram.github.io/nh_tax_map/

## Key conventions

- **Python**: Always use `uv run` for scripts (they have inline script metadata with dependencies). Never use bare `python3` or `pip install`.
- **No build step**: ES modules loaded via import map from CDN. No bundler, no node_modules.
- **Data flow**: xlsx files → `scripts/convert_xlsx.py` → JSON → fetched by browser → merged into GeoJSON → rendered as SVG.

## Architecture notes

- The label placement algorithm in `js/map.js` is the most complex part of the codebase. It searches over positions, font sizes, rotations, and line-split variants to maximize label size within each polygon. Changes here need visual verification.
- County boundaries are derived from town polygon shared edges (not a separate shapefile) to ensure alignment. See `scripts/build_counties.py`.
- Water bodies mask county lines through lakes. They have `pointer-events: none` so tooltips work through them.
- The color scale uses `scaleSequentialQuantile` with all years' rates pooled together for stable colors across years.
- Zoom controls overlay the map; they must be preserved across re-renders (the swap logic in `renderMap` keeps elements with an `id`).

## Adding a new year of data

1. Download xlsx from NH DRA, place in `data/`
2. Update `YEAR_FILES` and `YEAR_CONFIG` in `scripts/convert_xlsx.py` (column layout has changed between years)
3. Run `uv run scripts/convert_xlsx.py`
4. Add `<option>` in `index.html` year selector
5. Add year to `YEARS` array in `js/data.js`
