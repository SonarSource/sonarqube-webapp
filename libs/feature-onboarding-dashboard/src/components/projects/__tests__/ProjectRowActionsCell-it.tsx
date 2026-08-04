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

import { Table } from '@sonarsource/echoes-react';
import { waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SharedDocLink } from '~adapters/helpers/docs';
import {
  getProjectCiConfigurationUrl,
  IS_AUTOMATIC_ANALYSIS_SUPPORTED,
} from '~adapters/helpers/onboarding-actions';
import { PROJECT_BASE_URL } from '~adapters/helpers/urls';
import { server } from '~shared/api/mocks/server';
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  OnboardingDevopsPlatform,
  OnboardingProject,
  OnboardingProjectGateStatus,
  OnboardingProjectOnboarding,
  OnboardingProjectScanHealth,
  OnboardingProjectScanMethod,
} from '~shared/types/onboarding';
import { ProjectRowActionsCell } from '../ProjectRowActionsCell';

const CURRENT_USER_LOGIN = 'luke';
const PROJECT_KEY = 'identity-lib';

/** Analysed by automatic analysis: the state whose menu offers the most actions. */
const AUTOSCANNED_PROJECT: OnboardingProject = {
  alm: OnboardingDevopsPlatform.Github,
  gateStatus: OnboardingProjectGateStatus.Passed,
  key: PROJECT_KEY,
  name: PROJECT_KEY,
  onboarding: OnboardingProjectOnboarding.Analysed,
  scanHealth: OnboardingProjectScanHealth.Healthy,
  scanMethod: OnboardingProjectScanMethod.Managed,
  stale: false,
};

afterEach(() => {
  server.resetHandlers();
});

const ui = {
  actionsButton: byRole('button', {
    name: `onboarding_dashboard.projects.actions.label.${PROJECT_KEY}`,
  }),
  actionItems: byRole('menuitem'),
  configureCiAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.configure_ci',
  }),
  // The only entry that leaves the app, so its accessible name also carries the new-tab hint.
  howToRunNewScanAction: byRole('menuitem', {
    name: /^onboarding_dashboard\.projects\.action\.how_to_run_new_scan/,
  }),
  importRepositoryAction: byRole('menuitem', {
    name: 'onboarding_dashboard.projects.action.import_repository',
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

  restoreAccessModal: byRole('dialog', { name: 'global_permissions.restore_access' }),
  restoreAccessCancel: byRole('dialog', { name: 'global_permissions.restore_access' }).byRole(
    'button',
    { name: 'cancel' },
  ),
  restoreAccessConfirm: byRole('dialog', { name: 'global_permissions.restore_access' }).byRole(
    'button',
    { name: 'onboarding_dashboard.projects.action.restore_access' },
  ),
  restoreAccessSuccess: byText('onboarding_dashboard.projects.action.restore_access.success'),
  rerunSuccess: byText('onboarding_dashboard.projects.action.rerun_automatic_analysis.success'),
  rerunNotEligible: byText(
    'onboarding_dashboard.projects.action.rerun_automatic_analysis.not_eligible',
  ),
};

/**
 * How many times a single "Re-run automatic analysis" click runs: once on the products that support
 * automatic analysis, never on the others, where the menu drops the entry rather than offer a dead
 * one. Resolved here so the tests below stay free of product branching.
 */
const EXPECTED_AUTOMATIC_ANALYSIS_RUNS = IS_AUTOMATIC_ANALYSIS_SUPPORTED ? 1 : 0;

/**
 * Activates the "Re-run automatic analysis" entry. The entry is looked up as a list so that the
 * products dropping it simply have nothing to click.
 */
async function clickRerunAutomaticAnalysis(user: UserEvent) {
  await Promise.all(
    ui.rerunAutomaticAnalysisAction.queryAll().map(async (rerunAction) => user.click(rerunAction)),
  );
}

/**
 * Renders the cell inside a bare table rather than the whole dashboard: the menu contents only
 * depend on the project, so the tables and the overview would just be dead weight.
 */
function renderProjectRowActionsCell(project = AUTOSCANNED_PROJECT) {
  return renderWithRouter(
    <Table ariaLabel="onboarding_dashboard.projects.title" gridTemplate="1fr auto">
      <Table.Body>
        <Table.Row>
          <Table.Cell>{project.name}</Table.Cell>
          <ProjectRowActionsCell project={project} />
        </Table.Row>
      </Table.Body>
    </Table>,
    {
      // "Restore access" grants permissions to the current user. SQ-Cloud renders signed in by
      // default, SQ-Server anonymous, so the user is set explicitly.
      initialCurrentUser: mockLoggedInUser({ login: CURRENT_USER_LOGIN }),
    },
  );
}

it('sends a not-yet-imported repository to the project creation page', async () => {
  const { user } = renderProjectRowActionsCell({
    ...AUTOSCANNED_PROJECT,
    key: null,
    onboarding: OnboardingProjectOnboarding.NotImported,
    scanMethod: null,
  });

  await user.click(ui.actionsButton.get());

  // Neither product can deep-link the import of one repository, so the action leads to the project
  // creation page — scoped to the organization on SQ-Cloud, to the platform on SQ-Server.
  expect(await ui.importRepositoryAction.find()).toHaveAttribute(
    'href',
    expect.stringContaining('/projects/create'),
  );

  // Nothing exists in SonarQube yet, so no other action could work on this row.
  expect(ui.actionItems.getAll()).toHaveLength(1);
});

it('sends a repository bound to no platform to the project creation page too', async () => {
  const { user } = renderProjectRowActionsCell({
    ...AUTOSCANNED_PROJECT,
    alm: null,
    key: null,
    onboarding: OnboardingProjectOnboarding.NotImported,
    scanMethod: null,
  });

  await user.click(ui.actionsButton.get());

  // With no platform to preselect, SQ-Server falls back to the manual mode of the wizard, and
  // SQ-Cloud to the same organization-scoped import page as any other repository.
  expect(await ui.importRepositoryAction.find()).toHaveAttribute(
    'href',
    expect.stringContaining('/projects/create'),
  );
});

it('links an autoscanned project to its CI setup page and its project home', async () => {
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());

  // "Configure CI analysis" leads to the product's own analysis setup page for that project.
  expect(await ui.configureCiAction.find()).toHaveAttribute(
    'href',
    `${getProjectCiConfigurationUrl(PROJECT_KEY).pathname}?id=${PROJECT_KEY}`,
  );

  expect(ui.viewProjectAction.get()).toHaveAttribute(
    'href',
    `${PROJECT_BASE_URL}?id=${PROJECT_KEY}`,
  );
});

it('sends a project scanned by a CI pipeline to the scan documentation', async () => {
  const { user } = renderProjectRowActionsCell({
    ...AUTOSCANNED_PROJECT,
    scanMethod: OnboardingProjectScanMethod.Ci,
  });

  await user.click(ui.actionsButton.get());

  expect(await ui.howToRunNewScanAction.find()).toHaveAttribute(
    'href',
    expect.stringContaining(SharedDocLink.CIAnalysisSetup),
  );

  // The documentation lives outside the app, so the entry opens in a new tab.
  expect(ui.howToRunNewScanAction.get()).toHaveAttribute('target', '_blank');
});

it('grants the current user browse and administer permission on confirmation', async () => {
  const grantedPermissions: string[] = [];
  server.use(
    http.post('*/api/permissions/add_user', async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      grantedPermissions.push(
        [body.get('login'), body.get('projectKey'), body.get('permission')].join('/'),
      );

      return new HttpResponse(null, { status: 204 });
    }),
  );
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());
  await user.click(await ui.restoreAccessAction.find());

  // Restoring access changes permissions, so it asks first.
  expect(await ui.restoreAccessModal.find()).toBeInTheDocument();
  expect(grantedPermissions).toEqual([]);

  await user.click(ui.restoreAccessConfirm.get());

  expect(await ui.restoreAccessSuccess.find()).toBeInTheDocument();
  expect([...grantedPermissions].sort()).toEqual([
    `${CURRENT_USER_LOGIN}/${PROJECT_KEY}/admin`,
    `${CURRENT_USER_LOGIN}/${PROJECT_KEY}/user`,
  ]);
  await waitFor(() => {
    expect(ui.restoreAccessModal.query()).not.toBeInTheDocument();
  });
});

it('leaves the permissions untouched when the restore access modal is dismissed', async () => {
  const grantPermission = jest.fn(() => new HttpResponse(null, { status: 204 }));
  server.use(http.post('*/api/permissions/add_user', grantPermission));
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());
  await user.click(await ui.restoreAccessAction.find());
  await user.click(await ui.restoreAccessCancel.find());

  await waitFor(() => {
    expect(ui.restoreAccessModal.query()).not.toBeInTheDocument();
  });
  expect(grantPermission).not.toHaveBeenCalled();
});

it('leaves the permissions untouched when the restore access modal is closed with Escape', async () => {
  const grantPermission = jest.fn(() => new HttpResponse(null, { status: 204 }));
  server.use(http.post('*/api/permissions/add_user', grantPermission));
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());
  await user.click(await ui.restoreAccessAction.find());
  expect(await ui.restoreAccessModal.find()).toBeInTheDocument();

  // Closing the modal on its own terms, rather than through the cancel button.
  await user.keyboard('{Escape}');

  await waitFor(() => {
    expect(ui.restoreAccessModal.query()).not.toBeInTheDocument();
  });
  expect(grantPermission).not.toHaveBeenCalled();
});

it('triggers a new automatic analysis, on the products that run one', async () => {
  const eligibilityCheck = jest.fn(() => HttpResponse.json({ eligible: true }));
  server.use(http.get('*/api/autoscan/eligibility', eligibilityCheck));
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());
  expect(await ui.viewProjectAction.find()).toBeInTheDocument();

  // Automatic analysis is a SQ-Cloud feature: rather than offer a dead entry, SQ-Server drops it.
  expect(ui.rerunAutomaticAnalysisAction.queryAll()).toHaveLength(EXPECTED_AUTOMATIC_ANALYSIS_RUNS);

  await clickRerunAutomaticAnalysis(user);

  // Asking for a fresh eligibility check is what starts a new automatic analysis. It is silent by
  // design, so the outcome is reported by the row itself.
  await waitFor(() => {
    expect(eligibilityCheck).toHaveBeenCalledTimes(EXPECTED_AUTOMATIC_ANALYSIS_RUNS);
  });
  await waitFor(() => {
    expect(ui.rerunSuccess.queryAll()).toHaveLength(EXPECTED_AUTOMATIC_ANALYSIS_RUNS);
  });
});

it('does not claim an analysis started when the project is not eligible', async () => {
  server.use(http.get('*/api/autoscan/eligibility', () => HttpResponse.json({ eligible: false })));
  const { user } = renderProjectRowActionsCell();

  await user.click(ui.actionsButton.get());
  expect(await ui.viewProjectAction.find()).toBeInTheDocument();

  await clickRerunAutomaticAnalysis(user);

  // The eligibility check answers 200 even when it refuses the project, so a resolved request is
  // not enough to report a success.
  await waitFor(() => {
    expect(ui.rerunNotEligible.queryAll()).toHaveLength(EXPECTED_AUTOMATIC_ANALYSIS_RUNS);
  });
  expect(ui.rerunSuccess.query()).not.toBeInTheDocument();
});
