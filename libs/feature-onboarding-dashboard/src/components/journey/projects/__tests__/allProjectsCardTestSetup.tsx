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

import { PointerEventsCheckLevel, UserEvent } from '@testing-library/user-event';
import {
  mockOnboardingProjects,
  OnboardingServiceMock,
} from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { AllProjectsCard } from '../AllProjectsCard';

// The card tests cover dropdown content and filtering, not the permission gate. Pin to
// permitted so PermissionGate doesn't intercept the actions button and hide the menu.
jest.mock('~adapters/helpers/useCanCreateProjects', () => ({
  useCanCreateProjects: jest.fn().mockReturnValue(true),
}));

/**
 * Setup shared by the two "all projects" card suites — one for what the table renders, one for
 * searching, filtering and paging it. They are separate files because a render of this card costs
 * a few seconds: almost all of it is Echoes re-serialising its emotion styles during React's render
 * phase, so cost scales with renders and interactions, and splitting lets the two halves run on
 * different jest workers.
 *
 * No query hook is mocked. The real `~adapters/queries/onboarding` hooks run against the
 * `OnboardingServiceMock` HTTP handlers, so the fetching and the `select` transforms are under test.
 * That is also what keeps the row menu honest: whether "Re-run automatic analysis" is offered is
 * decided by the real product hook rather than by a stub.
 */
const onboardingMock = new OnboardingServiceMock();

export function setupOnboardingServiceMock() {
  beforeAll(() => {
    registerServiceMocks(onboardingMock);
  });

  afterEach(() => {
    onboardingMock.reset();
  });
}

/**
 * Narrows the fixture to the named projects. Every row mounts a dropdown menu, a repository link and
 * two badges, so a test that only cares about one row renders it alone.
 */
export function seedProjects(...names: string[]) {
  onboardingMock.setProjects(
    mockOnboardingProjects().filter((project) => names.includes(project.name)),
  );
}

/**
 * Seeds `count` analysed projects named repo-0…repo-(count-1) and shrinks the page the mock backend
 * serves to `pageSize`, so pagination shows up without rendering a full 50-row page. The card
 * derives `totalPages` from the page metadata the backend returns rather than from the page size it
 * requested, so overriding it server-side is what the component actually reacts to.
 */
export function seedPagedProjects(count: number, pageSize: number) {
  const baseProject = mockOnboardingProjects()[2]; // web-core — analysed
  onboardingMock.setProjects(
    Array.from({ length: count }, (_, i) => ({
      ...baseProject,
      key: `repo-${i}`,
      name: `repo-${i}`,
    })),
  );
  onboardingMock.overridePageSize = pageSize;
}

/**
 * `pointerEventsCheck` is disabled because it walks the ancestor chain calling `getComputedStyle`
 * for every pointer event, which adds to an already expensive render — every row of this table
 * carries a dropdown menu.
 */
export function renderAllProjectsCard() {
  return renderWithRouter(<AllProjectsCard />, {
    userEventOptions: { delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never },
  });
}

/**
 * Types into the search box in one shot. `user.type` dispatches a full event sequence per character
 * and each one re-renders the table; the component only ever reads the final value (debounced), so
 * a single paste exercises the same behaviour for a fraction of the cost.
 */
export async function search(user: UserEvent, query: string) {
  await user.click(ui.searchInput.get());
  await user.paste(query);
}

export const ui = {
  table: byRole('table', { name: 'onboarding_dashboard.projects.title' }),
  title: byText('onboarding_dashboard.projects.title'),
  columnHeaders: byRole('table', { name: 'onboarding_dashboard.projects.title' }).byRole(
    'columnheader',
  ),
  colRepository: byText('onboarding_dashboard.projects.col.repository'),
  colScanStatus: byText('onboarding_dashboard.projects.col.onboarding'),
  colAnalysisMode: byText('onboarding_dashboard.projects.col.analysis_mode'),
  colActions: byRole('table', { name: 'onboarding_dashboard.projects.title' }).byText(
    'onboarding_dashboard.projects.col.actions',
  ),

  searchInput: byRole('searchbox', { name: 'onboarding_dashboard.projects.search' }),
  // Echoes' Select renders a role=combobox input whose accessible name comes from the sibling
  // <Label htmlFor>, so the label message key is the queryable name.
  scanStatusFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.scan_status.label',
  }),
  analysisModeFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.analysis_mode.label',
  }),
  scannedOption: byRole('option', { name: 'onboarding_dashboard.projects.filter.scanned' }),
  notScannedOption: byRole('option', { name: 'onboarding_dashboard.projects.filter.not_scanned' }),
  ciOption: byRole('option', { name: 'onboarding_dashboard.projects.filter.ci' }),

  repoWebCore: byText('web-core'),
  repoPlatformJobs: byText('platform-jobs'),
  repoIdentityLib: byText('identity-lib'),
  repoGitlabIcon: byRole('img', { name: 'alm.gitlab' }),

  // Row actions menu. The react-intl mock joins the message id with its values, so the trigger's
  // accessible name is the label key suffixed with the project name.
  rowActionsButton: (projectName: string) =>
    byRole('button', {
      name: `onboarding_dashboard.projects.actions.label.${projectName}`,
    }),
  rowActionItems: byRole('menuitem'),
  configureCiAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.configure_ci',
  }),
  rerunAutomaticAnalysisAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.rerun_automatic_analysis',
  }),
  restoreAccessAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.restore_access',
  }),
  viewProjectAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.view_project',
  }),

  paginationPage: (page: number) => byRole('button', { name: `pagination.page_x.${page}` }),
};
