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

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { registerServiceMocks, resetServiceMocks } from '~shared/api/mocks/server';

import {
  BranchesServiceDefaultDataset,
  BranchesServiceMock,
} from '~shared/api/mocks/services/BranchesServiceMock';

import {
  MeasuresServiceDefaultDataset,
  MeasuresServiceMock,
} from '~shared/api/mocks/services/MeasuresServiceMock';

import { Visibility } from '~shared/types/component';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import GithubProvisioningServiceMock from '~sq-server-commons/api/mocks/GithubProvisioningServiceMock';
import GitlabProvisioningServiceMock from '~sq-server-commons/api/mocks/GitlabProvisioningServiceMock';
import PermissionsServiceMock from '~sq-server-commons/api/mocks/PermissionsServiceMock';
import ProjectManagementServiceMock from '~sq-server-commons/api/mocks/ProjectsManagementServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import SystemServiceMock from '~sq-server-commons/api/mocks/SystemServiceMock';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';

import {
  RenderContext,
  renderAppWithComponentContext,
} from '~sq-server-commons/helpers/testReactTestingUtils';

import { ComponentContextShape } from '~sq-server-commons/types/component';
import { Feature } from '~sq-server-commons/types/features';
import { Permissions } from '~sq-server-commons/types/permissions';
import { Component } from '~sq-server-commons/types/types';
import { projectPermissionsRoutes } from '../../../routes';
import { getPageObject } from '../../../test-utils';
// Eagerly load the lazy-loaded CodingRulesApp chunk so its (potentially cold)
// transform + module-eval cost is paid at module-load time, outside the findBy
// timeout window. Prevents cold-transform-cache flakes on the first test in CI.
import '../PermissionsProjectApp';

const branchesService = new BranchesServiceMock(BranchesServiceDefaultDataset);
const measuresService = new MeasuresServiceMock(MeasuresServiceDefaultDataset);

const serviceMock = new PermissionsServiceMock();
const dopTranslationHandler = new DopTranslationServiceMock();
const githubHandler = new GithubProvisioningServiceMock(dopTranslationHandler);
const gitlabHandler = new GitlabProvisioningServiceMock();
const almHandler = new AlmSettingsServiceMock();
const settingsHandler = new SettingsServiceMock();
const projectHandler = new ProjectManagementServiceMock(settingsHandler);
const systemHandler = new SystemServiceMock();

type PermissionsProjectPageObject = ReturnType<typeof getPageObject>;
type PermissionExplanation = PermissionsProjectPageObject['githubExplanations'];
type PermissionLogo = PermissionsProjectPageObject['githubLogo'];

function getRowContainingText(text: string) {
  const row = screen.getByRole('row', { name: new RegExp(escapeRegExp(text)) });

  if (!(row instanceof HTMLElement)) {
    throw new Error(`Could not find permissions row for "${text}"`);
  }

  return row;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function expectPermissionsToRemainEditable(ui: PermissionsProjectPageObject) {
  expect(ui.applyTemplateBtn.get()).toBeInTheDocument();

  // no restrictions
  expect(
    screen.getAllByRole('checkbox').every((item) => item.getAttribute('aria-disabled') === 'true'),
  ).toBe(false);
}

async function expectManagedPermissionsProject(
  ui: PermissionsProjectPageObject,
  user: UserEvent,
  explanation: PermissionExplanation,
  logo: PermissionLogo,
) {
  expect(await ui.pageTitle.find()).toBeInTheDocument();

  await waitFor(() => {
    expect(ui.pageTitle.get()).toHaveAccessibleName(/project_permission.managed/);
  });

  expect(ui.pageTitle.byRole('img').get()).toBeInTheDocument();
  expect(explanation.get()).toBeInTheDocument();

  expect(ui.projectPermissionCheckbox('John', Permissions.Admin).get()).toBeChecked();

  expect(ui.projectPermissionCheckbox('John', Permissions.Admin).get()).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  expect(ui.projectPermissionCheckbox('Alexa', Permissions.IssueAdmin).get()).toBeChecked();
  expect(ui.projectPermissionCheckbox('Alexa', Permissions.IssueAdmin).get()).toBeEnabled();
  await ui.toggleProjectPermission('Alexa', Permissions.IssueAdmin);
  expect(ui.confirmRemovePermissionDialog.get()).toBeInTheDocument();

  expect(ui.confirmRemovePermissionDialog.get()).toHaveTextContent(
    `${Permissions.IssueAdmin}Alexa`,
  );

  await user.click(ui.confirmRemovePermissionDialog.byRole('button', { name: 'confirm' }).get());
  expect(ui.projectPermissionCheckbox('Alexa', Permissions.IssueAdmin).get()).not.toBeChecked();

  expect(ui.projectPermissionCheckbox('sonar-users', Permissions.Browse).get()).toBeChecked();
  expect(ui.projectPermissionCheckbox('sonar-users', Permissions.Browse).get()).toBeEnabled();
  await ui.toggleProjectPermission('sonar-users', Permissions.Browse);
  expect(ui.confirmRemovePermissionDialog.get()).toBeInTheDocument();

  expect(ui.confirmRemovePermissionDialog.get()).toHaveTextContent(
    `${Permissions.Browse}sonar-users`,
  );

  await user.click(ui.confirmRemovePermissionDialog.byRole('button', { name: 'confirm' }).get());
  expect(ui.projectPermissionCheckbox('sonar-users', Permissions.Browse).get()).not.toBeChecked();
  expect(ui.projectPermissionCheckbox('sonar-admins', Permissions.Admin).get()).toBeChecked();

  expect(ui.projectPermissionCheckbox('sonar-admins', Permissions.Admin).get()).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  const johnRow = getRowContainingText('John');
  expect(johnRow).toHaveTextContent('John');
  expect(logo.get(johnRow)).toBeInTheDocument();
  const alexaRow = getRowContainingText('Alexa');
  expect(alexaRow).toHaveTextContent('Alexa');
  expect(logo.query(alexaRow)).not.toBeInTheDocument();
  const usersGroupRow = getRowContainingText('sonar-users');
  expect(usersGroupRow).toHaveTextContent('sonar-users');
  expect(logo.query(usersGroupRow)).not.toBeInTheDocument();
  const adminsGroupRow = getRowContainingText('sonar-admins');
  expect(adminsGroupRow).toHaveTextContent('sonar-admins');
  expect(logo.query(adminsGroupRow)).toBeInTheDocument();

  expect(ui.applyTemplateBtn.query()).not.toBeInTheDocument();

  // not possible to grant permissions at all
  expect(
    screen
      .getAllByRole('checkbox', { checked: false })
      .every((item) => item.getAttribute('aria-disabled') === 'true'),
  ).toBe(true);
}

async function expectVisibilityChangeAllowed(ui: PermissionsProjectPageObject) {
  expect(await ui.visibilityRadio(Visibility.Public).find()).toBeInTheDocument();
  expect(ui.visibilityRadio(Visibility.Public).get()).not.toHaveClass('disabled');
  expect(ui.visibilityRadio(Visibility.Public).get()).toBeChecked();
  expect(ui.visibilityRadio(Visibility.Private).get()).not.toHaveClass('disabled');
  await ui.turnProjectPrivate();
  expect(ui.visibilityRadio(Visibility.Private).get()).toBeChecked();
}

async function expectVisibilityChangeBlocked(ui: PermissionsProjectPageObject) {
  expect(await ui.visibilityRadio(Visibility.Public).find()).toBeInTheDocument();
  expect(ui.visibilityRadio(Visibility.Public).get()).toBeDisabled();
  expect(ui.visibilityRadio(Visibility.Public).get()).toBeChecked();
  expect(ui.visibilityRadio(Visibility.Private).get()).toBeDisabled();
  await ui.turnProjectPrivate();
  expect(ui.visibilityRadio(Visibility.Private).get()).not.toBeChecked();
}

function setupPermissionsProjectTests() {
  beforeEach(() => {
    registerServiceMocks(branchesService, measuresService);
  });

  afterEach(() => {
    resetServiceMocks();

    serviceMock.reset();
    dopTranslationHandler.reset();
    githubHandler.reset();
    gitlabHandler.reset();
    almHandler.reset();
    settingsHandler.reset();
    projectHandler.reset();
    systemHandler.reset();
  });
}

function renderPermissionsProjectApp(
  override: Partial<Component> = {},
  contextOverride: Partial<RenderContext> = {},
  componentContextOverride: Partial<ComponentContextShape> = {},
) {
  return renderAppWithComponentContext(
    'project_roles?id=my-project',
    projectPermissionsRoutes,
    // Architecture is available by default so the standard permission tests exercise the full
    // project permission set; the dedicated negative test opts out with `{ featureList: [] }`.
    { featureList: [Feature.Architecture], ...contextOverride },
    {
      component: mockComponent({
        visibility: Visibility.Public,
        configuration: {
          canUpdateProjectVisibilityToPrivate: true,
          canApplyPermissionTemplate: true,
        },
        ...override,
      }),
      ...componentContextOverride,
    },
  );
}

export {
  almHandler,
  dopTranslationHandler,
  expectManagedPermissionsProject,
  expectPermissionsToRemainEditable,
  expectVisibilityChangeAllowed,
  expectVisibilityChangeBlocked,
  gitlabHandler,
  projectHandler,
  renderPermissionsProjectApp,
  serviceMock,
  setupPermissionsProjectTests,
  systemHandler,
};
