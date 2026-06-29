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
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Feature } from '~sq-server-commons/types/features';
import { ProvisioningType } from '~sq-server-commons/types/provisioning';
import { Provider } from '~sq-server-commons/types/types';
import { getPageObject } from '../../../test-utils';

import {
  almHandler,
  dopTranslationHandler,
  expectManagedPermissionsProject,
  expectPermissionsToRemainEditable,
  expectVisibilityChangeAllowed,
  expectVisibilityChangeBlocked,
  renderPermissionsProjectApp,
  setupPermissionsProjectTests,
  systemHandler,
} from './test-utils';

jest.mock('~sq-server-commons/api/mode', () => ({
  getMode: jest.fn().mockResolvedValue({ mode: 'MQR', modified: false }),
}));

setupPermissionsProjectTests();

describe('GitHub provisioning', () => {
  beforeEach(() => {
    systemHandler.setProvider(Provider.Github);
  });

  it('should not allow to change visibility for GH Project with auto-provisioning', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);

    dopTranslationHandler.gitHubConfigurations.push(
      mockGitHubConfiguration({ provisioningType: ProvisioningType.auto }),
    );

    await almHandler.handleSetProjectBinding(AlmKeys.GitHub, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GithubProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeBlocked(ui);
  });

  it('should allow to change visibility for non-GH Project', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);

    dopTranslationHandler.gitHubConfigurations.push(
      mockGitHubConfiguration({ provisioningType: ProvisioningType.auto }),
    );

    await almHandler.handleSetProjectBinding(AlmKeys.Azure, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GithubProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeAllowed(ui);
  });

  it('should allow to change visibility for GH Project with disabled auto-provisioning', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);
    dopTranslationHandler.gitHubConfigurations.push(mockGitHubConfiguration());

    await almHandler.handleSetProjectBinding(AlmKeys.GitHub, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp({}, { featureList: [Feature.GithubProvisioning] });
    await ui.appLoaded();

    await expectVisibilityChangeAllowed(ui);
  });

  it('should have disabled permissions for GH Project', async () => {
    expect.hasAssertions();
    const user = userEvent.setup();
    const ui = getPageObject(user);

    dopTranslationHandler.gitHubConfigurations.push(
      mockGitHubConfiguration({ provisioningType: ProvisioningType.auto }),
    );

    await almHandler.handleSetProjectBinding(AlmKeys.GitHub, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp(
      {},
      { featureList: [Feature.GithubProvisioning] },
      {
        component: mockComponent({ visibility: Visibility.Private }),
      },
    );

    await ui.appLoaded();
    await expectManagedPermissionsProject(ui, user, ui.githubExplanations, ui.githubLogo);
  });

  it('should allow to change permissions for GH Project without auto-provisioning', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);
    dopTranslationHandler.gitHubConfigurations.push(mockGitHubConfiguration());

    await almHandler.handleSetProjectBinding(AlmKeys.GitHub, {
      almSetting: 'test',
      repository: 'test',
      monorepo: false,
      project: 'my-project',
    });

    renderPermissionsProjectApp(
      { visibility: Visibility.Private },
      { featureList: [Feature.GithubProvisioning] },
    );

    await ui.appLoaded();

    expect(ui.pageTitle.get()).toBeInTheDocument();
    expect(ui.pageTitle.byRole('img').query()).not.toBeInTheDocument();
    expectPermissionsToRemainEditable(ui);
  });

  it('should allow to change permissions for non-GH Project', async () => {
    const user = userEvent.setup();
    const ui = getPageObject(user);

    dopTranslationHandler.gitHubConfigurations.push(
      mockGitHubConfiguration({ provisioningType: ProvisioningType.auto }),
    );

    renderPermissionsProjectApp({}, { featureList: [Feature.GithubProvisioning] });
    await ui.appLoaded();

    expect(await ui.pageTitle.find()).toBeInTheDocument();
    expect(ui.nonGHProjectWarning.get()).toBeInTheDocument();
    expect(ui.pageTitle.byRole('img').query()).not.toBeInTheDocument();
    expectPermissionsToRemainEditable(ui);
  });

  it.each([ComponentQualifier.Portfolio, ComponentQualifier.Application])(
    'should not show sync warning for portfolio and applications',
    async (qualifier) => {
      const user = userEvent.setup();
      const ui = getPageObject(user);

      dopTranslationHandler.gitHubConfigurations.push(
        mockGitHubConfiguration({ provisioningType: ProvisioningType.auto }),
      );

      renderPermissionsProjectApp({ qualifier }, { featureList: [Feature.GithubProvisioning] });
      await ui.appLoaded();

      expect(ui.pageTitle.get()).toBeInTheDocument();
      expect(ui.nonGHProjectWarning.query()).not.toBeInTheDocument();
    },
  );
});
