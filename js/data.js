/**
 * Data loading, normalization, and merging for NH tax map.
 */

const YEARS = [2022, 2023, 2024, 2025];

// Cache geo data and all-years rates since they don't change
let geoCache = null;
let countyCache = null;
let waterCache = null;
let allRatesCache = null;
let taxByYear = null;

async function ensureCaches() {
  if (geoCache) return;

  const [geoData, countyData, waterData, ...taxDataSets] = await Promise.all([
    fetch("data/nh_towns.geojson").then(r => r.json()),
    fetch("data/nh_counties.geojson").then(r => r.json()),
    fetch("data/nh_water.geojson").then(r => r.json()),
    ...YEARS.map(y => fetch(`data/tax_rates_${y}.json`).then(r => r.json())),
  ]);

  geoCache = geoData;
  countyCache = countyData;
  waterCache = waterData;

  taxByYear = Object.create(null);
  const allRates = [];
  for (let i = 0; i < YEARS.length; i++) {
    taxByYear[YEARS[i]] = taxDataSets[i];
    for (const r of taxDataSets[i]) {
      allRates.push(r.TotalRate);
    }
  }
  allRatesCache = allRates;
}

export async function loadData(year = "2025") {
  await ensureCaches();
  return {
    taxmap: mergeData(geoCache, taxByYear[year]),
    counties: countyCache,
    water: waterCache,
    allRates: allRatesCache,
  };
}

function mergeData(geoData, taxRates) {
  const index = Object.create(null);
  for (const row of taxRates) {
    index[row.Municipality] = row;
  }

  const merged = structuredClone(geoData);
  for (const f of merged.features) {
    f.data = index[f.properties.pbpNAME] || { TotalRate: 0 };
  }
  return merged;
}
