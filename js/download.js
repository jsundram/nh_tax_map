/**
 * SVG and PNG download functionality.
 */

function inlineStyles(svgElement) {
  // Clone the SVG so we don't modify the live one
  const clone = svgElement.cloneNode(true);

  // Ensure xmlns is set
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  return clone;
}

function svgToBlob(svgElement) {
  const clone = inlineStyles(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  return new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getYear(svgElement) {
  return svgElement.dataset.year || "";
}

export function downloadSVG(svgElement) {
  const blob = svgToBlob(svgElement);
  triggerDownload(blob, `nh-tax-map-${getYear(svgElement)}.svg`);
}

export function downloadPNG(svgElement) {
  const clone = inlineStyles(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

  const scale = 2; // Retina quality
  const width = svgElement.getAttribute("width") || svgElement.viewBox.baseVal.width;
  const height = svgElement.getAttribute("height") || svgElement.viewBox.baseVal.height;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      triggerDownload(blob, `nh-tax-map-${getYear(svgElement)}.png`);
    }, "image/png");
  };
  img.src = svgDataUrl;
}

export function setupDownloadButtons(svgElement) {
  const svgBtn = document.getElementById("download-svg");
  const pngBtn = document.getElementById("download-png");

  // Replace buttons to remove old listeners
  const newSvgBtn = svgBtn.cloneNode(true);
  const newPngBtn = pngBtn.cloneNode(true);
  svgBtn.replaceWith(newSvgBtn);
  pngBtn.replaceWith(newPngBtn);

  newSvgBtn.addEventListener("click", () => downloadSVG(svgElement));
  newPngBtn.addEventListener("click", () => downloadPNG(svgElement));
}
