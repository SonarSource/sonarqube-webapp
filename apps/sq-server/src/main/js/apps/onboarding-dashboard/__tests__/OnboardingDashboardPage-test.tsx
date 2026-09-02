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

import { screen } from '@testing-library/react';
import { mockOnboardingOverview } from '~shared/api/mocks/OnboardingServiceMock';
import { deriveJourneyState } from '~shared/helpers/onboarding/deriveJourneyState';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byTestId, byText } from '~shared/helpers/testSelector';
import { OnboardingOverview } from '~shared/types/onboarding';
import { OnboardingDashboardPage } from '../OnboardingDashboardPage';

const mockJourneyStateQuery = jest.fn();

jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingOrganizationKey: () => undefined,
}));

jest.mock('~shared/queries/onboarding', () => ({
  useOnboardingJourneyState: (...args: unknown[]) => mockJourneyStateQuery(...args) as unknown,
}));

jest.mock('~shared/components/onboarding/OnboardingProgressDonut', () => ({
  OnboardingProgressDonut: ({ value }: { value: number }) => (
    <div data-testid="progress-donut">{value}</div>
  ),
}));

jest.mock('~feature-onboarding-dashboard/components/LazyOnboardingDashboardApp', () => ({
  LazyOnboardingDashboardApp: () => <div data-testid="dashboard-app" />,
}));

const ui = {
  heading: byRole('heading', { name: 'layout.onboarding_dashboard' }),
  subtitle: byText('onboarding_dashboard.header.subtitle'),
  congratsTitle: byText('onboarding_dashboard.journey.congrats.title'),
  progressDonut: byTestId('progress-donut'),
  dashboardApp: byTestId('dashboard-app'),
};

function setOverview(overview: OnboardingOverview | undefined, isPending = false) {
  // The page observes the overview query through its `select`, so the mock derives the same state.
  mockJourneyStateQuery.mockReturnValue({
    data: overview === undefined ? undefined : deriveJourneyState(overview),
    isPending,
  });
}

function renderPage() {
  return renderWithRouter(<OnboardingDashboardPage />);
}

it('renders the page heading and description', async () => {
  setOverview(mockOnboardingOverview());
  renderPage();

  expect(await ui.heading.find()).toBeInTheDocument();
  expect(ui.subtitle.get()).toBeInTheDocument();
});

it('shows neither the progress donut nor the congrats callout while the overview is pending', async () => {
  setOverview(undefined, true);
  renderPage();

  expect(await ui.heading.find()).toBeInTheDocument();
  expect(ui.progressDonut.query()).not.toBeInTheDocument();
  expect(ui.congratsTitle.query()).not.toBeInTheDocument();
});

it('renders the progress donut in the title prefix once the org is bound', async () => {
  setOverview(mockOnboardingOverview());
  renderPage();

  // The donut receives the overallPct derived from the overview (progressPct === 75 in the mock).
  expect(await ui.progressDonut.find()).toHaveTextContent('75');
});

it('omits the progress donut when the org is not bound to any DevOps platform', async () => {
  setOverview(mockOnboardingOverview({ devopsPlatforms: { configured: 0 } }));
  renderPage();

  expect(await ui.heading.find()).toBeInTheDocument();
  expect(ui.progressDonut.query()).not.toBeInTheDocument();
});

it('shows the congrats callout only when the journey is at the BoundNoImport level', async () => {
  // Bound platform, no repositories imported yet — BoundNoImport level.
  setOverview(
    mockOnboardingOverview({
      repositories: { discovered: 42, imported: 0, percent: null },
    }),
  );
  renderPage();

  expect(await ui.congratsTitle.find()).toBeInTheDocument();
});

it('does not show the congrats callout once repositories have been imported', async () => {
  setOverview(mockOnboardingOverview());
  renderPage();

  expect(await ui.heading.find()).toBeInTheDocument();
  expect(ui.congratsTitle.query()).not.toBeInTheDocument();
});

it('renders the lazy-loaded dashboard app as the page content', async () => {
  setOverview(mockOnboardingOverview());
  renderPage();

  expect(await screen.findByTestId('dashboard-app')).toBeInTheDocument();
});
