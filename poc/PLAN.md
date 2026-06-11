# POC: SonarQube "Real-Cost Savings" Executive Dashboard

## Why This Exists

SonarQube Enterprise Edition reports code quality in technical terms -- bugs, vulnerabilities, code smells, remediation minutes. Non-technical stakeholders (CFOs, CISOs, board members) cannot answer: *"What is this tool saving us in dollars?"*

Competitors already have this narrative: Snyk (288% ROI, Forrester TEI), Checkmarx (177% ROI, $7.13M over 3 years), Veracode (184% ROI). **None of them offer an in-product, data-driven, customer-configurable cost dashboard.** They all rely on static analyst reports. This POC would be a first-mover feature.

SonarQube already computes remediation effort in minutes per quality dimension (maintainability, security, reliability). It tags rules with CWE IDs and OWASP categories. The data exists -- the missing layer is a cost model and a dashboard that presents it to executives.

---

## What SonarQube Actually Knows (and Doesn't)

### Available per issue
- Severity (BLOCKER/HIGH/MEDIUM/LOW/INFO), Type (BUG/VULNERABILITY/CODE_SMELL/SECURITY_HOTSPOT)
- Quality dimension (RELIABILITY/SECURITY/MAINTAINABILITY), Status, Creation date, Author, File+line
- **CWE IDs and OWASP Top 10** -- stored on the **rule** (`RuleDto.securityStandards`), not the issue. Internally joined via `IssueMapper.xml` (`r.security_standards as securityStandards`). **Not exposed via `/api/rules/show`** (the protobuf response omits `securityStandards`). However, `/api/issues/search` supports **faceting and filtering by security standards** -- params `owaspTop10-2021`, `cwe`, `sonarsourceSecurity` allow aggregation by CWE category directly without fetching individual rules. This is the approach to use.
- **Remediation effort** -- rule-level static estimate in minutes. Same effort for every instance regardless of context. Exposed in issue search response as `effort` field.

### Available per project (aggregate measures)
- `software_quality_maintainability_remediation_effort` -- total tech debt in minutes (sum of maintainability remediation costs). Replaces deprecated `sqale_index`.
- `software_quality_security_remediation_effort` / `software_quality_reliability_remediation_effort` -- minutes to fix all vulns/bugs. Replace deprecated `security_remediation_effort` / `reliability_remediation_effort`.
- `sqale_debt_ratio` -- tech debt / development cost (default 30 min/line)
- `vulnerabilities`, `bugs`, `security_hotspots_reviewed`, `sca_count_vulnerability`

**Note**: Old metric names (`sqale_index`, `security_remediation_effort`, `reliability_remediation_effort`) still work via `RemovedMetricConverter` but are being phased out. This POC targets current SonarQube and uses only the `software_quality_*` keys.

### NOT available (SAST limitations -- must be disclosed in the dashboard)
- No CVSS scores, no exploitability/reachability analysis
- Cannot detect: business logic flaws, runtime auth bugs, infra misconfig, complex race conditions
- 2024 Veracode study: 50% of critical security issues are logic-based and missed by SAST
- SonarQube OWASP Benchmark (Java): 85% TPR, 1% FDR -- good but incomplete

---

## The Evidence Base

### What we CAN honestly cite

**IBM/Ponemon Cost of a Data Breach 2025** (600 orgs, 16 countries, 17 industries):
- Global avg breach: $4.44M | US avg: $10.22M (record) | Healthcare: $7.42M | Financial: $5.56M | Manufacturing: $5.00M | Tech: $4.79M
- Per-record: Customer PII $160, Employee PII $168, IP $178
- Breach <200 days: $3.61M avg | >200 days: $5.49M ($1.88M more)
- DevSecOps saves $227K vs. mean | AI/ML security saves $224K | Encryption saves $208K
- Vulnerability exploitation: ~20% of breaches | Supply chain: ~15% at $4.91M avg

**FBI IC3 2024**: $16.6B total losses (record, +33%). BEC: $2.77B. Ransomware: ~$1.57B. Personal data breaches: $1.45B.

**Verizon DBIR 2025**: Vulnerability exploitation = 20% of breaches (34% surge YoY). Edge/VPN exploitation: 3%→22%. Ransomware in 44% of breaches. Avg time to patch: 209 days. Attacker time-to-exploit: 5 days.

**HackerOne** (3,000 orgs): Pre-production fix ~$50/issue vs ~$1,500 post-production = **30x multiplier** for security.

### What we CANNOT honestly cite
- **The "100x" cost multiplier is folklore.** Traces to IBM internal training materials (1981). No published data exists. Boehm revised to "more like 5:1 than 100:1" for small systems (IEEE Computer 2001). A 2016 study of 171 projects found no statistically significant difference in many cases.
- **We can never claim "SonarQube prevented X% of breaches."** Finding a vulnerability ≠ preventing an attack.

### Defensible multiplier ranges (used in Tier A only)
| Claim | Range | Source | Usage |
|-------|-------|--------|-------|
| General defect (dev→prod) | **5x - 15x** | Boehm revised (2001) | Tier A phase multiplier for bugs/code smells |
| Security vulnerability (dev→prod) | **30x** | HackerOne empirical | Tier A phase multiplier for vulnerabilities |

Note: The previous "30x - 3,000x" range (HackerOne + IBM/Ponemon) combined pre/post-production fix costs with breach costs. This conflates two different things and is not used. Tier B presents IBM/Ponemon breach costs as **industry context**, not as savings multipliers.

---

## Three-Tier Cost Model

### Tier A: "Time Saved" -- HIGH confidence (directly measured)
```
savings = (remediation_minutes / 60) × hourly_rate × phase_multiplier
```
Uses SonarQube's actual effort data. Hourly rate derived from company inputs (default $75 fully loaded; or `(avg_developer_salary × 1.4 burden) / 2080 hours` if employee data provided).

Phase multiplier defaults (applied to effort, representing "what this would have cost if found in production"):
- **Bugs / code smells**: 5x (Boehm & Basili 2001 — conservative end of the 5-15x range)
- **Vulnerabilities**: 30x (HackerOne empirical — pre-production fix ~$50 vs ~$1,500 post-production)

These are sourced directly from the evidence base. No interpolation or "split the difference" values.

### Tier B: "Security Risk Context" -- contextual (industry benchmarks, not dollar predictions)

Tier B does **not** calculate a dollar savings figure. Instead, it presents what SonarQube found alongside what those vulnerability classes cost the industry, and lets the reader draw their own conclusions. This is more honest and more impactful than multiplying unsourced probability factors.

**What it shows:**
- Vulnerability counts grouped by CWE category (via `/api/issues/search` facets)
- For each CWE category, the corresponding IBM/Ponemon industry breach cost benchmark
- Narrative cards: "SonarQube identified 12 SQL Injection vulnerabilities. In Technology, injection-related breaches average $4.79M (IBM 2025)."

**Why no probability math:** The previous approach multiplied vulnerability counts by probability factors (BLOCKER 0.5%, HIGH 0.1%, etc.) to produce dollar estimates. These probabilities have no cited source. A skeptical CISO asking "where does 0.5% come from?" would undermine the dashboard's credibility -- the exact opposite of our honesty positioning. Instead, we present facts (what we found) and context (what it costs others) and let the executive's own risk assessment fill the gap.

**Revenue-linked context** (when company profile is configured):
- **Ransomware exposure**: "Ransomware attacks cost organizations an average of X% of annual revenue" with the user's specific ceiling.
- **GDPR/regulatory exposure**: "Maximum GDPR exposure: $X based on your reported revenue" (fines are literally "up to 4% of global annual turnover").
- **Breach cost scaling**: IBM's $10.22M US average skews toward large enterprises. Revenue contextualizes: is $4.44M a rounding error or an existential threat?

**Critical framing rule: Tier A and Tier B are never summed.** Tier A ("$X saved in developer time") is the headline. Tier B ("Your exposure context") is shown separately below. Mixing measured savings with contextual benchmarks into one number would make the dashboard's credibility rest on its weakest component.

### Tier C: "Compliance & Operational" -- DEFERRED (post-POC)
Audit savings, compliance penalty avoidance, incident prevention ($10.8K-$32K per production incident). Weakest data, lowest confidence, most implementation work. Not included in the POC build -- the value-add doesn't justify the effort when Tiers A and B already make the case. Revisit if the POC ships to product.

---

## POC Scope & Constraints

### Empty / First-Load States

The first-load experience determines whether a stakeholder engages or bounces. Each state must feel intentional, not broken.

**State 1: No company profile configured (most common first load)**
Show Tier A numbers using defaults ($75/hr fully-loaded rate, Technology industry, US region). These defaults are clearly labeled: *"Estimated using industry defaults. [Configure your company profile] for numbers specific to your organization."* The banner links directly to the config drawer. The dashboard is fully functional in this state — defaults produce meaningful numbers, not placeholders. The goal is to show immediate value and motivate configuration, not to gate the experience behind a setup wizard.

**State 2: Zero issues (fresh SonarQube install, no scans yet)**
Show a value-proposition page instead of an empty dashboard:
- Headline: "See what SonarQube saves your organization"
- Brief explanation of what the dashboard measures (time saved + risk context)
- Single CTA: "Run your first analysis to start tracking savings"
- No fake/example data — that undermines trust immediately

**State 3: Scans exist but zero security issues (Tier B empty)**
Tier A renders normally. The Security Risk Context section shows a positive-framing card: *"No security vulnerabilities detected across your projects. SonarQube is actively scanning for [list of categories]. As vulnerabilities are identified, this section will show how they compare to industry breach benchmarks."* This is important — an empty Tier B is a *good outcome*, not a missing feature.

**State 4: Negative effort delta (more new debt than resolved in the period)**
When a period shows net-new debt instead of savings, show it honestly: *"In Q1 2025, your codebase added 1,200 hours of technical debt (net). This typically happens when onboarding new projects or during rapid development phases."* Do not hide unfavorable data — the dashboard's credibility depends on showing the full picture, not just the wins.

### Retroactive Calculation Scoping

"Retroactive" means different things for each tier:

- **Tier A "Time Saved"**: Calculated from **resolved** issues -- these represent work actually done. The effort on resolved issues is real developer time that was spent earlier (in dev) rather than later (in production).
- **Tier B "Risk Context"**: Shows **open** vulnerabilities that SonarQube has found (detection value). These are current exposure, not past savings.

**Period filtering limitation**: The `/api/issues/search` endpoint supports `createdAfter`/`createdBefore` but has **no `resolvedAfter`/`resolvedBefore` parameters**. The database has `issue_close_date` and the ES index has `issueClosedAt`, but these aren't exposed through the public API. This means we cannot directly query "issues resolved in Q1 2025."

**Approach for period-scoped Tier A**: Use `/api/measures/search_history` to compute effort deltas.
```
effort_saved_in_period = effort_metric(period_start) - effort_metric(period_end)
```
If the total remediation effort drops from 50,000 min to 42,000 min over a quarter, that's 8,000 min of resolved work. This approach:
- Uses only public API
- Is accurate at the project level (measures are snapshotted after each analysis)
- Works for any arbitrary date range via `from`/`to` params
- Naturally handles the "all time" case (earliest snapshot to latest)

For the summary endpoint's `resolvedIssueCount`, use `/api/issues/search?resolved=true&createdInLast=...` as an approximation (counts resolved issues created in the period, not resolved in the period). Note this in the methodology disclosure.

**Edge case**: If effort increases during a period (more new issues than resolved), the delta is negative for that dimension. Show this as "Net new debt: X hours" rather than hiding it -- honesty is the brand.

### Caching Strategy

A single summary request triggers multiple internal API calls:
1. `/api/components/search` — list all projects (1 call, paginated)
2. `/api/measures/component` — per project for current effort metrics (N calls, or batched)
3. `/api/measures/search_history` — per project for effort deltas over the selected period (N calls)
4. `/api/issues/search` with security facets — for open vulnerability counts and CWE breakdown (1 call with facets)

For a 50-project instance, that's ~100+ internal HTTP calls uncached. This is unacceptable for interactive use.

**Approach**: In-memory TTL cache in `CalculationCache.java`, keyed by `(period, fromDate, toDate)`.
- **TTL**: 10 minutes. Dashboard data doesn't need real-time accuracy — it updates after analyses, which run at most a few times per day.
- **Cache scope**: Cache the fully computed response objects (`CostSummary`, `SecurityDetail`, `TrendData`), not individual API call results. This keeps the cache simple (3 entries per period selection) and avoids partial-invalidation complexity.
- **Cold start**: First request after restart or cache miss will be slow. Show a loading indicator with "Calculating savings across all projects..." and return results via a single TanStack Query with appropriate `staleTime`. The frontend should not show a spinner with no context.
- **Response time budget**: <3s cached, <15s cold (acceptable for first load on large instances).
- **Memory bound**: Cache stores at most ~20 entries (a few period combinations). Each is small JSON. No memory concern.

### Permissions
- **Viewing the dashboard**: Any authenticated user (same as viewing project dashboards).
- **Configuring company profile**: System administrator only (company financials are sensitive). Enforce via existing admin permission check on the PUT configuration endpoint.

### Currency
All calculations are **USD only** for the POC. The configuration panel does not include a currency selector. IBM/Ponemon benchmarks are reported in USD; adding currency conversion would require exchange rate management with no added credibility. Revisit post-POC if there's demand.

### Settings API Limit
The Settings API (`/api/settings/set`) has a `VALUE_MAXIMUM_LENGTH` of 4000 characters. The `CompanyProfile` JSON fits comfortably. If config grows post-POC (e.g., custom CWE overrides), a DB migration would be needed.

---

## Executive Experience

This section describes what a CFO or CISO actually sees, in the order they see it. The design goal: a non-technical stakeholder should understand every number on the page without asking an engineer to explain it.

### The "aha moment"

The dashboard answers one question: *"What is this tool saving us?"* The answer comes in the first 3 seconds:

> **$284,000 saved in developer time** (last 12 months)
> Based on 14,200 issues resolved before reaching production.

That's the hero. It's a real number derived from real effort data. It doesn't require belief in a model — it's hours × rate × industry-standard multiplier, and the methodology link is right there.

Below that, the risk context section plants a second, stickier thought:

> SonarQube identified 12 SQL injection vulnerabilities in your codebase. In your industry, injection-related breaches cost an average of $4.79M (IBM, 2025).

The exec doesn't need to know what CWE-89 means. They see "SQL injection" (a term even CFOs recognize from news headlines), a count, and a dollar figure from a source they trust (IBM). The dashboard doesn't claim "we saved you $4.79M" — it says "here's what's at stake." The exec fills in the rest.

### Narrative card design principle

Every narrative card follows the same three-part structure:
1. **What SonarQube found** — in plain language, not CWE codes. "SQL injection vulnerabilities," not "CWE-89 issues."
2. **What it costs the industry** — IBM/Ponemon benchmark with source citation. Always includes the industry name the user configured.
3. **Why it matters here** — connects to the user's context. With revenue configured: "Your maximum GDPR exposure: $2M based on reported revenue." Without: "Organizations in Technology face average breach costs of $4.79M."

CWE codes appear in a secondary detail row for technical users who want to cross-reference. They are never the headline.

### Why this framing works competitively

Snyk, Checkmarx, and Veracode publish static TEI reports — a PDF with pre-baked numbers from a consulting firm. Those are persuasive once, in a sales cycle. This dashboard:
- Updates with every scan (it gets more compelling over time, not less)
- Uses the customer's own data (not a composite case study)
- Shows industry-specific benchmarks (not "a typical enterprise")
- Is transparent about methodology (no black-box model)

The differentiator is not that we have bigger numbers. It's that our numbers are *theirs*.

---

## Dashboard Sections

1. **Executive Summary Hero** — Tier A headline number ("$X saved in developer time"), donut breakdown (Security/Reliability/Maintainability), period selector (month/quarter/year/all), methodology link. No Tier B dollars here — just the measured, defensible number.
2. **Developer Time Saved** (Tier A) — Effort totals → dollars, trend chart showing savings over time, breakdown by quality dimension. Trend chart is important: it shows value accumulating, which reinforces renewal/expansion conversations.
3. **Security Risk Context** (Tier B) — Narrative cards (see design principle above) for each CWE category with issues found. Revenue-linked context (GDPR ceiling, ransomware exposure) when configured. SCA dependency risk count with supply-chain benchmark ($4.91M avg). Visual separation from Tier A — different background/section header to signal "this is context, not savings."
4. **Configuration Panel** — Drawer (not a separate page — the exec shouldn't lose their place). Fields: hourly rate, industry dropdown, region dropdown, company size (employee count, developer count), annual revenue (optional, enables Tier B revenue context). Admin-only edit, visible to all users as read-only.

---

## Technical Implementation

### Backend: Server Plugin

**Approach**: Build as a SonarQube server plugin (JAR) that adds new Web API endpoints. The plugin consumes SonarQube's existing public Web API to fetch issues, rules, and measures -- no internal API access needed.

**Key insight**: The plugin doesn't need direct DB access. All required data is available via existing APIs:
- `/api/issues/search` -- returns issues with severity, type, status, rule key, effort, creation date. Supports facets for aggregation including `owaspTop10-2021`, `cwe`, `sonarsourceSecurity` for CWE/OWASP grouping. This is how Tier B gets CWE/OWASP data without per-rule lookups.
- `/api/measures/component` -- returns `software_quality_maintainability_remediation_effort`, `software_quality_security_remediation_effort`, `software_quality_reliability_remediation_effort`, `vulnerabilities`, `bugs`, etc.
- `/api/measures/search_history` -- historical measure data for trend charts.
- `/api/components/search` -- list all projects for global aggregation.

**For reference** (internal data structure -- the plugin uses the Web API, but these paths explain how the data works):
- Security standards mapping: `server/sonar-server-common/src/main/java/org/sonar/server/security/SecurityStandards.java` (CWE/OWASP category enums, SQCategory mapping)
- Effort calculation: `server/sonar-webserver-webapi/src/main/java/org/sonar/server/measure/live/MeasureUpdateFormulaFactoryImpl.java`
- Effort per issue: `server/sonar-ce-task-projectanalysis/src/main/java/org/sonar/ce/task/projectanalysis/issue/DebtCalculator.java`
- Metric definitions: `sonar-core/src/main/java/org/sonar/core/metric/SoftwareQualitiesMetrics.java`
- Edition gating pattern: `server/sonar-server-common/src/main/java/org/sonar/server/issue/PrioritizedRulesFeature.java`
- Plugin example: `https://github.com/SonarSource/sonar-custom-plugin-example`

#### Plugin structure

```
sonar-cost-savings-plugin/
├── pom.xml (or build.gradle)
├── src/main/java/org/sonar/costsavings/
│   ├── CostSavingsPlugin.java              # Plugin entry point, registers extensions
│   ├── ws/
│   │   ├── CostSavingsWs.java              # WebService controller: api/cost-savings
│   │   ├── SummaryAction.java              # GET /api/cost-savings/summary
│   │   ├── SecurityDetailAction.java       # GET /api/cost-savings/security-detail
│   │   ├── TrendsAction.java               # GET /api/cost-savings/trends
│   │   └── ConfigureAction.java            # GET/PUT /api/cost-savings/configuration
│   ├── calculation/
│   │   ├── CostCalculationService.java     # Orchestrates Tier A + B calculation
│   │   ├── TimeSavingsCalculator.java      # Tier A: effort × rate × multiplier
│   │   └── SecurityContextBuilder.java     # Tier B: CWE counts → narrative + benchmarks
│   ├── cache/
│   │   └── CalculationCache.java           # In-memory TTL cache (10 min), keyed by period
│   ├── data/
│   │   ├── SonarQubeDataFetcher.java       # Wraps calls to SQ's own Web API
│   │   ├── CWEBreachBenchmarks.java        # Static reference: CWE → industry cost (IBM/Ponemon)
│   │   └── IndustryBenchmarks.java         # Static reference: industry → breach cost
│   └── model/
│       ├── CompanyProfile.java             # User inputs: revenue, industry, region, employee count
│       ├── CostSummary.java                # Response model for summary endpoint
│       └── SecurityDetail.java             # Response model for security detail
└── src/main/resources/
    └── static/                             # Plugin web pages (if serving own UI)
```

#### API design (global scope, retroactive)

```
GET /api/cost-savings/summary
    ?period={month|quarter|year|all}
    &from={date}&to={date}
    Response: {
      timeSavings: {
        total: { dollars: 284000, hours: 3787 },
        security: { dollars: 95000, hours: 1267 },
        reliability: { dollars: 112000, hours: 1493 },
        maintainability: { dollars: 77000, hours: 1027 }
      },
      resolvedIssueCount: 14200,              // approximate (see Retroactive Scoping)
      openVulnerabilityCount: 80,
      periodStart: "2024-01-01",
      periodEnd: "2025-04-10",
      companyProfile: { industry: "TECHNOLOGY", region: "US", hourlyRate: 75 },
      configured: true,                        // false = using defaults, show config banner
      methodology: "https://..."               // links to in-product methodology drawer content
    }

    Tier A calculation uses /api/measures/search_history effort deltas
    (see Retroactive Calculation Scoping). Not per-issue aggregation.

GET /api/cost-savings/security-detail
    ?period={...}
    Response: {
      categories: [
        { category: "SQL Injection",             // plain-language name, not CWE code
          cwe: ["CWE-89"],                       // technical reference, secondary
          owasp: "A03:2021",
          issueCount: 12,
          severityBreakdown: { HIGH: 8, MEDIUM: 4 },
          industryBenchmarkCost: 4790000,
          benchmarkSource: "IBM/Ponemon 2025",
          narrative: "12 SQL injection vulnerabilities identified across your projects. In Technology, injection-related breaches average $4.79M." },
        { category: "Cross-Site Scripting (XSS)",
          cwe: ["CWE-79"],
          owasp: "A03:2021",
          issueCount: 23,
          severityBreakdown: { MEDIUM: 18, LOW: 5 },
          industryBenchmarkCost: 4790000,
          benchmarkSource: "IBM/Ponemon 2025",
          narrative: "23 cross-site scripting vulnerabilities identified. XSS is the most common web application vulnerability class and a frequent vector for data theft." },
        { category: "Hardcoded Credentials",
          cwe: ["CWE-798", "CWE-259"],
          owasp: "A07:2021",
          issueCount: 3,
          severityBreakdown: { BLOCKER: 3 },
          industryBenchmarkCost: 4440000,
          benchmarkSource: "IBM/Ponemon 2025",
          narrative: "3 hardcoded credentials found. Compromised credentials are involved in over 40% of breaches (Verizon DBIR 2025)." }
      ],
      totalBySeverity: { BLOCKER: 3, HIGH: 18, MEDIUM: 47, LOW: 12 },
      scaDependencyRisks: { count: 5, supplyChainBenchmark: 4910000,
        narrative: "5 known dependency vulnerabilities. Supply chain attacks cost an average of $4.91M (IBM 2025)." },
      revenueContext: {                       // only present when revenue configured
        maxGDPRExposure: 2000000,
        avgRansomwareCost: 5750000,
        narrative: "Based on your reported revenue, maximum GDPR fine exposure is $2.0M. Average ransomware cost for organizations your size: $5.75M."
      }
    }

    Data source: /api/issues/search with facets=sonarsourceSecurity (maps to
    plain-language categories like "sql-injection", "xss", "auth") and
    facets=owaspTop10-2021 for OWASP grouping. SQCategory enum in
    SecurityStandards.java defines the category-to-CWE mapping.
    No per-rule lookups needed.

GET /api/cost-savings/trends
    ?months=12
    Response: {
      monthly: [
        { month: "2025-03", timeSavings: { dollars: 23000, hours: 307 },
          issuesResolved: 340, vulnerabilitiesFound: 18 }
      ]
    }

GET  /api/cost-savings/configuration           (any authenticated user)
PUT  /api/cost-savings/configuration           (admin only)
    Body: { annualRevenue: 50000000, employeeCount: 500, developerCount: 80,
            industry: "TECHNOLOGY", region: "US" }
```

**Key change from original**: Tier B responses show `industryBenchmarkCost` and `narrative` but no calculated `riskReduction` dollars. The dashboard presents benchmarks alongside detection counts. No probability math.

**Configuration storage**: Store company profile as a JSON property via SonarQube's Settings API (`/api/settings/set` with key `costsavings.companyProfile`). Avoids needing a DB migration. 4000 character limit is sufficient for this structure.

### Frontend: sonarqube-webapp repo

**Key discovery**: Pages are lazy-loaded via `routes.tsx`, registered in `startReactApp.tsx`. Data fetching uses TanStack Query with `createQueryHook()`. Design system is `@sonarsource/echoes-react` (Layout, Text, Spinner) plus `~design-system` (Card, Badge). i18n via `useIntl()` + `intl.formatMessage()`. Keys in `libs/sq-server-commons/src/l10n/default.ts`.

#### Files to create

**Module**: `apps/sq-server/src/main/js/apps/cost-savings/`

```
cost-savings/
├── routes.tsx                      # Route def with lazyLoadComponent
├── components/
│   ├── CostSavingsApp.tsx          # Entry: useIntl(), edition gate check
│   ├── ExecutiveSummary.tsx         # Hero card: Tier A headline + donut
│   ├── TimeSavedSection.tsx         # Tier A breakdown + trend chart
│   ├── SecurityRiskSection.tsx      # Tier B: CWE narrative cards + benchmarks
│   ├── ConfigurationPanel.tsx       # Settings drawer (admin-only controls)
│   ├── ConfidenceBadge.tsx          # HIGH/MEDIUM indicator
│   ├── MethodologyDrawer.tsx        # "How is this calculated?" detail panel
│   ├── NarrativeCard.tsx            # Story cards with benchmarks
│   ├── EmptyState.tsx              # First-load / no-data / unconfigured states
│   └── __tests__/
│       ├── CostSavingsApp-test.tsx
│       ├── ExecutiveSummary-test.tsx
│       └── TimeSavedSection-test.tsx
├── api/
│   └── cost-savings-api.ts         # getJSON('/api/cost-savings/...') calls
└── hooks/
    └── useCostSavings.ts           # createQueryHook wrappers
```

#### Key file paths (pattern sources)
- Route def: `apps/sq-server/src/main/js/apps/overview/routes.tsx`
- Route registration: `apps/sq-server/src/main/js/app/utils/startReactApp.tsx` (lines 120-188)
- App entry: `apps/sq-server/src/main/js/apps/overview/components/App.tsx`
- Data fetching: `apps/sq-server/src/main/js/apps/overview/branches/BranchOverview.tsx`
- API client: `libs/sq-server-commons/src/api/components.ts` (getJSON pattern)
- Query hooks: `libs/sq-server-commons/src/queries/component.ts` (createQueryHook pattern)
- Layout: `apps/sq-server/src/main/js/apps/quality-gates/components/App.tsx` (Layout.ContentGrid)
- i18n keys: `libs/sq-server-commons/src/l10n/default.ts`
- Test pattern: `apps/sq-server/src/main/js/apps/overview/components/__tests__/App-test.tsx`
- Design system: `@sonarsource/echoes-react` (Layout, Text, Spinner, Link) + `~design-system` (Card, Badge)

---

## Limitations to Ship With the Dashboard

These must be visible in-product, not buried in docs:

1. **SAST coverage is partial.** Cannot detect runtime vulns, business logic flaws, or infra misconfig. Cost model reflects only what SonarQube detects (~85% TPR on OWASP Benchmark for Java).
2. **Remediation effort estimates are rule-static approximations.** Same minutes per instance regardless of context. Tend to be slightly pessimistic.
3. **Risk context is industry benchmarks, not predictions.** Breach costs shown are industry averages from published research. They represent what similar vulnerabilities have cost other organizations, not a prediction of your specific risk. Finding a vulnerability ≠ preventing a breach.
4. **Cost benchmarks are industry averages** from IBM/Ponemon (updated annually). Actual costs vary by data sensitivity, regulatory jurisdiction, and org factors.
5. **No causal claims.** "Identified vulnerabilities associated with $X in industry breach costs" ≠ "Prevented $X in breaches."
6. **The "100x" multiplier is not used.** We use Boehm's revised 5:1 (2001) and HackerOne's empirical 30:1 for security.

---

## Verification

1. **Backend**: Unit tests for cost calculation logic + CWE facet aggregation + API response shapes. Follow existing test patterns in `server/sonar-webserver-webapi/src/test/`.
2. **Frontend**: React Testing Library component tests. Follow `__tests__/` convention with ServiceMock pattern. Test: configured state, unconfigured state, empty state, admin vs non-admin config panel visibility.
3. **Integration**: `docker-sonarqube` instance → scan `sonar-scanning-examples` → hit cost-savings API → verify end-to-end.
4. **Performance**: Run summary endpoint against an instance with 100K+ issues. Must respond in <3 seconds. Profile cache hit vs miss.
5. **Sanity check**: Run against SonarQube's own dogfood instance, verify numbers aren't absurd.
6. **Credibility test**: Show to 2-3 non-technical people and ask "Does this feel credible?" Also show to someone who has seen a Snyk/Checkmarx TEI report and ask "Would you trust this more, less, or equally?"

---

## References

| Source | URL | Used For |
|--------|-----|----------|
| IBM/Ponemon 2025 | https://www.ibm.com/reports/data-breach | Breach costs by industry, vector, lifecycle |
| FBI IC3 2024 | https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf | Total cybercrime losses by type |
| Verizon DBIR 2025 | https://www.verizon.com/business/resources/reports/dbir/ | Attack vectors, vuln exploitation stats |
| HackerOne | https://www.hackerone.com/blog/cost-savings-fixing-security-flaws | Pre vs post-production fix costs |
| Boehm & Basili 2001 | https://www.semanticscholar.org/paper/Software-Defect-Reduction-Top-10-List-Boehm-Basili/895f4de9d4e02dbce5fec881942d1704505c940c | Revised defect cost multiplier |
| CISQ 2022 | https://www.it-cisq.org/the-cost-of-poor-quality-software-in-the-us-a-2022-report/ | US cost of poor software quality |
| NIST 02-3 | https://www.nist.gov/document/report02-3pdf | Testing infrastructure cost impact |
| Snyk Forrester TEI | https://snyk.io/blog/forrester-tei-snyk-roi/ | Competitor ROI benchmark |
| Checkmarx Forrester TEI | https://checkmarx.com/press-releases/checkmarx-one-total-economic-impact-study-finds-return-on-investment-of-177-in-fewer-than-six-months-and-gain-of-7-13m-in-benefits-over-three-years/ | Competitor ROI benchmark |
| Bossavit (Leprechauns) | https://leanpub.com/leprechaurs | 100x myth debunking |
| 171-project study (2016) | https://arxiv.org/pdf/1609.04886 | Counter-evidence to cost escalation |
| CISA KEV | https://www.cisa.gov/known-exploited-vulnerabilities-catalog | Exploited vulnerability counts |
| ENISA Threat Landscape | https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024 | EU threat context |

---

## Decisions (Resolved)

1. **Enterprise Edition only.** Yes. Security reports and portfolio features are Enterprise-gated.
   - **Backend**: Implement `SonarQubeFeature` interface, check `sonarRuntime.getEdition() == ENTERPRISE || DATACENTER`. Follow pattern in `PrioritizedRulesFeature.java` (`server/sonar-server-common`).
   - **Frontend**: Check `appState.edition` against `EditionKey.enterprise` from `libs/sq-server-commons/src/types/editions.ts`. Conditionally render nav item and route.
2. **Server plugin via public Web API (not internal services).** A server plugin running inside SonarQube's JVM *could* inject internal Java services directly (e.g., `IssueIndex`, `MeasureDao`). This would be faster (no HTTP round-trips, no JSON serialization) and more capable (access to fields like `securityStandards` that aren't in the public API). However, we use the public Web API because:
   - **Stability**: Internal services change between SQ versions without notice. The public API is versioned and documented.
   - **Portability**: If the POC ships, it could become a standalone service or an embedded page — public API works for both.
   - **Review credibility**: When presenting to product stakeholders, "uses only public APIs" is easier to greenlight than "hooks into internal services."
   - **Sufficiency**: The CWE faceting workaround and measures-history delta approach cover everything we need. No data gap remains.
   
   If performance profiling later shows the HTTP overhead is a bottleneck (unlikely given the 10-min cache), switching to internal services is a localized change in `SonarQubeDataFetcher.java`.
3. **Global scope.** Dashboard shows total savings across the entire SonarQube instance. No portfolio filtering for now -- the CFO wants one number. Portfolio drill-down can come later.
4. **Retroactive.** Compute savings from existing historical scan data, not just forward-looking. This gives an immediate "look what you've already saved" story on first load.
5. **No cost model tuning for now.** No probability sliders or multiplier overrides. However, users should be able to enter basic company financial data that feeds directly into cost formulas:
   - **Annual revenue** -- ransomware losses are often expressed as % of revenue; GDPR fines are literally "up to 4% of global annual turnover"
   - **Employee count / developer count** -- scales hourly rate calculations
   - **Industry** -- selects the correct IBM/Ponemon breach cost benchmark
   - **Region** -- US vs global avg breach costs differ dramatically ($10.22M vs $4.44M)

   These inputs are factual company data, not model tuning. They make the output more relevant without asking users to understand probability factors.
6. **Tier A is the headline, Tier B is context.** Never sum them. Tier A ("$X saved in developer time") is measured and defensible. Tier B ("Your industry spends $Y on breaches like these") is contextual. Mixing them into one number makes the dashboard's credibility rest on its weakest component.
7. **USD only for POC.** IBM/Ponemon benchmarks are in USD. Currency conversion adds complexity without credibility.
8. **CWE data via issue search facets, not rule lookups.** `/api/rules/show` does not expose `securityStandards`. Use `/api/issues/search` with `facets=owaspTop10-2021,cwe,sonarsourceSecurity` instead -- fewer API calls and uses only public API.
9. **Compliance section (Tier C) deferred.** Weakest data, lowest confidence, most work. Tiers A and B are sufficient to make the case.
