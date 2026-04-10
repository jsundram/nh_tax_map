# NH Municipality-Level Datasets

Potential datasets for per-town choropleth visualizations using the existing NH town boundary map.

## High priority

These are available in spreadsheet formats with per-municipality granularity and pair well with tax rate data.

### Tax rate components (already available)

The existing tax rate xlsx files contain Municipal, County, State Education, and Local Education breakdowns. Visualizing each component separately would show where education spending dominates vs. where municipal costs are the driver.

- Already parsed by `scripts/convert_xlsx.py`
- [NH DRA Municipal Tax Rates](https://www.revenue.nh.gov/about-dra/municipal-and-property-division/municipal-and-property-reports/municipal-and-village)

### Population estimates

Annual population estimates for every NH city and town, compiled since 1968. Enables per-capita tax burden, population density, and growth trend maps.

- [NH Economy — Population Estimates](https://www.nheconomy.com/office-of-planning-and-development/what-we-do/state-data-center-(census-data)/population-estimates)
- 2024 CSV: https://www.nheconomy.com/getmedia/d805bb47-7a5b-4e43-907b-d2743e9c7fd9/
- 2023 CSV: https://www.nheconomy.com/getmedia/45eda3fd-69b4-4681-a060-946952aea768/
- 2022 XLSX: https://www.nheconomy.com/getmedia/5e16c233-44e5-40f1-a220-d3d0f93af8e7/

**Combinations**: total tax commitment ÷ population = per-capita tax burden; population ÷ land area = density.

### Median household income

Census ACS table B19013 at the county subdivision level. Tax rate as a percentage of median income is the most honest measure of tax burden.

- [Census data.census.gov](https://data.census.gov/) — search table B19013 with NH subdivisions geography
- [NH DES compiled table (PDF)](https://www.des.nh.gov/sites/g/files/ehbemt341/files/documents/2020-01/mhi-table.pdf)
- [Wikipedia — NH communities by household income](https://en.wikipedia.org/wiki/New_Hampshire_communities_by_household_income)

**Combinations**: tax rate × median home value = estimated annual tax bill; tax rate ÷ median income = effective burden.

### Equalized Valuation Per Pupil (EVPP)

Each town's total equalized property value divided by number of public school students. The key metric in NH's education funding formula — property-rich towns with few students have high EVPP and pay more state education tax.

- [Fair Funding NH — EVPP by Town](https://fairfundingnh.org/evpp-town-2023/)
- Downloadable as `2023-EVPP-by-Town.xlsx`

**Combinations**: EVPP vs. state ed rate reveals the funding formula mechanics directly.

### Residential building permits

Number of residential building permits issued per town, annually. Indicates growth patterns and development pressure.

- [NH Economy — Housing Data](https://www.nheconomy.com/office-of-planning-and-development/what-we-do/state-data-center-(census-data)/housing-data)
- [2020–2025 CSV](https://www.nheconomy.com/getmedia/10c857cf-d7df-44e2-b7c2-8ad38c515a4a/hse2020-2025-Analysis-Share_1.csv)

**Combinations**: growth rate vs. tax rate change over time.

### Voter turnout / election results

Ballots cast and names on checklist by town for every election.

- [NH Secretary of State — 2024 General Election](https://www.sos.nh.gov/2024-general-election-results) (XLSX)
- [NHPR Election Database](https://electiondatabase.nhpr.org/)
- [NH Election Stats](https://nh.electionstats.com/)

**Combinations**: turnout rate vs. tax rate; partisan lean vs. spending levels.


## Medium priority

Interesting but may require PDF scraping, data cleaning, or have a less direct relationship to tax rates.

### Equalization ratios

Measures how current each town's assessments are relative to market value. A ratio below 100% means assessments lag behind market prices, requiring a higher nominal tax rate to raise the same revenue.

- [NH DRA — Equalization Reports](https://www.revenue.nh.gov/about-dra/municipal-and-property-division/property-bureau/equalization/2024-equalization-reports)
- [2024 Ratio Lists (PDF)](https://www.revenue.nh.gov/sites/g/files/ehbemt736/files/documents/2024-ratio-lists.pdf)

**Issues**: PDF format requires scraping or manual extraction.

### Total equalized valuation & tax commitment

Total equalized property value and total tax raised per municipality.

- [2021 Tables by County (XLSX)](https://www.revenue.nh.gov/sites/g/files/ehbemt736/files/inline-documents/sonh/municipal-property/2021-tables-by-county.xlsx)
- 2024 data is split into per-county PDFs, e.g. [Merrimack County (PDF)](https://www.revenue.nh.gov/sites/g/files/ehbemt736/files/documents/2024-tables-by-county-merrimack-county.pdf)

**Issues**: Recent years are PDF-only (one per county, 10 files). 2021 XLSX is easy to use but dated.

**Combinations**: valuation ÷ population = per-capita wealth; total commitment ÷ population = actual per-capita tax.

### School per-pupil expenditure

Cost per pupil by school district from annual financial reports.

- [NH DOE — Financial Reports](https://www.education.nh.gov/who-we-are/division-of-educator-and-analytic-resources/bureau-of-education-statistics/financial-reports)
- [FY2025 Cost Per Pupil (PDF)](https://www.education.nh.gov/sites/g/files/ehbemt326/files/inline-documents/sonh/cost-per-pupil-fy2025.pdf)
- [NH DOE iPlatform](https://my.doe.nh.gov/iPlatform) (interactive reports)

**Issues**: PDF format. District-to-town mapping isn't always 1:1 (cooperative districts span multiple towns).

**Combinations**: per-pupil cost vs. local ed tax rate = spending efficiency; per-pupil cost vs. test scores = outcomes per dollar.

### School proficiency / test scores

Standardized test proficiency rates (ELA/math) by school and district.

- [NH DOE — Assessment Data](https://www.education.nh.gov/who-we-are/division-of-educator-and-analytic-resources/bureau-of-education-statistics/assessment-data)
- [SDGA NH — Consolidated Proficiency Results 2009–2023](https://sdganh.org/nh-proficiency-results-consolidated/)

**Issues**: School-level data needs aggregation to town level. Cooperative districts complicate town-level attribution.

**Combinations**: proficiency vs. local ed rate — do higher-spending districts get better outcomes?

### Current use land

Acreage in current use (farmland, forest, open space) by town. Current use land is taxed at very low rates, shifting burden to developed properties.

- [2024 Current Use Report by County (PDF)](https://www.revenue.nh.gov/sites/g/files/ehbemt736/files/documents/2024-current-use-report-by-county.pdf)

**Issues**: PDF format, single large report.

**Combinations**: % of land in current use vs. tax rate on developed property.

### Unemployment rates

Monthly and annual labor force and unemployment estimates by municipality.

- [NHES — Labor Force and Unemployment](https://www.nhes.nh.gov/elmi/data-and-statistics/labor-force-and-unemployment)
- [City/Town Data Archive](https://www.nhes.nh.gov/elmi/data-and-statistics/labor-force-and-unemployment/city-and-town-unemployment-rates-data-archive)
- [GraniteStats](https://www2.nhes.nh.gov/GraniteStats/)

**Issues**: PDF and interactive portal; may require scraping.

### School enrollment

Student enrollment by grade, district, and town of residence.

- [NH DOE iPlatform — Enrollment Reports](https://my.doe.nh.gov/iPlatform/Report/DataReportsSubCategory?reportSubCategoryId=9)

**Issues**: Web-only reports. District-to-town mapping complications.

**Combinations**: enrollment trends vs. education tax rate; declining enrollment + rising costs = towns under pressure.


## Lower priority

Interesting but harder to use, less directly related to tax rates, or potentially misleading.

### Crime statistics

Offenses known to law enforcement by municipality.

- [NH Crime Stats Portal](https://crimestats.dos.nh.gov/tops)
- [FBI UCR — NH 2019 (XLS)](https://ucr.fbi.gov/crime-in-the-u.s/2019/crime-in-the-u.s.-2019/tables/table-8/table-8-state-cuts/newhampshire.xls)

**Issues**: Complex relationship with tax rates. Small-town data is noisy (one incident can double a rate). Risk of misleading visualizations.

### NH Zoning Atlas

Comprehensive zoning data — what's allowed to be built where, lot sizes, density restrictions.

- [NH Zoning Atlas Datasets](https://www.anselm.edu/about/offices-centers-institutes/finance-administration/office-partnerships/initiative-housing-policy-and-practice/new-hampshire-zoning-atlas/nhza-datasets-and-resources)
- Format: CSV, Google Sheets, ArcGIS layers

**Issues**: Zoning is categorical/complex, not a single numeric value. Hard to reduce to a single choropleth metric. The relationship to tax rates is indirect (restrictive zoning → constrained supply → higher values → different rate dynamics).

### Housing & demographics (NHHFA)

Housing units, household types, income, poverty from American Community Survey, organized by county with per-municipality breakdowns.

- [NHHFA — Housing and Demographic Data](https://www.nhhfa.org/publications-data/housing-and-demographic-data/)
- Per-county XLSM files, e.g.: [Rockingham County](https://www.nhhfa.org/wp-content/uploads/2022/04/RockinghamCounty.xlsm)

**Issues**: XLSM format (Excel with macros). 10 separate county files to merge. Much of this data is available more cleanly from Census ACS directly.

### Land area

Land and water areas in acres and square miles for every town.

- [Land Area Figures (PDF)](https://www.nheconomy.com/getmedia/f6bfc923-a741-453d-889d-871cc402a737/land-area-figures.pdf)

**Issues**: PDF format. Can also be computed directly from the GeoJSON polygons already in the project.


---

# Standalone choropleth datasets

Datasets unrelated to tax rates that would be interesting to visualize on the same town boundary map. All Census ACS tables below can be bulk-downloaded for all NH county subdivisions (= towns) in a single CSV from [data.census.gov](https://data.census.gov/).

## High interest

### Seasonal / vacant housing rate

Percentage of housing units that are seasonal, recreational, or occasional use. Some Lakes Region and ski towns are 50-70% seasonal homes — reveals "two New Hampshires."

- Census ACS 5-Year, Table B25004 — [data.census.gov](https://data.census.gov/)
- Also available in decennial census housing unit counts

**Why interesting**: Visually dramatic. The vacation-destination towns pop immediately. Directly relevant to housing availability debates.

### Presidential election results

Town-level vote share in a famously purple swing state. Sharp urban/rural divide with surprising pockets.

- [NH Secretary of State — Elections Data](https://www.sos.nh.gov/elections/elections-data) (XLSX)
- [MIT Election Data + Science Lab (MEDSL)](https://electionlab.mit.edu/) — clean per-precinct CSVs
- [NHPR Election Database](https://electiondatabase.nhpr.org/)
- [NH Election Stats](https://nh.electionstats.com/)

**Why interesting**: Very high public interest. Change over time (shift maps between cycles) would be compelling. Red/blue color scale is immediately legible.

### Population change (%)

Percent change in population over a decade or between annual estimates. Shows southern commuter towns booming while northern towns shrink.

- [NH OPD — Population Estimates](https://www.nheconomy.com/office-of-planning-and-development/what-we-do/state-data-center-(census-data)/population-estimates) (CSV)
- Census decennial data for decade-over-decade change

**Why interesting**: Tells the story of NH's diverging economies. Diverging color scale (red for decline, blue for growth) would be striking.

### Median age

NH is one of the oldest states in the US. Dramatic north-south age gradient with some towns above median age 55.

- Census ACS 5-Year, Table B01002 — [data.census.gov](https://data.census.gov/)

**Why interesting**: Surprising to many residents. Directly relevant to school funding, workforce, and services debates.

### Year town incorporated

Shows the wave of settlement — coastal towns in the 1600s, river valleys in the 1700s, northern towns in the late 1700s/early 1800s.

- Compiled from [NH Secretary of State](https://www.sos.nh.gov/) records and town histories
- [Wikipedia — List of municipalities in NH](https://en.wikipedia.org/wiki/List_of_municipalities_in_New_Hampshire)

**Why interesting**: Historically fascinating. A time-gradient color scale would produce a beautiful map showing settlement patterns radiating from the coast and river valleys. Easy dataset to compile.

### Median home value

Direct measure of property wealth by town. Lake towns, ski towns, and southern commuter towns pop.

- Census ACS 5-Year, Table B25077 — [data.census.gov](https://data.census.gov/)

**Why interesting**: Natural complement to tax rates — a high rate on a cheap home vs. a low rate on an expensive home tells very different stories. High general interest.


## Medium interest

### Primary heating fuel

Percentage of homes using heating oil, propane, wood, natural gas, or heat pumps. NH has one of the highest heating oil dependencies in the country, but there's surprising town-level variation.

- Census ACS 5-Year, Table B25040 — [data.census.gov](https://data.census.gov/)

**Why interesting**: Timely for energy transition discussions. Could show % still on oil, or % that have switched to heat pumps. Surprising variation.

### Broadband access

The digital divide in NH is severe — near-universal in the south, major gaps in the north and west.

- [FCC Broadband Map — Data Download](https://broadbandmap.fcc.gov/data-download) (census block level, aggregable to towns)
- NH Department of Business and Economic Affairs broadband reports

**Issues**: Census block data needs aggregation to town boundaries. FCC data has known accuracy issues (historically overstated coverage).

### Commute time / % working from home

Makes the Boston bedroom-community pattern visible. Post-COVID WFH rates show interesting patterns.

- Census ACS 5-Year, Tables B08303 (travel time) and B08006 (work from home) — [data.census.gov](https://data.census.gov/)

**Why interesting**: Southern NH's relationship to Boston is well-known but rarely mapped at this granularity. WFH data post-COVID is a new angle.

### Conservation land (% of town area protected)

Some towns are over 50% conserved land (White Mountain National Forest, land trusts); others near zero.

- [NH GRANIT — Conservation Lands](https://www.granit.unh.edu/) (GIS shapefiles)
- [Society for Protection of NH Forests](https://www.forestsociety.org/)

**Issues**: GIS data needs spatial intersection with town boundaries to compute percentages. Not a simple spreadsheet download.

### Distance to nearest hospital / ER

Access to emergency care varies enormously. Some North Country towns are 45+ minutes from any ER.

- [CMS Provider of Services](https://data.cms.gov/provider-data/) — hospital locations with lat/lon
- Compute centroid-to-nearest-hospital distance from town GeoJSON

**Issues**: Requires geocomputation (nearest-facility distance from each town centroid). Timely topic given rural hospital closures.

### Rooms & meals tax revenue

A proxy for tourism intensity. Towns with disproportionate revenue relative to population are tourist-heavy.

- [NH DRA — Municipal Revenue](https://www.revenue.nh.gov/municipal-services/municipal-revenue.htm) (PDF/Excel, annual)

**Issues**: Format varies by year; may require scraping.

**Why interesting**: Highlights the Lakes Region, White Mountains, and seacoast as tourism economies vs. residential communities.

### Owner-occupied vs. renter-occupied housing

Shows urbanization patterns. Most NH towns are heavily owner-occupied; a few cities have high renter percentages.

- Census ACS 5-Year, Table B25003 — [data.census.gov](https://data.census.gov/)

**Why interesting**: Moderate interest on its own, but useful combined with other housing/income data.

### Town meeting vs. SB2 vs. city government

The geography of direct democracy. Traditional town meeting is declining as towns adopt SB2 (official ballot voting).

- [NH Municipal Association](https://www.nhmunicipal.org/)

**Issues**: Needs manual compilation; no single downloadable dataset. Categorical rather than numeric (would need a qualitative color scheme).

**Why interesting**: Reveals cultural/governance divides. Politically interesting for NH residents.

### National Register historic sites (count per town)

Concentrations of historic architecture and heritage. Portsmouth and Concord stand out, but some small towns have surprising counts.

- [NPS — National Register Data Downloads](https://www.nps.gov/subjects/nationalregister/data-downloads.htm) (CSV/Shapefile with lat/lon)

**Issues**: Point data needs spatial join to town boundaries. Raw counts favor large/old towns; per-capita or per-square-mile would be more meaningful.

### Population density

Extreme variation from ~3,000/sq mi (Nashua) to under 5/sq mi (northern Coos County).

- Derived from census population + town area (computable from existing GeoJSON)

**Why interesting**: Visually dramatic but somewhat predictable. More interesting as a denominator for normalizing other metrics than as a standalone map.
