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
import { http, HttpResponse } from 'msw';
import {
  ANALYSIS_MODE_FILTER_OPTIONS,
  getProjectCiConfigurationUrl,
  IS_AUTOMATIC_ANALYSIS_SUPPORTED,
} from '~adapters/helpers/onboarding-actions';
import { useCanCreateProjects } from '~adapters/helpers/useCanCreateProjects';
import { useEditPermissionsUrl } from '~adapters/helpers/useEditPermissionsUrl';
import { OnboardingServiceMock } from '~shared/api/mocks/OnboardingServiceMock';
import { registerServiceMocks, server } from '~shared/api/mocks/server';
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingProjectScanStatus } from '~shared/types/onboarding';
import { NO_DATA } from '../../../dashboardConstants';
import { ConfigureProjectsModal } from '../ConfigureProjectsModal';

jest.mock('~adapters/helpers/useCanCreateProjects', () => ({
  useCanCreateProjects: jest.fn(),
}));

jest.mock('~adapters/helpers/useEditPermissionsUrl', () => ({
  useEditPermissionsUrl: jest.fn(),
}));

jest.mock('~adapters/queries/onboarding', () => ({
  ...jest.requireActual<typeof import('~adapters/queries/onboarding')>(
    '~adapters/queries/onboarding',
  ),
  useOnboardingOrganizationKey: jest.fn().mockReturnValue('my-org'),
}));

let onboardingMock: OnboardingServiceMock;
let hasProjectAccess = true;

const OPEN_BUTTON_TRIGGER = 'open_modal';

/** Autoscan is offered on SQC and hidden on SQS, which has no automatic analysis. */
const AUTOSCAN_FILTER_OPTIONS_COUNT = IS_AUTOMATIC_ANALYSIS_SUPPORTED ? 1 : 0;

beforeAll(() => {
  onboardingMock = new OnboardingServiceMock();
  registerServiceMocks(onboardingMock);
  HTMLElement.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  hasProjectAccess = true;
  server.use(
    http.get('*/api/navigation/component', () =>
      HttpResponse.json({
        configuration: {
          canBrowseProject: hasProjectAccess,
          showPermissions: hasProjectAccess,
        },
      }),
    ),
  );
  jest.mocked(useCanCreateProjects).mockReturnValue(true);
  jest.mocked(useEditPermissionsUrl).mockReturnValue({ pathname: '/admin/permissions' });
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
  actionsButton: (name: string) =>
    byRole('button', { name: `onboarding_dashboard.projects.actions.label.${name}` }),
  configureCiAction: byRole('menuitem', {
    // Opens in a new tab, so its accessible name also carries the new-tab hint.
    name: /^onboarding_dashboard\.projects\.action\.configure_ci/,
  }),
  howToRunNewScanAction: byRole('menuitem', {
    name: /^onboarding_dashboard\.projects\.action\.how_to_run_new_scan/,
  }),
  restoreAccessAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.restore_access',
  }),
  permissionPopover: byText('onboarding_dashboard.journey.permission_required.description'),
  restoreAccessModal: byRole('dialog', { name: 'global_permissions.restore_access' }),
  footerDocLink: byRole('link', {
    name: /^onboarding_dashboard\.journey\.analyze\.modal\.how_to_configure/,
  }),
};

async function renderModal(defaultScanStatus?: OnboardingProjectScanStatus) {
  const result = renderWithRouter(
    <ConfigureProjectsModal defaultScanStatus={defaultScanStatus}>
      <Button>{OPEN_BUTTON_TRIGGER}</Button>
    </ConfigureProjectsModal>,
    { initialCurrentUser: mockLoggedInUser({ login: 'luke' }) },
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
    ui.table.byText('onboarding_dashboard.projects.onboarding.not_scanned').getAll(),
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

it('offers the project row actions menu on every row with something to act on', async () => {
  await renderModal();

  await ui.table.byText('mobile-worker').find();

  for (const name of ['payments-gateway', 'identity-lib', 'platform-jobs', 'mobile-worker']) {
    expect(ui.actionsButton(name).get()).toBeInTheDocument();
  }
  // Scanned with no CI/automatic analysis mode: no action applies, and the name links to it.
  expect(ui.actionsButton('web-core').query()).not.toBeInTheDocument();
});

it('links each project name to its project', async () => {
  await renderModal();

  const { pathname, search } = getProjectOverviewUrl('platform-jobs');
  expect(await ui.table.byRole('link', { name: 'platform-jobs' }).find()).toHaveAttribute(
    'href',
    expect.stringContaining(`${pathname}${search}`),
  );
});

it('offers to configure the CI analysis of a project that is not analysed yet, in a new tab', async () => {
  const componentNavigation = jest.fn(() =>
    HttpResponse.json({ configuration: { canBrowseProject: true, showPermissions: true } }),
  );
  server.use(http.get('*/api/navigation/component', componentNavigation));
  const { user } = await renderModal();

  await user.click(await ui.actionsButton('platform-jobs').find());

  const { pathname, search } = getProjectCiConfigurationUrl('platform-jobs');
  expect(await ui.configureCiAction.find()).toHaveAttribute(
    'href',
    expect.stringContaining(`${pathname}${search}`),
  );
  expect(ui.configureCiAction.get()).toHaveAttribute('target', '_blank');

  await waitFor(() => {
    expect(componentNavigation).toHaveBeenCalled();
  });

  expect(ui.restoreAccessAction.query()).not.toBeInTheDocument();
});

it('offers guidance on scanning again for a project analysed by a CI pipeline', async () => {
  const { user } = await renderModal();

  await user.click(await ui.actionsButton('payments-gateway').find());

  expect(await ui.howToRunNewScanAction.find()).toBeInTheDocument();
  expect(ui.configureCiAction.query()).not.toBeInTheDocument();
});

it('restores project access from the row actions menu', async () => {
  hasProjectAccess = false;
  const grantedPermissions: Array<string | null> = [];
  server.use(
    http.post('*/api/permissions/add_user', async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      grantedPermissions.push(body.get('permission'));
      return new HttpResponse(null, { status: 204 });
    }),
  );
  const { user } = await renderModal();

  await user.click(await ui.actionsButton('platform-jobs').find());
  const restoreAccessAction = await ui.restoreAccessAction.find();
  // Without access the CI setup page would refuse the reader, so it is not offered.
  expect(ui.configureCiAction.query()).not.toBeInTheDocument();
  await user.click(restoreAccessAction);

  await user.click(
    await ui.restoreAccessModal
      .byRole('button', { name: 'onboarding_dashboard.projects.action.restore_access' })
      .find(),
  );

  await waitFor(() => {
    expect(grantedPermissions.sort()).toEqual(['admin', 'user']);
  });
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

it('explains the missing permission when the user lacks it', async () => {
  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  const { user } = await renderModal();

  await user.click(await ui.actionsButton('platform-jobs').find());

  expect(await ui.permissionPopover.find()).toBeInTheDocument();
  expect(ui.configureCiAction.query()).not.toBeInTheDocument();
  expect(ui.restoreAccessAction.query()).not.toBeInTheDocument();
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
