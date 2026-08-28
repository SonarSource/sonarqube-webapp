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

import { mockOnboardingOverview } from '~shared/api/mocks/OnboardingServiceMock';
import { renderOnboardingDashboard, setupOnboardingMock, ui } from './onboardingDashboardTestSetup';

jest.mock('~adapters/helpers/useOnboardingCurrentBinding', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .currentBindingMock(),
);

jest.mock('~adapters/helpers/useCreateDevopsConfigurationUrl', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .createDevopsConfigurationUrlMock(),
);

jest.mock('~adapters/helpers/useAutoImportToggle', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .autoImportToggleMock(),
);

const onboardingMock = setupOnboardingMock();

/**
 * The journey: which step the derived state selects, what the stepper does when the user picks
 * another one, and how much of the statistics card the current journey level unlocks.
 *
 * The stepper's own presentation is covered by JourneyStepper-test, each panel's by DetailPanel-test
 * and the chart's by OnboardingOverTimeCard-test. What is left here is the wiring between them.
 */

it('renders the journey stepper with the three step cards, defaulting the active step', async () => {
  renderOnboardingDashboard();

  // All three step cards render as selectable buttons.
  expect(await ui.stepperBinding.find()).toBeInTheDocument();
  expect(ui.stepperRepositories.get()).toBeInTheDocument();
  expect(ui.stepperProjects.get()).toBeInTheDocument();

  // The default mock is bound with analysed projects, so deriveJourneyState selects the "projects"
  // step; only its card is pressed.
  expect(ui.stepperProjects.get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.stepperBinding.get()).toHaveAttribute('aria-pressed', 'false');
});

it('moves the stepper selection to the card the user clicks', async () => {
  const { user } = renderOnboardingDashboard();

  // "projects" is selected by default; clicking the binding card moves the pressed state to it.
  expect(await ui.stepperProjects.find()).toHaveAttribute('aria-pressed', 'true');

  await user.click(ui.stepperBinding.get());

  expect(ui.stepperBinding.get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.stepperProjects.get()).toHaveAttribute('aria-pressed', 'false');
});

it('renders the detail panel for the active step and swaps it when another step is selected', async () => {
  const { user } = renderOnboardingDashboard();

  // The default mock is bound with analysed projects, so the derived active step is "projects" and
  // the analyze detail panel renders (its title is unique to the panel, not the stepper card).
  expect(await ui.analyzePanelTitle.find()).toBeInTheDocument();

  // Selecting the binding step swaps the detail panel to the organization-binding panel.
  await user.click(ui.stepperBinding.get());
  expect(await ui.bindingPanelTitle.find()).toBeInTheDocument();
  expect(ui.analyzePanelTitle.query()).not.toBeInTheDocument();
});

it('unlocks both over-time series and no placeholder once repositories are imported', async () => {
  // The default mock is bound with imported repositories — the "Imported" journey level.
  renderOnboardingDashboard();

  expect(await ui.overTimeChart.find()).toBeInTheDocument();
  expect(ui.overTimePlatformsLegend.get()).toBeInTheDocument();
  expect(ui.overTimeImportedLegend.get()).toBeInTheDocument();

  // Nothing is left to unlock at this level.
  expect(ui.lockedStatsTitle.query()).not.toBeInTheDocument();
  expect(ui.lockedMoreTitle.query()).not.toBeInTheDocument();
});

it('replaces the chart with the "unlock statistics" placeholder while the org is unbound', async () => {
  // No configured DevOps platform: deriveJourneyState reports the Unbound level.
  onboardingMock.setOverview(mockOnboardingOverview({ devopsPlatforms: { configured: 0 } }));
  renderOnboardingDashboard();

  expect(await ui.lockedStatsTitle.find()).toBeInTheDocument();
  expect(ui.lockedStatsCta.get()).toBeInTheDocument();

  // The over-time chart is fully locked at this level, and the "unlock more" variant belongs to
  // the next one.
  expect(ui.overTimeChart.query()).not.toBeInTheDocument();
  expect(ui.overTimePlatformsLegend.query()).not.toBeInTheDocument();
  expect(ui.lockedMoreTitle.query()).not.toBeInTheDocument();
});
