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
import { byRole, byText } from '~shared/helpers/testSelector';
import { JourneyStep, OnboardingProjectScanStatus } from '~shared/types/onboarding';
import {
  OnboardingDashboardAction,
  OnboardingDashboardBlockedReason,
  OnboardingDashboardFilter,
  OnboardingDashboardSurface,
  OnboardingDashboardTelemetry,
} from '~shared/types/onboarding-dashboard-telemetry';
import { renderOnboardingDashboard, setupOnboardingMock, ui } from './onboardingDashboardTestSetup';

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

// Where the events go is product-specific (Gessie on SQ-Cloud, nowhere on SQ-Server) and covered
// by the adapter tests, so this suite only checks what the dashboard reports.
jest.mock('~adapters/helpers/useOnboardingDashboardTelemetry', () => ({
  useOnboardingDashboardTelemetry: () => mockTelemetry,
}));

const mockCanCreateProjects = jest.fn<boolean, []>();
jest.mock('~adapters/helpers/useCanCreateProjects', () => ({
  useCanCreateProjects: () => mockCanCreateProjects(),
}));

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

jest.mock('~adapters/components/onboarding/ImportRepositoriesExtraCard', () => ({
  ImportRepositoriesExtraCard: () => null,
}));

setupOnboardingMock();

const SCAN_STATUS_FILTER_NAME = 'onboarding_dashboard.projects.filter.scan_status.label';
const scanStatusFilter = byRole('combobox', { name: SCAN_STATUS_FILTER_NAME });
const scannedOption = byRole('option', { name: 'onboarding_dashboard.projects.filter.scanned' });

beforeEach(() => {
  Object.values(mockTelemetry).forEach((track) => {
    track.mockClear();
  });
  mockCanCreateProjects.mockReturnValue(true);
  server.use(
    http.get('*/api/navigation/component', () =>
      HttpResponse.json({
        configuration: { canBrowseProject: true, showPermissions: true },
      }),
    ),
  );
});

it('reports the visit once, then every other step the user picks', async () => {
  const { user } = renderOnboardingDashboard();

  expect(await ui.stepperProjects.find()).toHaveAttribute('aria-pressed', 'true');
  expect(mockTelemetry.trackViewed).toHaveBeenCalledTimes(1);
  const [{ journeyState, visitId }] = mockTelemetry.trackViewed.mock.calls[0];
  expect(journeyState).toEqual(expect.objectContaining({ activeStep: JourneyStep.Projects }));
  expect(visitId).not.toBe('');

  await user.click(ui.stepperProjects.get());
  expect(mockTelemetry.trackStepSelected).not.toHaveBeenCalled();

  await user.click(ui.stepperBinding.get());
  expect(mockTelemetry.trackStepSelected).toHaveBeenCalledTimes(1);
  expect(mockTelemetry.trackStepSelected).toHaveBeenCalledWith({
    previousStep: JourneyStep.Projects,
    selectedStep: JourneyStep.Binding,
    visitId,
  });
  expect(mockTelemetry.trackViewed).toHaveBeenCalledTimes(1);
});

it('tags actions and filters with the part of the dashboard they come from', async () => {
  const { user } = renderOnboardingDashboard();

  await user.click(await scanStatusFilter.find());
  await user.click(await scannedOption.find());
  expect(mockTelemetry.trackFilterChanged).toHaveBeenLastCalledWith(
    expect.objectContaining({
      filter: OnboardingDashboardFilter.ScanStatus,
      surface: OnboardingDashboardSurface.AllProjectsTable,
      value: OnboardingProjectScanStatus.Scanned,
    }),
  );

  await user.click(ui.notScannedCta.get());
  expect(await ui.configureModal.find()).toBeInTheDocument();
  expect(mockTelemetry.trackActionSelected).toHaveBeenCalledWith(
    expect.objectContaining({
      action: OnboardingDashboardAction.ConfigureScanners,
      surface: OnboardingDashboardSurface.ProjectsPanel,
    }),
  );

  await user.click(ui.configureModal.byRole('combobox', { name: SCAN_STATUS_FILTER_NAME }).get());
  await user.click(await scannedOption.find());
  expect(mockTelemetry.trackFilterChanged).toHaveBeenLastCalledWith(
    expect.objectContaining({
      filter: OnboardingDashboardFilter.ScanStatus,
      surface: OnboardingDashboardSurface.ConfigureProjectsModal,
      value: OnboardingProjectScanStatus.Scanned,
    }),
  );
});

it('reports an action that the missing permission blocks', async () => {
  mockCanCreateProjects.mockReturnValue(false);
  const { user } = renderOnboardingDashboard();

  await user.click(await ui.notScannedCta.find());

  expect(
    await byText('onboarding_dashboard.journey.permission_required.description').find(),
  ).toBeInTheDocument();
  expect(mockTelemetry.trackActionBlocked).toHaveBeenCalledWith(
    expect.objectContaining({
      action: OnboardingDashboardAction.ConfigureScanners,
      reason: OnboardingDashboardBlockedReason.MissingCreateProjectsPermission,
      surface: OnboardingDashboardSurface.ProjectsPanel,
    }),
  );
  expect(mockTelemetry.trackActionSelected).not.toHaveBeenCalled();
});
