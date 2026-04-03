/**
 * Tooltip for NH tax map — shows tax rate breakdown on hover.
 */
import * as d3 from "d3";

const fmt = v => v != null ? `$${v.toFixed(2)}` : "—";

function showTooltip(tooltip, d) {
  const data = d.data || {};
  const county = d.properties.PB_TOWN_Census_2010_StatsCOUNTYNAME;
  tooltip.innerHTML = `
    <div class="tooltip-header">
      <div class="town-name">${d.properties.pbpNAME}</div>
      ${county ? `<div class="county-name">${county} County</div>` : ""}
    </div>
    <table class="rate-table">
      <tr><td>Municipal</td><td>${fmt(data.Municipal)}</td></tr>
      <tr><td>County</td><td>${fmt(data.County)}</td></tr>
      <tr><td>State Ed</td><td>${fmt(data.StateEd)}</td></tr>
      <tr><td>Local Ed</td><td>${fmt(data.LocalEd)}</td></tr>
      <tr class="total"><td>Total</td><td>${fmt(data.TotalRate)}</td></tr>
    </table>
  `;
  tooltip.classList.add("visible");
}

function moveTooltip(tooltip, event) {
  tooltip.style.left = (event.pageX + 12) + "px";
  tooltip.style.top = (event.pageY - 10) + "px";
}

function hideTooltip(tooltip) {
  tooltip.classList.remove("visible");
}

export function setupTooltip(svgElement, pathSelection, taxmap) {
  const tooltip = document.getElementById("tooltip");
  const svg = d3.select(svgElement);

  // Build index from town name to feature data for label lookups
  const featureIndex = new Map();
  for (const f of taxmap.features) {
    featureIndex.set(f.properties.pbpNAME, f);
  }

  // Build index from town name to path element, and county to list of path elements
  const pathIndex = new Map();
  const countyPaths = new Map();
  pathSelection.each(function (d) {
    const name = d.properties.pbpNAME;
    const county = d.properties.pbpCOUNTY;
    pathIndex.set(name, this);
    if (county) {
      if (!countyPaths.has(county)) countyPaths.set(county, []);
      countyPaths.get(county).push(this);
    }
  });

  function getCounty(name) {
    const f = featureIndex.get(name);
    return f && f.properties.pbpCOUNTY;
  }

  function highlight(name) {
    const county = getCounty(name);
    pathSelection.each(function (d) {
      const sel = d3.select(this);
      if (d.properties.pbpCOUNTY === county) {
        sel.attr("opacity", 1).attr("stroke", "#333").attr("stroke-width", 1.5);
      } else {
        sel.attr("opacity", 0.2);
      }
    });
    // Raise and emphasize the hovered town on top
    const pathEl = pathIndex.get(name);
    if (pathEl) d3.select(pathEl).raise().attr("stroke-width", 2.5);
  }

  function unhighlight() {
    pathSelection.attr("stroke-width", 0.5).attr("stroke", "#000").attr("opacity", 1);
  }

  // Tooltips on town area paths
  pathSelection
    .on("mouseenter", (event, d) => {
      showTooltip(tooltip, d);
      highlight(d.properties.pbpNAME);
    })
    .on("mousemove", (event) => moveTooltip(tooltip, event))
    .on("mouseleave", () => {
      hideTooltip(tooltip);
      unhighlight();
    });

  // Tooltips on text labels — look up the feature by data-town attribute
  svg.selectAll("#labels text")
    .on("mouseenter", function (event) {
      const name = this.getAttribute("data-town");
      const d = featureIndex.get(name);
      if (d) {
        showTooltip(tooltip, d);
        highlight(name);
      }
    })
    .on("mousemove", (event) => moveTooltip(tooltip, event))
    .on("mouseleave", function () {
      hideTooltip(tooltip);
      unhighlight();
    });
}
