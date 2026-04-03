/**
 * Entry point for NH Property Tax Map.
 */
import { loadData } from "./data.js";
import { renderMap } from "./map.js";
import { setupDownloadButtons } from "./download.js";

async function main() {
  const container = document.getElementById("map-container");
  const yearSelect = document.getElementById("year-select");

  let currentYear = yearSelect.value;

  let svgElement;

  async function render() {
    const { taxmap, counties, water, allRates } = await loadData(currentYear);
    svgElement = renderMap(container, taxmap, counties, water, allRates, currentYear);
    setupDownloadButtons(svgElement);
  }

  await render();

  // Year selector
  yearSelect.addEventListener("change", async () => {
    currentYear = yearSelect.value;
    await render();
  });

  // Zoom controls
  document.getElementById("zoom-in").addEventListener("click", () => {
    if (svgElement && svgElement.zoomIn) svgElement.zoomIn();
  });
  document.getElementById("zoom-out").addEventListener("click", () => {
    if (svgElement && svgElement.zoomOut) svgElement.zoomOut();
  });
  document.getElementById("reset-zoom").addEventListener("click", () => {
    if (svgElement && svgElement.resetZoom) svgElement.resetZoom();
  });

  // Debounced resize handler
  let resizeTimer;
  const observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(), 200);
  });
  observer.observe(container);
}

main();
