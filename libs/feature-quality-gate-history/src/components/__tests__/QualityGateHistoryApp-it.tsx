/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { subDays } from 'date-fns';
import { HttpResponse, http } from 'msw';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  registerServiceMocks,
  resetServiceMocks,
  server,
  startServer,
  stopServer,
} from '~shared/api/mocks/server';
import {
  BranchesServiceDefaultDataset,
  BranchesServiceMock,
} from '~shared/api/mocks/services/BranchesServiceMock';
import {
  NewCodeDefinitionServiceDefaultDataset,
  NewCodeDefinitionServiceMock,
} from '~shared/api/mocks/services/NewCodeDefinitionServiceMock';
import {
  ProjectActivityServiceDefaultDataset,
  ProjectActivityServiceMock,
} from '~shared/api/mocks/services/ProjectActivityServiceMock';
import { mockComponent } from '~shared/helpers/mocks/component';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byTestId, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier, LightComponent } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { NewCodeDefinitionType } from '~shared/types/new-code-definition';
import QualityGateHistoryApp from '../QualityGateHistoryApp';
import QualityGateHistoryGuard from '../QualityGateHistoryGuard';

// The shared page template pulls in adapter-level layout (content header, footer) and the
// full-window context, none of which belong to this feature. We stub it down to its title + body
// so the test stays hermetic and identical across SQS and SQC.
jest.mock('~shared/components/pages/ProjectPageTemplate', () => ({
  ProjectPageTemplate: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const activityHandler = new ProjectActivityServiceMock(ProjectActivityServiceDefaultDataset);
const ncdHandler = new NewCodeDefinitionServiceMock(NewCodeDefinitionServiceDefaultDataset);
// SQS resolves the main branch to read its new code definition; SQC ignores this.
const branchesHandler = new BranchesServiceMock(BranchesServiceDefaultDataset);

const ui = {
  pageTitle: byRole('heading', { level: 1, name: 'quality_gate_history.page_title' }),

  // Empty states (all rendered as <Heading as="h2">).
  nonCompatibleTitle: byRole('heading', {
    level: 2,
    name: 'quality_gate_history.empty.non_compatible.title',
  }),
  nonCompatibleCta: byRole('link', { name: /quality_gate_history\.empty\.non_compatible\.cta/ }),
  noReleasesTitle: byRole('heading', {
    level: 2,
    name: 'quality_gate_history.empty.no_releases.title',
  }),
  noReleasesCta: byRole('link', { name: /quality_gate_history\.empty\.no_releases\.cta/ }),
  noReleasesInPeriodTitle: byRole('heading', {
    level: 2,
    name: /quality_gate_history\.empty\.no_releases_in_period\.title/,
  }),

  // Populated card.
  safeReleasesLabel: byText('quality_gate_history.safe_releases'),
  riskyReleasesLabel: byText('quality_gate_history.risky_releases'),
  legendSafe: byText('quality_gate_history.legend.OK'),
  legendRisky: byText('quality_gate_history.legend.ERROR'),
  timeline: byRole('list'),
  timelineItems: byRole('listitem'),

  // Period selector (Echoes ToggleButtonGroup renders radios).
  periodAll: byRole('radio', { name: 'quality_gate_history.period.all' }),
  period30Days: byRole('radio', { name: 'quality_gate_history.period.30d' }),

  // Current URL search string, surfaced by the test-only location probe.
  locationSearch: byTestId('location-search'),

  // 404 shown for unsupported qualifiers (applications, portfolios, ...).
  notFoundTitle: byRole('heading', { level: 2, name: 'page_not_found' }),
};

beforeAll(() => {
  startServer();
});

afterAll(() => {
  stopServer();
});

beforeEach(() => {
  // The selected period is persisted in localStorage — start each test from the default (All time).
  localStorage.clear();
  activityHandler.reset();
  ncdHandler.reset();
  branchesHandler.reset();
  // Register the NCD mock first so its cooperative `/api/settings/values` handler takes precedence.
  registerServiceMocks(ncdHandler, activityHandler, branchesHandler);
});

afterEach(() => {
  resetServiceMocks();
});

it('shows the non-compatible empty state when the new code definition is not "previous version"', async () => {
  ncdHandler.data.type = NewCodeDefinitionType.NumberOfDays;

  renderQualityGateHistory();

  expect(await ui.nonCompatibleTitle.find()).toBeInTheDocument();
  expect(ui.pageTitle.get()).toBeInTheDocument();
  expect(ui.nonCompatibleCta.get()).toBeInTheDocument();

  // None of the "previous version" content is rendered.
  expect(ui.timeline.query()).not.toBeInTheDocument();
  expect(ui.noReleasesTitle.query()).not.toBeInTheDocument();
});

it('shows an error message, and no misleading empty state, when a request fails', async () => {
  // The NCD resolves to "previous version" (the default dataset), but the release-history requests
  // fail. Without error handling this would wrongly render the "no releases" empty state. The
  // endpoints are shared across SQS and SQC, so this stays adapter-agnostic. These handlers take
  // precedence over the ones registered in `beforeEach` because they are added later.
  server.use(
    http.get('/api/project_analyses/search', () => new HttpResponse(null, { status: 500 })),
    http.get('/api/measures/search_history', () => new HttpResponse(null, { status: 500 })),
  );

  renderQualityGateHistory();

  // The generic error message is shown (as an in-page callout, and via the global error toast).
  expect(await byText('default_error_message').find()).toBeInTheDocument();

  // On failure we must not fall back to the "not using Previous version" / "no releases" states.
  expect(ui.nonCompatibleTitle.query()).not.toBeInTheDocument();
  expect(ui.noReleasesTitle.query()).not.toBeInTheDocument();
  expect(ui.noReleasesInPeriodTitle.query()).not.toBeInTheDocument();
});

it('shows the no-releases empty state when the project has no released versions', async () => {
  seedReleases([]);

  renderQualityGateHistory();

  expect(await ui.noReleasesTitle.find()).toBeInTheDocument();
  expect(ui.noReleasesCta.get()).toBeInTheDocument();
  expect(ui.timeline.query()).not.toBeInTheDocument();
});

it('renders the timeline, summary and legend when releases exist', async () => {
  seedReleases([
    { version: '1.0', date: subDays(new Date(), 10), status: 'ERROR' },
    { version: '2.0', date: subDays(new Date(), 2), status: 'OK' },
  ]);

  renderQualityGateHistory();

  // Summary cards + legend.
  expect(await ui.safeReleasesLabel.find()).toBeInTheDocument();
  expect(ui.riskyReleasesLabel.get()).toBeInTheDocument();
  expect(ui.legendSafe.get()).toBeInTheDocument();
  expect(ui.legendRisky.get()).toBeInTheDocument();

  // One timeline entry per release (default period is "All time").
  expect(ui.timelineItems.getAll()).toHaveLength(2);
});

it('filters the timeline down to the selected period', async () => {
  seedReleases([
    { version: '1.0', date: subDays(new Date(), 400), status: 'OK' }, // older than a year
    { version: '2.0', date: subDays(new Date(), 5), status: 'OK' }, // within 30 days
  ]);

  const { user } = renderQualityGateHistory();

  expect(await ui.safeReleasesLabel.find()).toBeInTheDocument();
  expect(ui.timelineItems.getAll()).toHaveLength(2);

  await user.click(ui.period30Days.get());

  expect(ui.timelineItems.getAll()).toHaveLength(1);
});

it('shows the no-releases-in-period empty state when the selected period has no releases', async () => {
  // Both releases are well over a year old, so any bounded period excludes them.
  seedReleases([
    { version: '1.0', date: subDays(new Date(), 500), status: 'OK' },
    { version: '2.0', date: subDays(new Date(), 450), status: 'ERROR' },
  ]);

  const { user } = renderQualityGateHistory();

  expect(await ui.timelineItems.findAll()).toHaveLength(2);

  await user.click(ui.period30Days.get());

  expect(await ui.noReleasesInPeriodTitle.find()).toBeInTheDocument();
  expect(ui.timeline.query()).not.toBeInTheDocument();
});

it.each(['branch', 'pullRequest', 'fixedInPullRequest'])(
  'normalizes the URL to the main branch when a "%s" param is present',
  async (param) => {
    seedReleases([{ version: '1.0', date: subDays(new Date(), 2), status: 'OK' }]);

    renderQualityGateHistory([`/?id=my-project&${param}=whatever`]);

    // The main-branch content still renders...
    expect(await ui.safeReleasesLabel.find()).toBeInTheDocument();
    // ...and the branch-like param has been stripped from the URL, leaving only the project id.
    expect(ui.locationSearch.get()).toHaveTextContent(/^\?id=my-project$/);
  },
);

it.each([
  ComponentQualifier.Application,
  ComponentQualifier.Portfolio,
  ComponentQualifier.SubPortfolio,
])('shows a 404 for unsupported qualifier "%s"', async (qualifier) => {
  seedReleases([{ version: '1.0', date: subDays(new Date(), 2), status: 'OK' }]);

  renderQualityGateHistory(['/'], mockComponent({ key: 'my-project', qualifier }));

  expect(await ui.notFoundTitle.find()).toBeInTheDocument();
  // None of the page content is rendered for unsupported qualifiers.
  expect(ui.pageTitle.query()).not.toBeInTheDocument();
});

interface SeededRelease {
  date: Date;
  status: 'OK' | 'ERROR';
  version: string;
}

/** Seeds the project's released versions and the matching `alert_status` history. */
function seedReleases(releases: SeededRelease[]) {
  activityHandler.data.analyses = {
    paging: { pageIndex: 1, pageSize: 500, total: releases.length },
    analyses: releases.map((release, index) => ({
      key: `analysis-${index}`,
      date: release.date.toISOString(),
      projectVersion: release.version,
      manualNewCodePeriodBaseline: false,
      events: [{ key: `event-${index}`, category: 'VERSION', name: release.version }],
    })),
  };
  activityHandler.data.measuresHistory = {
    paging: { pageIndex: 1, pageSize: 1000, total: releases.length },
    measures: [
      {
        metric: MetricKey.alert_status,
        history: releases.map((release) => ({
          date: release.date.toISOString(),
          value: release.status,
        })),
      },
    ],
  };
}

/** Test-only probe that surfaces the current URL search string for assertions. */
function LocationProbe() {
  const { search } = useLocation();
  return <div data-testid="location-search">{search}</div>;
}

function renderQualityGateHistory(
  initialEntries: string[] = ['/'],
  component: LightComponent = mockComponent({ key: 'my-project', name: 'My Project' }),
) {
  return renderWithRouter(
    <>
      <QualityGateHistoryGuard>
        <QualityGateHistoryApp />
      </QualityGateHistoryGuard>
      <LocationProbe />
    </>,
    {
      componentContext: { component },
      initialEntries,
    },
  );
}
