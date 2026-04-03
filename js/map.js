/**
 * SVG choropleth map rendering for NH property tax rates.
 */
import * as d3 from "d3";
import { Legend } from "./legend.js";
import { setupTooltip } from "./tooltip.js";

const MAX_FONT_SIZE = 14;
const MIN_FONT_SIZE = 4;
const FONT_FAMILY = "Gill Sans, Arial, Helvetica, sans-serif";

/**
 * Find all intersection x-coordinates of a horizontal line at y with the polygon ring.
 */
function horizontalIntersections(ring, y) {
  const xs = [];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][1], yj = ring[j][1];
    if ((yi <= y && yj > y) || (yj <= y && yi > y)) {
      xs.push(ring[i][0] + (y - yi) / (yj - yi) * (ring[j][0] - ring[i][0]));
    }
  }
  return xs.sort((a, b) => a - b);
}

/**
 * Check if a text block centered at (cx, cy) fits inside the polygon.
 * halfWidths: array of half-widths per line (from center).
 * lineHeight: height per line. Lines are stacked vertically, centered at cy.
 */
function textFitsInPolygon(ring, cx, cy, halfWidths, lineHeight) {
  const numLines = halfWidths.length;
  const totalH = numLines * lineHeight;
  const topY = cy - totalH / 2;

  // For each line, sample at top, middle, and bottom of that line
  for (let line = 0; line < numLines; line++) {
    const halfW = halfWidths[line];
    const lineTop = topY + line * lineHeight;
    for (const frac of [0.1, 0.5, 0.9]) {
      const y = lineTop + frac * lineHeight;
      const xs = horizontalIntersections(ring, y);
      let fits = false;
      for (let i = 0; i < xs.length - 1; i += 2) {
        if (xs[i] <= cx - halfW && xs[i + 1] >= cx + halfW) {
          fits = true;
          break;
        }
      }
      if (!fits) return false;
    }
  }
  return true;
}

/**
 * Find the largest font size where text fits at (cx, cy).
 * lineLensAtRef: array of text lengths at refSize, one per line.
 */
function fitFontSize(ring, cx, cy, lineLensAtRef, refSize) {
  let lo = MIN_FONT_SIZE, hi = MAX_FONT_SIZE;
  let best = 0;
  while (hi - lo > 0.25) {
    const mid = (lo + hi) / 2;
    const scale = mid / refSize;
    const halfWidths = lineLensAtRef.map(len => (len * scale) / 2);
    const lineHeight = mid * 1.2;
    if (textFitsInPolygon(ring, cx, cy, halfWidths, lineHeight)) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

/**
 * Precompute horizontal segments at evenly-spaced y-values across the ring.
 * Returns { yMin, yMax, step, rows } where rows[i] is the sorted intersection
 * array at yMin + (i+1)*step.
 */
function precomputeRows(ring, steps) {
  let yMin = Infinity, yMax = -Infinity;
  for (const pt of ring) {
    if (pt[1] < yMin) yMin = pt[1];
    if (pt[1] > yMax) yMax = pt[1];
  }
  const step = (yMax - yMin) / (steps + 1);
  const rows = [];
  for (let s = 1; s <= steps; s++) {
    rows.push(horizontalIntersections(ring, yMin + s * step));
  }
  return { yMin, yMax, step, rows };
}

/**
 * Search for the best (x, y, fontSize) in a given ring (already rotated if needed).
 * lineLensAtRef: array of text lengths at refSize (one per line).
 */
function findBestPlacement(ring, lineLensAtRef, refSize, centX, centY) {
  const { yMin, step, rows } = precomputeRows(ring, 30);
  const maxLineLen = Math.max(...lineLensAtRef);

  let bestFs = 0, bestX = 0, bestY = 0, bestDist = Infinity;

  for (let s = 0; s < rows.length; s++) {
    const y = yMin + (s + 1) * step;
    const xs = rows[s];

    for (let i = 0; i < xs.length - 1; i += 2) {
      const segW = xs[i + 1] - xs[i];
      const maxPossible = Math.min(segW * refSize / maxLineLen, MAX_FONT_SIZE);
      if (maxPossible < bestFs) continue;

      const cx = (xs[i] + xs[i + 1]) / 2;
      const fs = fitFontSize(ring, cx, y, lineLensAtRef, refSize);
      const dist = Math.hypot(cx - centX, y - centY);

      if (fs > bestFs || (fs === bestFs && dist < bestDist)) {
        bestFs = fs;
        bestX = cx;
        bestY = y;
        bestDist = dist;
      }
    }
  }

  return { x: bestX, y: bestY, fontSize: bestFs };
}

/**
 * Rotate a ring around (cx, cy) by angle in radians.
 */
function rotateRing(ring, cx, cy, rad) {
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return ring.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
}

/**
 * Search across positions AND rotations to find the placement that maximizes
 * label font size. Prefers horizontal; only rotates if significantly better.
 */
function findBestPlacementWithRotation(ring, lineLensAtRef, refSize) {
  let cx = 0, cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  cx /= ring.length;
  cy /= ring.length;

  // Always try horizontal first
  const horizontal = findBestPlacement(ring, lineLensAtRef, refSize, cx, cy);
  if (horizontal.fontSize >= MAX_FONT_SIZE) {
    return { ...horizontal, angle: 0 };
  }

  let best = { ...horizontal, angle: 0 };

  // Try rotations in 10° steps, only if horizontal didn't max out
  for (let angle = -40; angle <= 40; angle += 10) {
    if (angle === 0) continue;
    const rad = angle * Math.PI / 180;
    const rotated = rotateRing(ring, cx, cy, -rad);
    const result = findBestPlacement(rotated, lineLensAtRef, refSize, cx, cy);

    if (result.fontSize > best.fontSize + 0.5) {
      const dx = result.x - cx, dy = result.y - cy;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      best = {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
        fontSize: result.fontSize,
        angle,
      };
      if (best.fontSize >= MAX_FONT_SIZE) return best;
    }
  }

  // If we found a good rotation, refine ±5° around it
  if (best.angle !== 0) {
    for (const delta of [-5, 5]) {
      const angle = best.angle + delta;
      if (angle === 0 || Math.abs(angle) > 45) continue;
      const rad = angle * Math.PI / 180;
      const rotated = rotateRing(ring, cx, cy, -rad);
      const result = findBestPlacement(rotated, lineLensAtRef, refSize, cx, cy);

      if (result.fontSize > best.fontSize) {
        const dx = result.x - cx, dy = result.y - cy;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        best = {
          x: cx + dx * cos - dy * sin,
          y: cy + dx * sin + dy * cos,
          fontSize: result.fontSize,
          angle,
        };
      }
    }
  }

  return best;
}

export function renderMap(container, taxmap, counties, water, allRates, year) {
  const containerWidth = container.clientWidth || 600;
  const mapWidth = containerWidth;
  const mapHeight = 1.5 * mapWidth;

  const headerHeight = 75;

  const projection = d3.geoIdentity()
    .reflectY(true)
    .fitExtent([[20, headerHeight], [mapWidth - 20, mapHeight - 20]], taxmap);

  const pathGenerator = d3.geoPath(projection);

  const svg = d3.create("svg")
    .attr("title", "NH Property Tax Map")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("background-color", "#ffffff")
    .style("overflow", "hidden");

  // Color scale — quantiles computed from all years for stable colors
  const clr = d3.scaleSequentialQuantile(d3.interpolateGreens)
    .domain(allRates);

  // Clip path so zoomed content stays within the SVG bounds
  svg.append("defs").append("clipPath").attr("id", "map-clip")
    .append("rect")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  // Clipped wrapper (stays fixed), with zoomable group inside
  const clipGroup = svg.append("g")
    .attr("clip-path", "url(#map-clip)");
  const mapGroup = clipGroup.append("g").attr("id", "map-group");

  // Legend
  const legend = Legend(clr, {
    title: "Tax Rate ($)",
    tickFormat: "$.02f",
    tickValues: [0, 15, 20, 25, 40],
  });

  const overlay = svg.append("g").attr("id", "overlay");

  // White header background so zoomed map content doesn't show behind legend/year
  overlay.append("rect")
    .attr("width", mapWidth)
    .attr("height", headerHeight)
    .attr("fill", "#ffffff");

  const legendGroup = overlay.append("g")
    .attr("transform", "translate(20, 20)");
  legendGroup.append(() => legend);

  // "No rate" swatch to the right of the legend
  const legendW = +(legend.getAttribute("width") || 320);
  const legendH = +(legend.getAttribute("height") || 50);
  const swatchX = legendW + 12;
  const barTop = legendH - 16 - 6 - 10;
  legendGroup.append("rect")
    .attr("x", swatchX).attr("y", barTop)
    .attr("width", 12).attr("height", 10)
    .attr("fill", "#ddd").attr("stroke", "#999");
  legendGroup.append("text")
    .attr("x", swatchX + 16).attr("y", barTop + 9)
    .attr("font-size", "10px")
    .attr("font-family", FONT_FAMILY)
    .attr("fill", "currentColor")
    .text("No rate");

  // Town areas
  const areas = mapGroup.append("g").attr("id", "areas");
  const paths = areas.selectAll("path")
    .data(taxmap.features)
    .join("path")
    .attr("d", pathGenerator)
    .attr("fill", f => f.data.TotalRate > 0 ? clr(f.data.TotalRate) : "#ddd")
    .attr("stroke", "#000000")
    .attr("stroke-width", 0.5);

  // County lines
  if (counties && counties.features.length > 0) {
    mapGroup.append("g").attr("id", "counties")
      .selectAll("path")
      .data(counties.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);
  }

  // Water bodies — rendered on top of county lines to hide lines through lakes
  if (water && water.features.length > 0) {
    mapGroup.append("g").attr("id", "water")
      .selectAll("path")
      .data(water.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", "#b3d9f2")
      .attr("stroke", "#89bdd3")
      .attr("stroke-width", 0.3)
      .attr("pointer-events", "none");
  }

  // Labels
  const taxArea = taxmap.features.filter(f => f.data.Municipality);

  // Replace contents without collapsing — swap in the SVG, then remove old children
  const svgNode = svg.node();
  container.appendChild(svgNode);
  for (const child of [...container.childNodes]) {
    if (child !== svgNode) child.remove();
  }

  const labelsGroup = mapGroup.append("g").attr("id", "labels");
  const REF_SIZE = 10;

  // Hidden text element for measuring line widths
  const measurer = labelsGroup.append("text")
    .attr("font-family", FONT_FAMILY)
    .attr("font-size", REF_SIZE + "px")
    .attr("visibility", "hidden");

  function measureText(str) {
    measurer.text(str);
    return measurer.node().getComputedTextLength();
  }

  /**
   * Generate candidate line-split variants for a name.
   * Returns array of { lines: string[], lineLens: number[] }.
   */
  function labelVariants(name) {
    const singleLen = measureText(name);
    const variants = [{ lines: [name], lineLens: [singleLen] }];

    const words = name.split(" ");
    if (words.length >= 2) {
      // Try each split point
      for (let i = 1; i < words.length; i++) {
        const line1 = words.slice(0, i).join(" ");
        const line2 = words.slice(i).join(" ");
        variants.push({
          lines: [line1, line2],
          lineLens: [measureText(line1), measureText(line2)],
        });
      }
    }
    return variants;
  }

  for (const f of taxArea) {
    const rings = f.geometry.type === "MultiPolygon"
      ? f.geometry.coordinates.reduce((a, b) => a[0].length > b[0].length ? a : b)
      : f.geometry.coordinates;

    const projectedRing = rings[0].map(pt => projection(pt));
    const name = f.properties.pbpNAME;

    // Try all line-split variants, pick the one with largest font size
    let bestResult = null;
    let bestVariant = null;

    for (const variant of labelVariants(name)) {
      const result = findBestPlacementWithRotation(
        projectedRing, variant.lineLens, REF_SIZE
      );
      if (!bestResult || result.fontSize > bestResult.fontSize) {
        bestResult = result;
        bestVariant = variant;
      }
    }

    const { x, y, fontSize, angle } = bestResult;

    if (fontSize < MIN_FONT_SIZE) continue;

    // Pick label color based on background luminance
    const bg = d3.color(f.data.TotalRate > 0 ? clr(f.data.TotalRate) : "#ddd");
    const lum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
    const textColor = lum < 140 ? "#f0f0f0" : "#1a1a1a";

    const label = labelsGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("font-family", FONT_FAMILY)
      .attr("font-size", fontSize + "px")
      .attr("data-town", name)
      .attr("x", x)
      .attr("y", y);

    if (bestVariant.lines.length === 1) {
      label.attr("dominant-baseline", "central").text(bestVariant.lines[0]);
    } else {
      // Multi-line: use tspan elements
      const lineH = fontSize * 1.2;
      const topOffset = -((bestVariant.lines.length - 1) * lineH) / 2;
      bestVariant.lines.forEach((line, i) => {
        label.append("tspan")
          .attr("x", x)
          .attr("dy", i === 0 ? topOffset : lineH)
          .attr("dominant-baseline", "central")
          .text(line);
      });
    }

    if (angle !== 0) {
      label.attr("transform", `rotate(${angle}, ${x}, ${y})`);
    }
  }

  measurer.remove();

  // Year label (fixed overlay)
  overlay.append("text")
    .attr("x", mapWidth - 20)
    .attr("y", 35)
    .attr("text-anchor", "end")
    .attr("font-family", FONT_FAMILY)
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "#666")
    .text(year);

  // Zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([1, 12])
    .translateExtent([[0, 0], [mapWidth, mapHeight]])
    .on("zoom", ({ transform }) => {
      mapGroup.attr("transform", transform);
      // Keep stroke widths constant regardless of zoom
      paths.attr("stroke-width", 0.5 / transform.k);
      svg.selectAll("#counties path").attr("stroke-width", 1.5 / transform.k);
      svg.selectAll("#water path").attr("stroke-width", 0.3 / transform.k);
    });

  svg.call(zoom);

  // Expose reset function on the SVG node for the reset button
  const node = svg.node();
  node.resetZoom = () => svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);

  // Tooltips (on both paths and labels)
  setupTooltip(node, paths, taxmap);

  node.dataset.year = year;
  return node;
}
