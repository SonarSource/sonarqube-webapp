# feature-dashboards

Reusable dashboard UI for SonarCloud (and future products). Source lives in **`src/`**; apps import it with the **`~feature-dashboards/*`** alias (see `tsconfig.base.json`). The SonarCloud **project dashboard** composes this library from **sq-cloud**.

## Layout (`src/`)

| Path                         | Role                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `components/common/`         | Shared non-chart UI (loading, empty states, …).                                                                                                                                                                                                                                                                                                  |
| `components/pie-chart/`      | Shared pie chart chrome (e.g. `PieChartHeader`).                                                                                                                                                                                                                                                                                                 |
| `components/visualizations/` | Chart primitives (axes, areas, dots)—not full product charts.                                                                                                                                                                                                                                                                                    |
| `editable-multigrid/`        | Grid: drag/resize, keyboard moves, collision detection, compaction.                                                                                                                                                                                                                                                                              |
| `dashboard-layout/`          | Shell: editable vs readonly dashboards, sections, widget chrome, positioning logic.                                                                                                                                                                                                                                                              |
| `types/`                     | Shared contracts (`dashboard-widget.ts`), `widget-common`, `visualization`, `dashboard-list`, …                                                                                                                                                                                                                                                  |
| `widget-creation-modal/`     | Add/edit widget modal: `components/` (including `DefineWidgetAccordion`, `ApplyFilterAccordion`, `CustomizeVisualizationAccordion`), `hooks/`, `state/` (`widgetConfigTypes`, `widgetConfigInitialState`, `reducers/`, `selectors/`), `utils/` (`editWidgetConfig`, `getActualMetricKey`, `measureFilterConfig`, `pieChartMetricSelectOptions`). |

## Where to put new code

| Adding…                                                                            | Location                                                                                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Generic chart primitive (props in → SVG/D3 out)                                    | `src/components/visualizations/`                                                                                                |
| Generic non-chart widget UI                                                        | `src/components/common/`                                                                                                        |
| Grid behavior                                                                      | `src/editable-multigrid/`                                                                                                       |
| Dashboard shell / sections / positioning                                           | `src/dashboard-layout/`                                                                                                         |
| Generic types / enums (e.g. list filters)                                          | `src/types/`                                                                                                                    |
| Add/edit widget modal (preview, edit hook, accordion state, config helpers)        | `widget-creation-modal/components`, `widget-creation-modal/hooks`, `widget-creation-modal/state`, `widget-creation-modal/utils` |
| SQC widget (APIs, queries, wiring)                                                 | `sq-cloud/.../projectDashboard/widgets/<name>/`                                                                                 |
| Count widget shell (measure + optional trend slot)                                 | `components/visualizations/CountWidget.tsx`; sq-cloud composes it directly with `TrendIndicator`                                |
| Shared widget prop map / JSON schema types / modal output (`CompleteWidgetConfig`) | `types/dashboard-widget.ts` (also `DashboardWidgetPropMap` alias)                                                               |
| Other products later                                                               | Product app folder; reuse `~feature-dashboards/…`                                                                               |

## Conventions

- **Generic** — Avoid product queries and product-only types; pass data via props. Full charts belong in **sq-cloud** and compose this library.
- **Relative imports** — Between `dashboard-layout` and `editable-multigrid`, prefer relative paths so the dependency graph stays local.
- **`~adapters`** — Some layout code uses **`~adapters/*`** (e.g. error reporting). That resolves when built/tested with **sq-cloud**; abstract later if another host needs the same code.
- **Widget prop maps** — Project and portfolio custom dashboards share `DashboardWidgetPropMap` in `types/dashboard-widget.ts`.

## Imports

`~feature-dashboards/*` → `libs/feature-dashboards/src/*`. Deep imports are fine; no barrel required.

```typescript
import { WidgetNoData } from '~feature-dashboards/components/common/WidgetNoData';
import { RenderDots } from '~feature-dashboards/components/visualizations/RenderDots';
import { CodeScope } from '~feature-dashboards/types/widget-common';
import type { DashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import type { PieChartSegment } from '~feature-dashboards/types/visualization';
import { DashboardFilter, PAGE_SIZE } from '~feature-dashboards/types/dashboard-list';
import { Dashboard } from '~feature-dashboards/dashboard-layout/Dashboard';
import { normalizeSection } from '~feature-dashboards/dashboard-layout/logic/positioning';
import type { DashboardInstance } from '~feature-dashboards/dashboard-layout/logic/types';
import { GridLayout } from '~feature-dashboards/editable-multigrid/components/GridLayout';
import { ConfigureWidgetPreview } from '~feature-dashboards/widget-creation-modal/components/ConfigureWidgetPreview';
import { WidgetCreationModalBody } from '~feature-dashboards/widget-creation-modal/components/WidgetCreationModalBody';
import { WidgetModalPreviewFromState } from '~feature-dashboards/widget-creation-modal/components/WidgetModalPreviewFromState';
import { useConfigureWidgetModalAccordionOpenState } from '~feature-dashboards/widget-creation-modal/hooks/useConfigureWidgetModalAccordionOpenState';
import { useEditWidget } from '~feature-dashboards/widget-creation-modal/hooks/useEditWidget';
import type { CompleteWidgetConfig } from '~feature-dashboards/types/dashboard-widget';
```

**Product (sq-cloud):** import shared dashboard types from `~feature-dashboards/types/dashboard-widget`; data wiring stays in `~queries/...`.

---

## Development

This library has no standalone build or typecheck target; it is compiled and checked as part of **sq-server** or **sq-cloud**.

| Task            | Command                                                          |
| --------------- | ---------------------------------------------------------------- |
| Build (via app) | `yarn nx build sq-server` or `yarn nx build sq-cloud`            |
| Typecheck       | `yarn nx ts-check sq-server` or `yarn nx ts-check sq-cloud`      |
| Lint            | `yarn nx lint feature-dashboards`                                |
| Format check    | `yarn nx format-check feature-dashboards` (add `--write` to fix) |

**Tests** run through app Jest configs; scope with a path under `libs/feature-dashboards`. **`sq-server`** `jest.config.js` maps **`~helpers/*`**, **`~project-dashboard/*`**, and other **sq-cloud** paths used transitively (e.g. **`~queries/*`**, **`~api/*`**, **`~types/*`**, **`~hooks/*`**, **`~app/*`**, **`~components/*`**, **`~integration/*`**, **`~sonar-aligned/*`**) into **`private/apps/sq-cloud/src/...`**. **`~adapters`** still follows **sq-server**’s mapping in that runner.

---

Grid subsystem API details: [src/editable-multigrid/README.md](src/editable-multigrid/README.md).
