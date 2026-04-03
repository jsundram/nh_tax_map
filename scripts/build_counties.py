# /// script
# requires-python = ">=3.10"
# dependencies = ["shapely"]
# ///
"""
Derive county boundary lines from town polygons.
Instead of merging towns per county (which creates artifacts around water bodies),
we extract shared edges between towns in different counties.
"""
import json
from pathlib import Path

from shapely.geometry import shape, mapping, MultiLineString
from shapely.ops import linemerge, unary_union


def main():
    data_dir = Path(__file__).parent.parent / "data"
    with open(data_dir / "nh_towns.geojson") as f:
        towns = json.load(f)

    features = towns["features"]
    n = len(features)

    # Fix invalid geometries and extract shapes + county codes
    geoms = []
    counties = []
    for feat in features:
        g = shape(feat["geometry"])
        if not g.is_valid:
            g = g.buffer(0)
        geoms.append(g)
        counties.append(feat["properties"]["pbpCOUNTY"])

    # Find shared edges between towns in different counties
    boundary_lines = []
    for i in range(n):
        for j in range(i + 1, n):
            if counties[i] == counties[j]:
                continue
            intersection = geoms[i].intersection(geoms[j])
            if intersection.is_empty:
                continue
            # Only keep linear intersections (shared edges), not point touches
            if intersection.geom_type in ("LineString", "MultiLineString"):
                boundary_lines.append(intersection)
            elif intersection.geom_type == "GeometryCollection":
                for part in intersection.geoms:
                    if part.geom_type in ("LineString", "MultiLineString"):
                        boundary_lines.append(part)

    # Merge all boundary segments into a single geometry.
    # Snap to a small grid first to eliminate floating-point precision artifacts
    # from the intersection computation.
    from shapely import set_precision
    snapped = [set_precision(line, 1e-6) for line in boundary_lines]
    merged = linemerge(unary_union(snapped))

    out = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {"type": "county-boundary"},
            "geometry": mapping(merged),
        }],
    }

    outpath = data_dir / "nh_counties.geojson"
    with open(outpath, "w") as f:
        json.dump(out, f)
    print(f"Wrote county boundaries to {outpath}")
    print(f"Size: {outpath.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
