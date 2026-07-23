# Real Cost Savings POC — Current State

## What This Is

An in-product executive dashboard for SonarQube that translates code quality metrics into dollar amounts. Two tiers:

- **Tier A ("Time Saved")**: Remediation effort (minutes) x hourly rate x phase multiplier. Multipliers: 5x for bugs/smells (Boehm 2001), 30x for vulnerabilities (HackerOne empirical). HIGH confidence — directly measured.
- **Tier B ("Security Risk Context")**: Vulnerability counts by CWE category shown alongside IBM/Ponemon 2025 industry breach benchmarks. No probability math, no dollar predictions — just "here's what we found" next to "here's what it costs others." CONTEXTUAL confidence.

Full rationale and evidence base: [PLAN.md](./PLAN.md)

## Architecture

### Backend: SonarQube Server Plugin

**Location**: `sonar-cost-savings-plugin/`

A JAR plugin that registers Web API endpoints inside SonarQube. It calls SQ's own public API (via `java.net.http.HttpClient`) to fetch issues, measures, and measure history, then computes cost savings.

```
sonar-cost-savings-plugin/src/main/java/org/sonar/costsavings/
├── CostSavingsPlugin.java              # Entry point, registers extensions
├── ws/
│   ├── CostSavingsWs.java              # WebService: api/cost-savings
│   ├── SummaryAction.java              # GET /api/cost-savings/summary
│   ├── SecurityDetailAction.java       # GET /api/cost-savings/security-detail
│   ├── TrendsAction.java               # GET /api/cost-savings/trends
│   ├── ConfigureAction.java            # GET/POST /api/cost-savings/configuration
│   ├── ProjectsAction.java             # GET /api/cost-savings/projects
│   └── BenchmarksAction.java           # GET /api/cost-savings/benchmarks
├── calculation/
│   ├── CostCalculationService.java     # Orchestrator: fetches data, computes, caches
│   ├── TimeSavingsCalculator.java      # Tier A: effort delta → dollars
│   └── SecurityContextBuilder.java     # Tier B: CWE facets → narrative cards
├── cache/
│   └── CalculationCache.java           # In-memory TTL cache (10 min)
├── data/
│   ├── SonarQubeDataFetcher.java       # HTTP client wrapping SQ's Web API
│   ├── CWEBreachBenchmarks.java        # CWE → plain-language name + narrative template
│   ├── ComplianceMapping.java          # Compliance framework mapping
│   └── IndustryBenchmarks.java         # Phase multipliers + IBM/Ponemon constants
├── model/
│   ├── CompanyProfile.java             # User config: industry, region, rate, revenue
│   ├── CostSummary.java                # Response: Tier A headline + breakdown
│   ├── SecurityDetail.java             # Response: Tier B categories + narratives
│   ├── TrendData.java                  # Response: monthly trend points
│   ├── RemediationCostModel.java       # Human + AI cost breakdown
│   ├── Industry.java                   # Enum with breach costs per industry
│   ├── Region.java                     # Enum with breach costs per region
│   └── Period.java                     # month/quarter/year/all
└── telemetry/
    ├── TelemetryCollector.java         # Usage tracking
    └── TelemetryStore.java
```

**Build**: `mvn package` — 57 unit tests, all passing.

**Authentication**: The plugin uses a configured API token (`costsavings.apiToken` setting) to authenticate its internal HTTP calls to SQ's own API. This must be a user token with admin/browse permissions. The system passcode (`sonar.web.systemPasscode`) is used as a fallback if configured.

**Key design decisions**:
- Uses public Web API only (no internal services) for stability and portability
- Computes two savings approaches and takes the higher: history deltas (resolved work) and current effort (detected issues). This handles both single-scan and multi-scan cases without "all time < last year" inversions.
- All IBM/Ponemon 2025 benchmark data is baked into Java enums, not fetched at runtime

### Frontend: sonarqube-webapp Module

**Location**: `sonarqube-webapp/apps/sq-server/src/main/js/apps/cost-savings/`

```
cost-savings/
├── routes.tsx                          # Routes: /cost_savings, /cost_savings/summary
├── api/cost-savings-api.ts             # Typed API client (getJSON/post)
├── hooks/useCostSavings.ts             # TanStack Query hooks (10min staleTime)
├── utils/format.ts                     # formatCurrency(), formatHours(), formatBenchmark()
└── components/
    ├── CostSavingsApp.tsx              # Entry: period state, drawer toggles, empty state routing
    ├── ExecutiveSummary.tsx             # Hero card: headline $, dimension breakdown, config banner
    ├── TimeSavedSection.tsx             # Tier A detail: table + bar chart trend
    ├── SecurityRiskSection.tsx          # Tier B: narrative cards, SCA, revenue context
    ├── NarrativeCard.tsx               # Three-part card: found → industry cost → why it matters
    ├── ConfigurationPanel.tsx           # Drawer: industry, region, rate, revenue, headcount
    ├── MethodologyDrawer.tsx            # "How calculated?" with formula, multipliers, limitations
    ├── ProjectScopeSelector.tsx         # Multi-project filter with per-project savings
    ├── AICodeSection.tsx                # AI Code Assurance metrics + promo
    ├── ROISection.tsx                   # License cost ROI if configured
    ├── SalesSummaryView.tsx             # Sales pitch view (/cost_savings/summary)
    ├── EmptyState.tsx                   # no-data + no-security-issues states
    ├── ConfidenceBadge.tsx              # HIGH / CONTEXTUAL indicators
    └── __tests__/                       # 14 tests across 6 test suites
```

**Route registered** in `startReactApp.tsx` at `/cost_savings`, plus nav entry in `GlobalNavMenu.tsx`.

**i18n keys**: ~130 keys under `cost_savings.*` in `libs/sq-server-commons/src/l10n/default.ts`.

**Patterns used**: Echoes design system (`Layout`, `Heading`, `Button`, `Select`, `TextInput`, `Spinner`), TanStack Query, `useIntl()` with `formatMessage`, `sw-*` Tailwind classes.

## Running the Demo

### Prerequisites
- Docker (Colima on macOS)
- Node 22 (`nvm use 22`) with corepack enabled
- Maven 3.9+, Java 17+

### Backend
```bash
# Start SonarQube
cd docker-sonarqube/example-compose-files/sq-with-postgres
docker compose up -d

# Build and deploy plugin
cd real_cost_savings_poc/sonar-cost-savings-plugin
mvn package
docker cp target/sonar-cost-savings-plugin-1.0.0-SNAPSHOT.jar sonarqube:/opt/sonarqube/extensions/plugins/
docker compose restart sonarqube

# Configure API token (after SQ is up, login as admin:admin)
# Generate token: My Account → Security → Generate Token (User Token)
curl -u admin:admin -X POST 'http://localhost:9000/api/settings/set' \
  -d 'key=costsavings.apiToken&value=YOUR_TOKEN'
```

### Scan Projects for Data
```bash
# Quick: scan all supported local repos
export SONAR_TOKEN=YOUR_TOKEN
./scan-projects.sh

# Or scan individual Maven projects manually:
cd /path/to/project
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.token=$SONAR_TOKEN
```

The `scan-projects.sh` script will scan WebGoat, BenchmarkJava, Kafka, and Elasticsearch if they exist alongside this repo in `~/code/`.

### Frontend
```bash
cd sonarqube-webapp
YARN_CHECKSUM_BEHAVIOR=ignore yarn install
PROXY=http://localhost:9000 yarn start-sqs
# Open http://localhost:3000/cost_savings
```

## Features

- **Executive Summary**: Headline security risk managed (industry breach benchmark), developer time saved, period selector, project scope filter
- **Security Risk Context**: CWE narrative cards with industry benchmarks, severity badges, compliance framework badges (OWASP, PCI-DSS, SOC 2, GDPR)
- **Developer Time Saved**: Dimension breakdown (security, reliability, maintainability) with hours and dollars, trend chart
- **AI Code Assurance**: AI-generated code quality metrics when enabled, issue density comparison
- **ROI Section**: License cost vs. savings ratio when configured
- **Configuration Panel**: Company profile (industry, region, hourly rate, revenue, headcount, license cost, token price)
- **Methodology Drawer**: Full formula explanation, phase multiplier sources, limitations, references
- **Project Scope Selector**: Multi-select with per-project savings estimates and issue counts
- **Export**: Copy summary to clipboard, print/save as PDF
- **Sales Summary View**: Shareable executive summary at `/cost_savings/summary`

## Honesty & Content Audit (Applied)

The following content and design fixes were applied to ensure the dashboard is honest and doesn't inflate the numbers presented to users:

### P0 — Fixed
- **`riskManagedAmount` removed as headline claim.** Previously, the dashboard showed the full industry breach cost (e.g., $4.79M) as "risk managed" whenever any vulnerability category was detected. This was misleading. Now the industry breach benchmark is shown as contextual information ("In Technology, the average data breach costs $4.79M"), not as a claimed savings.
- **Single-scan "detection value" clearly distinguished.** When projects have only one scan (no history delta), the dashboard now labels the numbers as "Estimated Detection Value" instead of "Estimated Savings", shows an amber ESTIMATED badge instead of a green HIGH CONFIDENCE badge, and displays an explanation banner.

### P1 — Fixed
- **Donut center label**: Changed from "Cost Avoided" to "Estimated Savings" (multi-scan) or "Estimated Detection Value" (single-scan).
- **Blended multiplier 8.0 replaced**: Trends now apply per-dimension multipliers (5x maint/reliability, 30x security). Counterfactual derives the effective multiplier from the actual dimension breakdown instead of using an undocumented hardcoded value.
- **Ransomware floor capped at revenue**: `calculateRansomwareExposure()` now caps at the company's annual revenue, preventing a $5M company from seeing "$5.75M ransomware exposure."

### P2 — Fixed
- **Confidence badges are context-aware**: TimeSavedSection shows `ESTIMATED` (amber) when `savingsMode === "estimated"`, `HIGH CONFIDENCE` (green) when measured.
- **Benchmark clarification on narrative cards**: Each card's `benchmarkSource` now reads "IBM/Ponemon 2025 — Technology avg. breach cost (all causes)" to clarify it's the industry-wide average, not category-specific.
- **`issuesPerKLoc` fixed**: Now uses only open issue count for density (not resolved + open). Label updated to "open issues per thousand lines of code."

### P3 — Fixed
- **Gartner "$5,600/minute" stat removed**: DoS narrative no longer cites the frequently-challenged Gartner downtime figure. Replaced with factual language.
- **Dollars column tooltip**: The "Savings" column header in the dimension table now shows a tooltip: "Includes phase cost multiplier (5x for bugs/smells, 30x for vulnerabilities)."

## Known Issues and TODO

### Design Gaps vs. PLAN.md
1. **Enterprise edition gating** — not implemented. The plan calls for `SonarQubeFeature` on backend and `appState.edition` check on frontend. Currently accessible on all editions.
2. **Period selector** — uses Echoes `Select` but the plan shows it as a segmented control / tab-style picker.
3. **Trend data accuracy** — with single-scan projects, monthly trend bars are all zero (no delta between months). Only shows data once a project has multiple scans over time.
4. **SCA dependency risks** — always returns 0. The `fetchScaDependencyRiskCount` method is stubbed. Needs integration with SCA metrics if available.
5. **Resolved issue count** — uses `createdAfter/createdBefore` on resolved issues as an approximation (SQ API has no `resolvedAfter` param). Documented in plan as known limitation.

### Production Readiness Gaps
1. **Error handling** — API errors bubble up as generic error. No graceful degradation if individual API calls fail (e.g., show Tier A even if Tier B fetch fails).
2. **Loading states** — the cold-start loading state is basic.
3. **Admin-only config** — the configuration panel doesn't enforce admin permissions. Should check `UserSession.checkIsSystemAdministrator()` on the backend PUT endpoint.
4. **Currency formatting** — uses simple `$XXK` / `$X.XM` formatting. Could use `Intl.NumberFormat` for proper locale-aware currency display.
5. **Frontend tests not validated in CI** — tests are written but untested in CI pipeline.
6. **CostSavingsApp integration tests** — 3 tests time out due to missing `useAppState` context in the test harness. This is a pre-existing issue unrelated to content changes.

## API Reference

All endpoints are under `/api/cost-savings/`. Authentication is handled by the user's SQ session (cookie-based for browser, basic auth for curl).

```
GET /api/cost-savings/summary?period={month|quarter|year|all}&projects={key1,key2}
GET /api/cost-savings/security-detail?projects={key1,key2}
GET /api/cost-savings/trends?months=12&projects={key1,key2}
GET /api/cost-savings/projects
GET /api/cost-savings/benchmarks
GET /api/cost-savings/configuration
POST /api/cost-savings/set_configuration
  params: industry, region, hourlyRate, annualRevenue, employeeCount, developerCount, licenseCost, tokenPricePerMillion
```

## File Locations Quick Reference

| What | Where |
|------|-------|
| Full plan | `real_cost_savings_poc/PLAN.md` |
| Backend plugin | `real_cost_savings_poc/sonar-cost-savings-plugin/` |
| Backend tests | `sonar-cost-savings-plugin/src/test/java/org/sonar/costsavings/` |
| Frontend module | `sonarqube-webapp/apps/sq-server/src/main/js/apps/cost-savings/` |
| Frontend tests | `...cost-savings/components/__tests__/` |
| i18n keys | `sonarqube-webapp/libs/sq-server-commons/src/l10n/default.ts` (search `cost_savings.`) |
| Route registration | `sonarqube-webapp/apps/sq-server/src/main/js/app/utils/startReactApp.tsx` |
| Nav menu entry | `sonarqube-webapp/apps/sq-server/src/main/js/app/components/nav/global/GlobalNavMenu.tsx` |
| Docker compose | `docker-sonarqube/example-compose-files/sq-with-postgres/` |
| Scan script | `real_cost_savings_poc/scan-projects.sh` |
