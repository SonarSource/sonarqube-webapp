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

import { PointerEventsCheckLevel } from '@testing-library/user-event';
import { OnboardingServiceMock } from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import routes from '../../routes';

/**
 * Lifecycle, render helper and selectors shared by the onboarding dashboard integration suites.
 *
 * Those suites are split by concern — page shell, journey, modals — so they run on separate jest
 * workers. Mounting the dashboard through its route costs roughly three seconds, which dominates
 * every test here, so anything provable against a single component belongs in that component's own
 * suite rather than in one of these.
 */

/**
 * Registers the onboarding service mock for the calling suite and resets it between tests. Returns
 * the handle so a test can seed it before rendering.
 */
export function setupOnboardingMock() {
  const onboardingMock = new OnboardingServiceMock();

  beforeAll(async () => {
    // The dashboard route lazy-loads this module. Preloading it once keeps the first test from
    // timing out on the cold import before any UI is mounted.
    await import('../OnboardingDashboardApp');
    registerServiceMocks(onboardingMock);
  });

  afterEach(() => {
    onboardingMock.reset();
  });

  return onboardingMock;
}

/**
 * Mounts the dashboard through its route, the way the app does, and returns a `user` alongside the
 * render result.
 *
 * `pointerEventsCheck` is disabled because it walks the ancestor chain calling `getComputedStyle`
 * for every pointer event, which otherwise dominates the runtime — the dashboard renders a projects
 * table whose every row carries a dropdown menu.
 */
export function renderOnboardingDashboard() {
  return renderWithRoutes(routes(), {
    initialEntries: ['/onboarding-dashboard'],
    userEventOptions: { delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never },
  });
}

export const ui = {
  error: byText('default_error_message'),

  // The overview LoadingContainer announces this message (the react-intl mock renders the key
  // literally) while skeletons are shown; it clears once the data resolves.
  loading: byText('onboarding_dashboard.loading'),

  // Header — the ring label reflects the backend `progressPct` (75 in the mock), surfaced by
  // deriveJourneyState as `overallPct`. It is unique across the fixture: the stepper donuts use
  // importedPct and analyzedPct, which come out at 2% and 0% here.
  headerSubtitle: byText('onboarding_dashboard.header.subtitle'),
  headerProgress: byText('onboarding_dashboard.percent.75'),

  // Journey stepper — three selectable step cards rendered as buttons. These selectors hold only
  // while the step is unlocked; a locked step names itself `locked_aria_label.<title>` instead (see
  // StepCard), so a test rendering an unbound org must select those two cards by their locked name.
  // The two donut cards fold their percentage into the name — 2% and 0% in this fixture.
  stepperBinding: byRole('button', {
    name: 'onboarding_dashboard.journey.step.binding.title',
  }),
  stepperRepositories: byRole('button', {
    name: 'onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.2.onboarding_dashboard.journey.step.repositories.title',
  }),
  stepperProjects: byRole('button', {
    name: 'onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.0.onboarding_dashboard.journey.step.projects.title',
  }),

  // Detail panel titles, each unique to the panel rather than to the stepper card above it.
  analyzePanelTitle: byText('onboarding_dashboard.journey.analyze.title'),
  bindingPanelTitle: byText('onboarding_dashboard.journey.binding.title'),

  // Journey statistics — progressively unlocked by JourneyLevel.
  overTimeChart: byRole('img', { name: 'onboarding_dashboard.journey.overtime.title' }),
  overTimePlatformsLegend: byText('onboarding_dashboard.journey.overtime.legend.platforms_bound'),
  overTimeImportedLegend: byText(
    'onboarding_dashboard.journey.overtime.legend.repositories_imported',
  ),
  lockedStatsTitle: byText('onboarding_dashboard.journey.locked.stats.title'),
  // A link, not a button: the call-to-action resolves to a destination through
  // `useCreateDevopsConfigurationUrl`, which the suites stub to one shape across products.
  lockedStatsCta: byRole('link', { name: 'onboarding_dashboard.journey.locked.stats.cta' }),
  lockedMoreTitle: byText('onboarding_dashboard.journey.locked.more.title'),

  // DevOps platforms
  devopsTitle: byText('onboarding_dashboard.devops.title'),
  devopsGithub: byText('alm.github'),
  devopsBitbucket: byText('alm.bitbucket'),
  devopsGitlab: byText('alm.gitlab'),
  devopsAzure: byText('alm.azure'),
  devopsNotBound: byText('onboarding_dashboard.devops.not_bound'),
  devopsGithubBar: byRole('progressbar', { name: 'alm.github' }),

  // All-projects card — only what shows the dashboard wired it in. Its own behaviour is covered by
  // AllProjectsCard-it.
  projectsTable: byRole('table', { name: 'onboarding_dashboard.projects.title' }),

  // Stale-projects card, which has no backing data yet (STALE_PROJECTS_FEATURE_ENABLED is off).
  staleTitle: byText('onboarding_dashboard.stale.title'),
  staleTable: byRole('table', { name: 'onboarding_dashboard.stale.title' }),

  // "View all repositories" modal (triggered from the Repositories step's donut).
  viewAllRepositoriesButton: byRole('button', {
    name: 'onboarding_dashboard.journey.import.view_all',
  }),
  importModal: byRole('dialog', { name: 'onboarding_dashboard.journey.import.modal.title' }),

  // "Configure projects" modal (triggered from the Analyze step's donut and CTAs).
  configureModal: byRole('dialog', { name: 'onboarding_dashboard.journey.analyze.modal.title' }),
  notScannedCta: byRole('button', {
    name: 'onboarding_dashboard.journey.analyze.not_scanned.cta',
  }),
};
