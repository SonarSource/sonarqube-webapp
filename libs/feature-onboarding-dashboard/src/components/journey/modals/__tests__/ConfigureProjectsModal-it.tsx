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
import {
  ANALYSIS_MODE_FILTER_OPTIONS,
  IS_AUTOMATIC_ANALYSIS_SUPPORTED,
} from '~adapters/helpers/onboarding-actions';
import { getConfigureProjectUrl } from '~adapters/helpers/urls';
import { OnboardingServiceMock } from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks } from '~shared/api/mocks/server';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole } from '~shared/helpers/testSelector';
import { OnboardingProjectScanStatus } from '~shared/types/onboarding';
import { NO_DATA } from '../../../dashboardConstants';
import { ConfigureProjectsModal } from '../ConfigureProjectsModal';

jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingOrganizationKey: jest.fn().mockReturnValue('my-org'),
}));

let onboardingMock: OnboardingServiceMock;

const OPEN_BUTTON_TRIGGER = 'open_modal';

/** Autoscan is offered on SQC and hidden on SQS, which has no automatic analysis. */
const AUTOSCAN_FILTER_OPTIONS_COUNT = IS_AUTOMATIC_ANALYSIS_SUPPORTED ? 1 : 0;

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
  option: (labelKey: string) => byRole('option', { name: labelKey }),
  configureButton: byRole('link', {
    name: /^onboarding_dashboard\.journey\.analyze\.modal\.configure/,
  }),
  footerDocLink: byRole('link', {
    name: /^onboarding_dashboard\.journey\.analyze\.modal\.how_to_configure/,
  }),
};

async function renderModal(defaultScanStatus?: OnboardingProjectScanStatus) {
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

  // Onboarding badges, driven by scanStatus. PROJECT_HEALTH_FEATURE_ENABLED is off, so
  // payments-gateway's failed scan health doesn't change its badge.
  expect(ui.table.byText('onboarding_dashboard.projects.onboarding.scanned').getAll()).toHaveLength(
    3,
  ); // payments-gateway + web-core + identity-lib: SCANNED
  expect(
    ui.table.byText('onboarding_dashboard.projects.onboarding.imported_empty').getAll(),
  ).toHaveLength(2); // platform-jobs + mobile-worker: NOT_SCANNED

  // Analysis-mode badges.
  expect(
    ui.table.byText('onboarding_dashboard.projects.analysis.full_ci').get(),
  ).toBeInTheDocument(); // payments-gateway: CI
  expect(
    ui.table.byText('onboarding_dashboard.projects.analysis.autoscan').get(),
  ).toBeInTheDocument(); // identity-lib: AUTOMATIC
  expect(ui.table.byText('none').getAll()).toHaveLength(3); // platform-jobs, web-core, mobile-worker: NONE
});

it('shows NO_DATA in the last-scan column only for projects with no scan', async () => {
  await renderModal();

  await ui.table.byText('platform-jobs').find();

  // Only platform-jobs and mobile-worker have no lastScan set.
  expect(ui.table.byText(NO_DATA).getAll()).toHaveLength(2);
});

it('renders a link to the doc in the footer', async () => {
  await renderModal();

  expect(await ui.footerDocLink.find()).toHaveAttribute(
    'href',
    expect.stringContaining('https://docs.sonarsource.com'),
  );
});

it('renders a configure button for every project not already on a CI pipeline', async () => {
  await renderModal();

  await ui.table.byText('mobile-worker').find();

  // Only payments-gateway is CI-configured; the other four all get a configure button.
  expect(ui.configureButton.getAll()).toHaveLength(4);
  const { pathname, search } = getConfigureProjectUrl('web-core');
  expect(
    byRole('row', { name: /web-core/ })
      .byRole('link', {
        name: /^onboarding_dashboard\.journey\.analyze\.modal\.configure/,
      })
      .get(),
  ).toHaveAttribute('href', expect.stringContaining(`${pathname}${search}`));
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
});

it('lists the analysis-mode options of the platform it runs on, and nothing else', async () => {
  const { user } = await renderModal();

  await user.click(await ui.analysisModeFilter.find());

  await ui.option('onboarding_dashboard.projects.filter.all').find();

  // Only the platform's own adapter knows which modes exist there, and counting the options is what
  // catches a hardcoded list of modes creeping back into this shared component.
  expect(byRole('option').getAll()).toHaveLength(ANALYSIS_MODE_FILTER_OPTIONS.length);
  ANALYSIS_MODE_FILTER_OPTIONS.forEach(({ labelKey }) => {
    expect(ui.option(labelKey).get()).toBeInTheDocument();
  });

  expect(ui.option('onboarding_dashboard.projects.filter.autoscan').queryAll()).toHaveLength(
    AUTOSCAN_FILTER_OPTIONS_COUNT,
  );
});

it('filters the project list by scan status', async () => {
  const { user } = await renderModal();

  expect(await ui.table.byText('platform-jobs').find()).toBeInTheDocument();

  await user.click(ui.scanStatusFilter.get());
  await user.click(
    await byRole('option', { name: 'onboarding_dashboard.projects.filter.not_scanned' }).find(),
  );

  // platform-jobs and mobile-worker are NOT_SCANNED.
  await waitFor(() => {
    expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').get()).toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
});

it('filters the project list by analysis mode', async () => {
  // CI rather than autoscan: it is the one mode both platforms offer, and SQS drops the autoscan
  // option entirely.
  const { user } = await renderModal();

  expect(await ui.table.byText('identity-lib').find()).toBeInTheDocument();

  await user.click(ui.analysisModeFilter.get());
  await user.click(await ui.option('onboarding_dashboard.projects.filter.ci').find());

  // Only payments-gateway is analysed by CI.
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('payments-gateway').get()).toBeInTheDocument();
  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).not.toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
});

it('ANDs the scan-status and analysis-mode filters', async () => {
  const { user } = await renderModal();

  expect(await ui.table.byText('identity-lib').find()).toBeInTheDocument();

  // Scanned filter: payments-gateway, web-core, identity-lib remain.
  await user.click(ui.scanStatusFilter.get());
  await user.click(await ui.option('onboarding_dashboard.projects.filter.scanned').find());
  await waitFor(() => {
    expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  });

  // "No analysis mode" applied on top: web-core is the only scanned project with no mode, so
  // dropping the scan status would bring platform-jobs and mobile-worker back.
  await user.click(ui.analysisModeFilter.get());
  await user.click(await ui.option('onboarding_dashboard.projects.filter.no_analysis_mode').find());
  await waitFor(() => {
    expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  });
  expect(ui.table.byText('web-core').get()).toBeInTheDocument();
  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
  expect(ui.table.byText('platform-jobs').query()).not.toBeInTheDocument();
  expect(ui.table.byText('mobile-worker').query()).not.toBeInTheDocument();
});

it('applies the defaultScanStatus prop as the initial filter when the modal opens', async () => {
  // platform-jobs and mobile-worker are NOT_SCANNED.
  await renderModal(OnboardingProjectScanStatus.NotScanned);

  expect(await ui.table.byText('mobile-worker').find()).toBeInTheDocument();
  expect(ui.table.byText('platform-jobs').get()).toBeInTheDocument();
  expect(ui.table.byText('payments-gateway').query()).not.toBeInTheDocument();
  expect(ui.table.byText('web-core').query()).not.toBeInTheDocument();
  expect(ui.table.byText('identity-lib').query()).not.toBeInTheDocument();
});
