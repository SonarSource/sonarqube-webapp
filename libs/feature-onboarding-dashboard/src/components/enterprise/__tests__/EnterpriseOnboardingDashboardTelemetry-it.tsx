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

import { Route } from 'react-router';
import { JourneyStep } from '~shared/types/onboarding';
import {
  OnboardingDashboardAction,
  OnboardingDashboardFilter,
  OnboardingDashboardSurface,
  OnboardingDashboardTelemetry,
} from '~shared/types/onboarding-dashboard-telemetry';
import { LazyEnterpriseOnboardingDashboardApp } from '../LazyEnterpriseOnboardingDashboardApp';

function mockTracker<K extends keyof OnboardingDashboardTelemetry>() {
  return jest.fn<unknown, Parameters<OnboardingDashboardTelemetry[K]>>();
}

const mockTelemetry = {
  trackActionBlocked: mockTracker<'trackActionBlocked'>(),
  trackActionSelected: mockTracker<'trackActionSelected'>(),
  trackFilterChanged: mockTracker<'trackFilterChanged'>(),
  trackImportRequested: mockTracker<'trackImportRequested'>(),
  trackStepSelected: mockTracker<'trackStepSelected'>(),
  trackViewed: mockTracker<'trackViewed'>(),
};

// Product-specific; covered by the adapter tests.
jest.mock('~adapters/helpers/useOnboardingDashboardTelemetry', () => ({
  useOnboardingDashboardTelemetry: () => mockTelemetry,
}));

const ENTERPRISE_ID = 'enterprise-uuid';
const PREFIX = 'onboarding_dashboard.enterprise';

const ui = {
  // The journey opens on the projects step: another step has to be picked to select one.
  stepperProjects: byRole('button', {
    name: 'onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.10.onboarding_dashboard.journey.step.projects.title',
  }),
  stepperRepositories: byRole('button', {
    name: 'onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.88.onboarding_dashboard.journey.step.repositories.title',
  }),
  sortName: byRole('radio', { name: `${PREFIX}.organizations.sort.name` }),
  viewDashboard: byRole('link', {
    name: `${PREFIX}.organizations.action.view.label.Web core`,
  }),
  table: byRole('table', { name: `${PREFIX}.organizations.title` }),
  viewAll: byRole('button', { name: `${PREFIX}.organizations.view_all` }),
};

beforeAll(async () => {
  await import('../EnterpriseOnboardingDashboardApp');
});

beforeEach(() => {
  Object.values(mockTelemetry).forEach((track) => {
    track.mockClear();
  });
  registerServiceMocks(new OnboardingServiceMock());
});

afterEach(() => {
  resetServiceMocks();
});

function renderEnterpriseDashboard() {
  return renderWithRoutes(
    <>
      <Route
        element={
          <LazyEnterpriseOnboardingDashboardApp
            addOrganizationUrl={{ pathname: '/enterprise/acme' }}
            enterpriseId={ENTERPRISE_ID}
            getBindingUrl={(key) => ({ pathname: `/organizations/${key}/edit` })}
            getDashboardUrl={(key) => ({ pathname: `/organizations/${key}/project-coverage` })}
          />
        }
        path="project-coverage"
      />
      <Route
        element={<div>organization dashboard</div>}
        path="organizations/:key/project-coverage"
      />
    </>,
    {
      initialEntries: ['/project-coverage'],
      userEventOptions: { delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never },
    },
  );
}

it('reports the visit once, for the enterprise, with its journey', async () => {
  renderDashboard();

  // The journey opens on the projects step.
  expect(await ui.stepperProjects(10).find()).toBeInTheDocument();

  expect(mockTelemetry.trackViewed).toHaveBeenCalledTimes(1);

  const [event] = mockTelemetry.trackViewed.mock.calls[0];
  expect(event.enterpriseId).toBe(ENTERPRISE_ID);
  expect(event.journeyState?.enterprise).toMatchObject({
    organizationsBound: 8,
    organizationsTotal: 12,
  });
});

it('names the enterprise on the events of the journey', async () => {
  const { user } = renderDashboard();

  await user.click(await ui.stepperRepositories(88).find());

  expect(mockTelemetry.trackStepSelected).toHaveBeenCalledWith(
    expect.objectContaining({
      enterpriseId: ENTERPRISE_ID,
      previousStep: JourneyStep.Projects,
      selectedStep: JourneyStep.Repositories,
    }),
  );
});

it('reports a new sort of the organizations, and that one is opened', async () => {
  const { user } = renderEnterpriseDashboard();

  await ui.table.byText('Web core').find();
  await user.click(ui.sortName.get());

  expect(mockTelemetry.trackFilterChanged).toHaveBeenCalledWith(
    expect.objectContaining({
      enterpriseId: ENTERPRISE_ID,
      filter: OnboardingDashboardFilter.OrganizationSort,
      surface: OnboardingDashboardSurface.OrganizationsTable,
      value: 'NAME',
    }),
  );
});

it('reports that the order of the organizations was reversed', async () => {
  const { user } = renderDashboard();

  await ui.table.byText('Web core').find();
  await user.click(ui.sortAscending.get());

  expect(mockTelemetry.trackFilterChanged).toHaveBeenCalledWith(
    expect.objectContaining({
      enterpriseId: ENTERPRISE_ID,
      filter: OnboardingDashboardFilter.OrganizationSortDirection,
      surface: OnboardingDashboardSurface.OrganizationsTable,
      value: 'DESC',
    }),
  );
});

it('reports that the dashboard of an organization was opened, from the organizations table', async () => {
  const { user } = renderDashboard();

  await user.click(await ui.viewDashboard('Web core').find());

  expect(mockTelemetry.trackActionSelected).toHaveBeenCalledWith(
    expect.objectContaining({
      action: OnboardingDashboardAction.ViewOrganizationDashboard,
      enterpriseId: ENTERPRISE_ID,
      surface: OnboardingDashboardSurface.OrganizationsTable,
    }),
  );
});

it('reports that all the organizations were asked for, from the panel it was asked on', async () => {
  // jsdom does not implement it; each test file has its own jsdom, so nothing is left to restore.
  HTMLElement.prototype.scrollIntoView = jest.fn();
  const { user } = renderEnterpriseDashboard();

  await user.click(await ui.viewAll.find());

  expect(mockTelemetry.trackActionSelected).toHaveBeenCalledWith(
    expect.objectContaining({
      action: OnboardingDashboardAction.ViewAllOrganizations,
      enterpriseId: ENTERPRISE_ID,
      surface: OnboardingDashboardSurface.ProjectsPanel,
    }),
  );
});
