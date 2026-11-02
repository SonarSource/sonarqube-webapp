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

import { UseQueryResult } from '@tanstack/react-query';
import { PointerEventsCheckLevel } from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Route } from 'react-router';
import { OnboardingServiceMock } from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingOrganizationAdmins } from '~shared/types/onboarding';
import { LazyEnterpriseOnboardingDashboardApp } from '../LazyEnterpriseOnboardingDashboardApp';

export const ENTERPRISE_ID = 'enterprise-uuid';
export const PREFIX = 'onboarding_dashboard.enterprise';

/** What the request-access modal reads of the administrators query. */
export type AdminsQueryResult = Pick<
  UseQueryResult<OnboardingOrganizationAdmins>,
  'data' | 'isError' | 'isPending'
>;

export function adminsQueryResult(overrides: Partial<AdminsQueryResult> = {}): AdminsQueryResult {
  return { data: undefined, isError: false, isPending: false, ...overrides } as AdminsQueryResult;
}

/** Registers the onboarding service mock for the calling suite and resets its data between tests. */
export function setupOnboardingMock() {
  const onboardingMock = new OnboardingServiceMock();

  beforeAll(async () => {
    // The dashboard is lazy-loaded: preloading it keeps the first test from timing out on the cold import.
    await import('../EnterpriseOnboardingDashboardApp');
  });

  beforeEach(() => {
    registerServiceMocks(onboardingMock);
  });

  afterEach(() => {
    onboardingMock.reset();
  });

  return onboardingMock;
}

/** Mounts the enterprise dashboard body, as the enterprise page does. `routes` adds the pages it links to. */
export function renderEnterpriseDashboard(
  props: Partial<React.ComponentProps<typeof LazyEnterpriseOnboardingDashboardApp>> = {},
  routes?: ReactNode,
) {
  return renderWithRoutes(
    <>
      <Route
        element={
          <LazyEnterpriseOnboardingDashboardApp
            addOrganizationUrl={{ pathname: '/enterprise/acme' }}
            createOrganizationUrl={{ pathname: '/create-organization', search: '?enterpriseId=x' }}
            enterpriseId={ENTERPRISE_ID}
            getBindingUrl={(key) => ({ pathname: `/organizations/${key}/edit` })}
            getDashboardUrl={(key) => ({ pathname: `/organizations/${key}/project-coverage` })}
            {...props}
          />
        }
        path="project-coverage"
      />
      {routes}
    </>,
    {
      initialEntries: ['/project-coverage'],
      userEventOptions: { delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never },
    },
  );
}

export const ui = {
  error: byText('default_error_message'),
  loading: byText('onboarding_dashboard.loading'),

  // The first step is an enterprise one, the other two read like an organization's.
  stepperBinding: (count: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.${count}.${PREFIX}.step.binding.title`,
    }),
  stepperBindingUnbound: byRole('button', { name: `${PREFIX}.step.binding.title` }),
  stepperRepositories: (percent: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.${percent}.onboarding_dashboard.journey.step.repositories.title`,
    }),
  stepperProjects: (percent: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.${percent}.onboarding_dashboard.journey.step.projects.title`,
    }),
  lockedStep: (titleId: string) =>
    byRole('button', { name: `onboarding_dashboard.journey.step.locked_aria_label.${titleId}` }),
  bindingCaption: (bound: number) => byText(`${PREFIX}.step.binding.count.${bound}`),

  bindingPanelTitle: byText(`${PREFIX}.binding.title`),
  importPanelTitle: byText(`${PREFIX}.import.title`),
  analyzePanelTitle: byText(`${PREFIX}.analyze.title`),
  notBoundLegend: byText(`${PREFIX}.binding.legend.not_bound`),

  overTimeChart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  overTimeTitle: byText('onboarding_dashboard.journey.overtime.title'),
  lockedStatsTitle: byText(`${PREFIX}.locked.stats.title`),
  lockedMoreTitle: byText(`${PREFIX}.locked.more.title`),
  // The organization's placeholders say "Bind organization" / "Import repositories": the enterprise has neither.
  organizationLockedStatsCta: byText('onboarding_dashboard.journey.locked.stats.cta'),
  organizationLockedMoreCta: byText('onboarding_dashboard.journey.locked.more.cta'),

  viewAll: byRole('button', { name: `${PREFIX}.organizations.view_all` }),
  requestAccess: (name: string) =>
    byRole('button', { name: `${PREFIX}.organizations.action.request_access.label.${name}` }),
  requestAccessTitle: byText(`${PREFIX}.request_access.title`),
  createOrganization: byRole('link', { name: `${PREFIX}.binding.create_organization` }),

  banner: (unavailable: number, total: number) =>
    byText(`${PREFIX}.coverage.banner.${unavailable}.${total}`),
  table: byRole('table', { name: `${PREFIX}.organizations.title` }),
  search: byRole('searchbox'),
  sortBy: byRole('combobox', { name: 'projects.sort_by' }),
  sortOption: (name: string) => byRole('option', { name: `${PREFIX}.organizations.sort.${name}` }),
  sortAscending: byRole('button', { name: `${PREFIX}.organizations.sort.ascending` }),
  sortDescending: byRole('button', { name: `${PREFIX}.organizations.sort.descending` }),
  unavailable: byText(`${PREFIX}.organizations.unavailable`),
  pageTwo: byRole('button', { name: 'pagination.page_x.2' }),
  viewDashboard: (name: string) =>
    byRole('link', { name: `${PREFIX}.organizations.action.view.label.${name}` }),
  bind: (name: string) =>
    byRole('link', { name: `${PREFIX}.organizations.action.bind.label.${name}` }),

  emptyTitle: byText(`${PREFIX}.empty.title`),
  addOrganization: byRole('link', { name: `${PREFIX}.empty.cta` }),
  projectsTable: byRole('table', { name: 'onboarding_dashboard.projects.title' }),
};
