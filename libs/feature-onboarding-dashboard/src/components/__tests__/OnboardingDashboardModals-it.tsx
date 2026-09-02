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

import { http, HttpResponse } from 'msw';
import { server } from '~shared/api/mocks/server';
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

jest.mock('~adapters/helpers/useOnboardingDevopsConfigurations', () =>
  jest
    .requireActual<typeof import('./onboardingDashboardTestMocks')>(
      './onboardingDashboardTestMocks',
    )
    .devopsConfigurationsMock(),
);

// The extra card (auto-import on cloud, CLI bulk import on server) is tested at the adapter level;
// the integration test stubs it out to keep platform internals out of the shared test.
jest.mock('~adapters/components/onboarding/ImportRepositoriesExtraCard', () => ({
  ImportRepositoriesExtraCard: () => null,
}));

/**
 * Reaching the journey's two modals from the dashboard. Only that the right dialog opens is asserted
 * here — what each one contains is covered by ImportRepositoriesModal-it and
 * ConfigureProjectsModal-it, which mount the modals directly.
 */

setupOnboardingMock();

beforeAll(() => {
  // Opening the import modal asks which DevOps platforms are configured. SQ-Server answers over
  // HTTP (SQ-Cloud resolves it client-side, so there the handler is simply never hit), and the
  // service mock for that endpoint lives in `libs/sq-server-commons`, out of reach from a shared
  // test — so the endpoint is stubbed here rather than the query hook, which stays real.
  // Answering with no platform keeps the modal on its single-platform path and stops it asking for
  // repositories, which would be a second product-specific request.
  server.use(
    http.get('*/api/v2/dop-translation/dop-settings', () =>
      HttpResponse.json({ dopSettings: [], page: { pageIndex: 1, pageSize: 100, total: 0 } }),
    ),
  );
});

it('opens the "import repositories" modal when clicking the view-all button', async () => {
  const { user } = renderOnboardingDashboard();

  await user.click(await ui.stepperRepositories.find());
  await user.click(ui.viewAllRepositoriesButton.get());

  expect(await ui.importModal.find()).toBeInTheDocument();
});

it('opens the "configure projects" modal when clicking the not-scanned CTA', async () => {
  const { user } = renderOnboardingDashboard();

  await user.click(await ui.notScannedCta.find());

  expect(await ui.configureModal.find()).toBeInTheDocument();
});
