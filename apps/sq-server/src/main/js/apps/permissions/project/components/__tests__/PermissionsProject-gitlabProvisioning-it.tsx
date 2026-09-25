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

import userEvent from '@testing-library/user-event';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockGitHubConfiguration } from '~sq-server-commons/helpers/mocks/dop-translation';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Feature } from '~sq-server-commons/types/features';
import { Permissions } from '~sq-server-commons/types/permissions';
import { ProvisioningType } from '~sq-server-commons/types/provisioning';
import { TaskStatuses } from '~sq-server-commons/types/tasks';
import { Provider } from '~sq-server-commons/types/types';
import { getPageObject } from '../../../test-utils';

import {
  almHandler,
  dopTranslationHandler,
  expectManagedPermissionsProject,
  expectPermissionsToRemainEditable,
  expectVisibilityChangeAllowed,
  expectVisibilityChangeBlocked,
  gitlabHandler,
  renderPermissionsProjectApp,
  setupPermissionsProjectTests,
  systemHandler,
} from './test-utils';

jest.mock('~sq-server-commons/api/mode', () => ({
  getMode: jest.fn().mockResolvedValue({ mode: 'MQR', modified: false }),
}));

setupPermissionsProjectTests();

describe('GitLab provisioning', () => {
  beforeEach(async () => {
    systemHandler.setProvider(Provider.Gitlab);

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });
  });

  it('should not allow to change visibility for GitLab Project with auto-provisioning', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);
    gitlabHandler.setGitlabProvisioningEnabled(true);

    dopTranslationHandler.gitHubConfigurations.push(
      mockGitHubConfiguration({ provisioningType: ProvisioningType.jit }),
    );

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeBlocked(ui);
    expect(ui.visibilityReadonlyGitlabExplanation.get()).toBeInTheDocument();
  });

  it('should allow to change visibility for non-GitLab Project', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);

    await almHandler.handleSetProjectBinding(AlmKeys.GitHub, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeAllowed(ui);
  });

  it('should allow to change visibility for GitLab Project with disabled auto-provisioning', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeAllowed(ui);
  });

  it('should have disabled permissions for GitLab Project', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);
    gitlabHandler.setGitlabProvisioningEnabled(true);

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp(
      {},
      { featureList: [Feature.GitlabProvisioning] },
      {
        component: mockComponent({ visibility: Visibility.Private }),
      },
    );

    await ui.appLoaded();
    await expectManagedPermissionsProject(ui, user, ui.gitlabExplanations, ui.gitlabLogo);
  });

  it('should show the GitLab synchronisation status for a managed GitLab Project', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    gitlabHandler.setGitlabProvisioningEnabled(true);
    gitlabHandler.addProvisioningTask({
      status: TaskStatuses.Success,
      executedAt: '2022-02-03T11:45:35+0200',
    });

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    expect(await ui.provisioningSyncSuccess.find()).toBeInTheDocument();
  });

  it('should hide the sync details link from a project admin without global admin rights', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    gitlabHandler.setGitlabProvisioningEnabled(true);
    gitlabHandler.addProvisioningTask({
      status: TaskStatuses.Success,
      executedAt: '2022-02-03T11:45:35+0200',
      warnings: ['Some warning'],
    });

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    expect(await ui.provisioningSyncSuccess.find()).toBeInTheDocument();
    expect(ui.provisioningSyncDetailsLink.query()).not.toBeInTheDocument();
  });

  it('should show the sync details link to a global admin', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    gitlabHandler.setGitlabProvisioningEnabled(true);
    gitlabHandler.addProvisioningTask({
      status: TaskStatuses.Success,
      executedAt: '2022-02-03T11:45:35+0200',
      warnings: ['Some warning'],
    });

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp(
      {},
      {
        featureList: [Feature.GitlabProvisioning],
        currentUser: mockLoggedInUser({ permissions: { global: [Permissions.Admin] } }),
      },
    );
    await ui.appLoaded();

    expect(await ui.provisioningSyncDetailsLink.find()).toHaveAttribute(
      'href',
      '/admin/settings?category=authentication&tab=gitlab',
    );
  });

  it('should allow to change permissions for GitLab Project without auto-provisioning', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);

    await almHandler.handleSetProjectBinding(AlmKeys.GitLab, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp(
      { visibility: Visibility.Private },
      { featureList: [Feature.GitlabProvisioning] },
    );

    await ui.appLoaded();

    expect(ui.pageTitle.get()).toBeInTheDocument();
    expect(ui.pageTitle.byRole('img').query()).not.toBeInTheDocument();
    expectPermissionsToRemainEditable(ui);
  });

  it('should allow to change permissions for non-GitLab Project', async () => {
    const user = userEvent.setup();
    almHandler.reset();
    gitlabHandler.setGitlabProvisioningEnabled(true);

    await almHandler.handleSetProjectBinding(AlmKeys.BitbucketServer, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    const ui = getPageObject(user);

    renderPermissionsProjectApp({}, { featureList: [Feature.GitlabProvisioning] });
    await ui.appLoaded();

    expect(await ui.pageTitle.find()).toBeInTheDocument();
    expect(ui.nonGLProjectWarning.get()).toBeInTheDocument();
    expect(ui.pageTitle.byRole('img').query()).not.toBeInTheDocument();
    expectPermissionsToRemainEditable(ui);
  });

  it.each([ComponentQualifier.Portfolio, ComponentQualifier.Application])(
    'should not show sync warning for portfolio and applications',
    async (qualifier) => {
      const user = userEvent.setup();
      almHandler.reset();
      gitlabHandler.setGitlabProvisioningEnabled(true);

      await almHandler.handleSetProjectBinding(AlmKeys.BitbucketServer, {
        almSetting: 'test',
        repository: 'test',
        monorepo: false,
        project: 'my-project',
      });

      const ui = getPageObject(user);

      renderPermissionsProjectApp({ qualifier }, { featureList: [Feature.GitlabProvisioning] });
      await ui.appLoaded();

      expect(ui.pageTitle.get()).toBeInTheDocument();
      expect(ui.nonGLProjectWarning.query()).not.toBeInTheDocument();
    },
  );
});
