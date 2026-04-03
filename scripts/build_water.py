# /// script
# requires-python = ">=3.10"
# dependencies = ["geopandas", "requests"]
# ///
"""
Download NH water body polygons from Census TIGER/Line and combine into
a single GeoJSON file, filtered to significant water bodies.
"""
import io
import json
import zipfile
from pathlib import Path

import geopandas as gpd
import requests

# NH county FIPS codes
NH_COUNTIES = [
    "33001", "33003", "33005", "33007", "33009",
    "33011", "33013", "33015", "33017", "33019",
]

# Minimum area in square degrees (~0.0001 ≈ a small pond, 0.001 ≈ a decent lake)
MIN_AREA = 0.00005


def download_county_water(fips):
    """Download area water shapefile for a county from Census TIGER."""
    url = f"https://www2.census.gov/geo/tiger/TIGER2022/AREAWATER/tl_2022_{fips}_areawater.zip"
    print(f"  Downloading {fips}...")
    resp = requests.get(url)
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        return gpd.read_file(io.BytesIO(resp.content))


def main():
    data_dir = Path(__file__).parent.parent / "data"

    print("Downloading NH water bodies from Census TIGER...")
    frames = []
    for fips in NH_COUNTIES:
        gdf = download_county_water(fips)
        # Filter to significant water bodies by area
        gdf = gdf[gdf.geometry.area >= MIN_AREA]
        if len(gdf) > 0:
            frames.append(gdf)
        print(f"    {fips}: {len(gdf)} features kept")

    combined = gpd.pd.concat(frames, ignore_index=True)
    # Keep only geometry (drop TIGER metadata columns to reduce file size)
    combined = combined[["FULLNAME", "geometry"]]
    # Convert to WGS84 if not already
    combined = combined.to_crs("EPSG:4326")

    outpath = data_dir / "nh_water.geojson"
    combined.to_file(outpath, driver="GeoJSON")
    print(f"\nWrote {len(combined)} water features to {outpath}")
    print(f"Size: {outpath.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
