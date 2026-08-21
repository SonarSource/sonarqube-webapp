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

import { Button } from '@sonarsource/echoes-react';
import { waitFor } from '@testing-library/react';
import { getConfigureProjectUrl } from '~adapters/helpers/urls';
import { OnboardingServiceMock } from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole } from '~shared/helpers/testSelector';
import { OnboardingProjectsScanStatusFilter } from '~shared/types/onboarding';
import { NO_DATA } from '../../../dashboardConstants';
import { ConfigureProjectsModal } from '../ConfigureProjectsModal';

jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingOrganizationKey: jest.fn().mockReturnValue('my-org'),
}));

let onboardingMock: OnboardingServiceMock;

const OPEN_BUTTON_TRIGGER = 'open_modal';

beforeAll(() => {
  onboardingMock = new OnboardingServiceMock();
  registerServiceMocks(onboardingMock);
  HTMLElement.prototype.scrollTo = jest.fn();
});

afterEach(() => {
  onboardingMock.reset();
});

const ui = {
  openTrigger: byRole('button', { name: OPEN_BUTTON_TRIGGER }),
  modal: byRole('dialog', { name: 'onboarding_dashboard.journey.analyze.modal.title' }),
  table: byRole('table', { name: 'onboarding_dashboard.journey.analyze.modal.title' }),
  scanStatusFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.scan_status.label',
  }),
  analysisModeFilter: byRole('combobox', {
    name: 'onboarding_dashboard.projects.filter.analysis_mode.label',
  }),
  configureButton: byRole('link', {
    name: /^onboarding_dashboard\.journey\.analyze\.modal\.configure/,
  }),
  footerDocLink: byRole('link', {
    name: /^onboarding_dashboard\.journey\.analyze\.modal\.how_to_configure/,
  }),
};

async function renderModal(defaultScanStatus?: OnboardingProjectsScanStatusFilter) {
  const result = renderWithRouter(
    <ConfigureProjectsModal defaultScanStatus={defaultScanStatus}>
      <Button>{OPEN_BUTTON_TRIGGER}</Button>
    </ConfigureProjectsModal>,
  );
  await result.user.click(ui.openTrigger.get());
  return result;
}

it('displays correct onboarding and analysis-mode badges for each row', async () => {
  await renderModal();

  await ui.table.byText('platform-jobs').find();

  // Onboarding badges, one per distinct state in the mock fixture.
  expect(
    ui.table.byText('onboarding_dashboard.projects.onboarding.not_onboarded').get(),
  ).toBeInTheDocument(); // platform-jobs: NOT_IMPORTED
  expect(
    ui.table.byText('onboarding_dashboard.projects.onboarding.scan_failed').get(),
  ).toBeInTheDocument(); // payments-gateway: scan health failed
  expect(ui.table.byText('onboarding_dashboard.projects.onboarding.scanned').getAll()).toHaveLength(
    2,
  ); // web-core + identity-lib: ANALYSED
  expect(
    ui.table.byText('onboarding_dashboard.projects.onboarding.imported_empty').get(),
  ).toBeInTheDocument(); // mobile-worker: IMPORTED_EMPTY

  // Analysis-mode badges.
  expect(
    ui.table.byText('onboarding_dashboard.projects.analysis.full_ci').get(),
  ).toBeInTheDocument(); // payments-gateway: CI
  expect(ui.table.byText('onboarding_dashboard.projects.analysis.local').get()).toBeInTheDocument(); // web-core: Local
  expect(ui.table.byText('onboarding_dashboard.projects.analysis.autoscan').getAll()).toHaveLength(
    2,
  ); // identity-lib + mobile-worker: Managed
  expect(ui.table.byText('none').get()).toBeInTheDocument(); // platform-jobs: NOT_IMPORTED
});

it('shows NO_DATA in the last-scan column only for not-imported projects', async () => {
  await renderModal();

  await ui.table.byText('platform-jobs').find();

  // Only platform-jobs is NOT_IMPORTED, the remaining four have lastScan set.
  expect(ui.table.byText(NO_DATA).getAll()).toHaveLength(1);
});

it('renders a link to the doc in the footer', async () => {
  await renderModal();

  expect(await ui.footerDocLink.find()).toHaveAttribute(
    'href',
    expect.stringContaining('https://docs.sonarsource.com'),
  );
});

it('renders a configure button for imported but not CI-configured projects', async () => {
  await renderModal();

  await ui.table.byText('mobile-worker').find();

  // platform-jobs is not imported, payments-gateway is imported and CI-configured, only 3 remaining
  expect(ui.configureButton.getAll()).toHaveLength(3);
  const { pathname, search } = getConfigureProjectUrl('web-core');
  expect(ui.configureButton.getAll()[0]).toHaveAttribute(
    'href',
    expect.stringContaining(`${pathname}${search}`),
  );
});

it('renders the scan-status and analysis-mode filters', async () => {
  await renderModal();

  expect(ui.scanStatusFilter.get()).toBeInTheDocument();
  expect(ui.analysisModeFilter.get()).toBeInTheDocument();
});

it('lists all scan-status options', async () => {
  const { user } = await renderModal();

  await user.click(await ui.scanStatusFilter.find());

  expect(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.all' }).find(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.scanned' }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.not_scanned' }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.not_onboarded' }).get(),
  ).toBeInTheDocument();
});

it('lists all analysis-mode options', async () => {
  const { user } = await renderModal();

  await user.click(await ui.analysisModeFilter.find());

  expect(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.all' }).find(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.ci' }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.autoscan' }).get(),
  ).toBeInTheDocument();
  expect(
    byRole('option', { name: 'onboarding_dashboard.projects.filter.no_analysis_mode' }).get(),
  ).toBeInTheDocument();
});

it('filters the project list by scan status', async () => {
  const { user } = await renderModal();

  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();

  await user.click(ui.scanStatusFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.not_onboarded' }).find(),
  );

  // Only platform-jobs is NOT_IMPORTED (not_onboarded).
  await waitFor(() => {
    expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).not.toBeInTheDocument();
});

it('filters the project list by analysis mode', async () => {
  const { user } = await renderModal();

  expect(await ui.table.byText('identity-lib').find()).toBeInTheDocument();

  await user.click(ui.analysisModeFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.autoscan' }).find(),
  );

  // identity-lib and mobile-worker use Managed (autoscan).
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('identity-lib').get()).toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').get()).toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
});

it('ANDs the scan-status and analysis-mode filters', async () => {
  const { user } = await renderModal();

  expect(await ui.table.byText('identity-lib').find()).toBeInTheDocument();

  // Scanned filter: payments-gateway, web-core, identity-lib remain.
  await user.click(ui.scanStatusFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.scanned' }).find(),
  );
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });

  // Autoscan filter applied on top: only identity-lib matches both.
  await user.click(ui.analysisModeFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.autoscan' }).find(),
  );
  await waitFor(() => {
    expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('identity-lib').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
});

it('applies the defaultScanStatus prop as the initial filter when the modal opens', async () => {
  // not_scanned maps to IMPORTED_EMPTY, only mobile-worker matches.
  await renderModal(OnboardingProjectsScanStatusFilter.NotScanned);

  expect(await ui.table.byText('mobile-worker').find()).toBeInTheDocument();
  expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
});
