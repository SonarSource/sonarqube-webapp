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
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  checkPersonalAccessTokenIsValid,
  setAlmPersonalAccessToken,
} from '~sq-server-commons/api/alm-integrations';
import { updateBoundProject } from '~sq-server-commons/api/dop-translation';
import AlmIntegrationsServiceMock from '~sq-server-commons/api/mocks/AlmIntegrationsServiceMock';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import ComponentNavProjectBindingErrorNotif from '~sq-server-commons/components/nav/ComponentNavProjectBindingErrorNotif';
import CurrentUserContextProvider from '~sq-server-commons/context/current-user/CurrentUserContextProvider';
import { mockProjectAlmBindingResponse } from '~sq-server-commons/helpers/mocks/alm-settings';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import {
  AlmKeys,
  ProjectAlmBindingConfigurationErrorScope,
} from '~sq-server-commons/types/alm-settings';
import { BoundProject } from '~sq-server-commons/types/dop-translation';
import { Feature } from '~sq-server-commons/types/features';
import { Permissions } from '~sq-server-commons/types/permissions';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser } from '~sq-server-commons/types/users';
import PRDecorationBinding, { isDataSame } from '../PRDecorationBinding';

jest.mock('~sq-server-commons/api/alm-integrations');
jest.mock('~sq-server-commons/api/dop-translation');

let almIntegrations: AlmIntegrationsServiceMock;
let almSettings: AlmSettingsServiceMock;
let dopTranslation: DopTranslationServiceMock;

beforeAll(() => {
  almIntegrations = new AlmIntegrationsServiceMock();
  almSettings = new AlmSettingsServiceMock();
  dopTranslation = new DopTranslationServiceMock();
  // Wire v2 updateBoundProject to also update the AlmSettings mock so that
  // getProjectAlmBinding reflects the saved binding and isConfigured becomes true.
  jest.mocked(updateBoundProject).mockImplementation((data) => {
    const dop = dopTranslation.dopSettings.find((s) => s.id === data.devOpsPlatformSettingId);
    almSettings.setProjectBinding(
      data.projectKey,
      mockProjectAlmBindingResponse({
        alm: dop?.type ?? AlmKeys.GitHub,
        key: dop?.key ?? data.devOpsPlatformSettingId,
        monorepo: data.monorepo,
        // For Bitbucket Server, repository = projectIdentifier (project key),
        // slug = repositoryIdentifier (repo slug). For all other ALMs, repository = repositoryIdentifier.
        repository:
          dop?.type === AlmKeys.BitbucketServer
            ? (data.projectIdentifier ?? '')
            : data.repositoryIdentifier,
        slug:
          dop?.type === AlmKeys.BitbucketServer
            ? data.repositoryIdentifier
            : (data.projectIdentifier ?? ''),
        summaryCommentEnabled: data.summaryCommentEnabled ?? false,
        url: 'https://company.com/project',
      }),
    );
    return Promise.resolve({});
  });
});

afterEach(() => {
  almIntegrations.reset();
  almSettings.reset();
  dopTranslation.reset();
  jest.clearAllMocks();
});

const PROVISIONER = mockLoggedInUser({ permissions: { global: [Permissions.ProjectCreation] } });
const NON_PROVISIONER = mockLoggedInUser();
const MISSING_CREDENTIAL = { status: false, error: "personal access token for 'conf' is missing" };

const inputsList = {
  [AlmKeys.GitLab]: { 'gitlab.repository': 'Repository', monorepo: false },
  [AlmKeys.GitHub]: {
    'github.repository': 'Repository',
    'github.summary_comment_setting': false,
    monorepo: false,
  },
  [AlmKeys.Azure]: {
    'azure.repository': 'Repository',
    'azure.project': 'Project',
    'azure.inline_pr_annotations': false,
    monorepo: false,
  },
  [AlmKeys.BitbucketCloud]: { 'bitbucketcloud.repository': 'Repository', monorepo: false },
  [AlmKeys.BitbucketServer]: {
    'bitbucket.repository': 'Repository',
    'bitbucket.slug': 'Slug',
    monorepo: false,
  },
};

const expectedFirstSavePayload: Record<AlmKeys, BoundProject> = {
  [AlmKeys.GitLab]: {
    devOpsPlatformSettingId: 'conf-final-1',
    projectKey: 'my-project',
    projectName: 'MyProject',
    monorepo: false,
    repositoryIdentifier: 'Repository',
  },
  [AlmKeys.GitHub]: {
    devOpsPlatformSettingId: 'conf-github-1',
    projectKey: 'my-project',
    projectName: 'MyProject',
    monorepo: false,
    repositoryIdentifier: 'Repository',
    summaryCommentEnabled: true,
  },
  [AlmKeys.Azure]: {
    devOpsPlatformSettingId: 'conf-azure-1',
    projectKey: 'my-project',
    projectName: 'MyProject',
    monorepo: false,
    projectIdentifier: 'Project',
    repositoryIdentifier: 'Repository',
    inlineAnnotationsEnabled: true,
  },
  [AlmKeys.BitbucketCloud]: {
    devOpsPlatformSettingId: 'conf-bitbucketcloud-1',
    projectKey: 'my-project',
    projectName: 'MyProject',
    monorepo: false,
    repositoryIdentifier: 'Repository',
  },
  [AlmKeys.BitbucketServer]: {
    devOpsPlatformSettingId: 'conf-bitbucketserver-1',
    projectKey: 'my-project',
    projectName: 'MyProject',
    monorepo: false,
    projectIdentifier: 'Repository',
    repositoryIdentifier: 'Slug',
  },
};

it.each([
  {
    key: 'conf-final-1',
    alm: AlmKeys.GitLab,
  },
  {
    key: 'conf-github-1',
    alm: AlmKeys.GitHub,
  },
  {
    key: 'conf-azure-1',
    alm: AlmKeys.Azure,
  },
  {
    key: 'conf-bitbucketcloud-1',
    alm: AlmKeys.BitbucketCloud,
  },
  {
    key: 'conf-bitbucketserver-1',
    alm: AlmKeys.BitbucketServer,
  },
])(
  'should get, set, delete and validate binding for $alm',
  async ({ key, alm }: { alm: AlmKeys; key: string }) => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap[key] = { status: true };
    almSettings.setProjectBindingConfigurationErrors({
      scope: ProjectAlmBindingConfigurationErrorScope.Global,
      errors: [{ msg: 'cute error' }],
    });
    const { rerender } = renderPRDecorationBinding();
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await user.click(ui.input('name', 'combobox').get());
    await user.click(byRole('option', { name: new RegExp(key) }).get());

    const list = inputsList[alm];
    for (const [inputId, value] of Object.entries(list)) {
      // eslint-disable-next-line no-await-in-loop
      await ui.setInput(inputId, value);
    }
    // Save form and check for errors
    await user.click(ui.saveButton.get());
    expect(await ui.validationMsg('cute error').find()).toBeInTheDocument();
    expect(updateBoundProject).toHaveBeenLastCalledWith(expectedFirstSavePayload[alm]);

    // Check validation with errors
    await user.click(ui.validateButton.get());
    expect(ui.validationMsg('cute error').get()).toBeInTheDocument();

    // Save form and check for errors
    almSettings.setProjectBindingConfigurationErrors(undefined);
    await ui.setInput(
      Object.keys(list).find((key) => key.endsWith('.repository')) as string,
      'Anything',
    );
    await user.click(ui.saveButton.get());
    expect(
      await ui.validationMsg('settings.pr_decoration.binding.check_configuration.success').find(),
    ).toBeInTheDocument();

    await user.click(ui.validateButton.get());
    expect(
      ui.validationMsg('settings.pr_decoration.binding.check_configuration.success').get(),
    ).toBeInTheDocument();

    // Rerender and verify that validation is done for binding
    rerender(<MockedPRDecorationBinding component={mockComponent()} currentUser={PROVISIONER} />);
    expect(
      await ui.validationMsg('settings.pr_decoration.binding.check_configuration.success').find(),
    ).toBeInTheDocument();
    expect(ui.saveButton.query()).not.toBeInTheDocument();

    // Reset binding
    await user.click(ui.resetButton.get());
    expect(ui.input('', 'textbox').query()).not.toBeInTheDocument();
    expect(ui.input('', 'switch').query()).not.toBeInTheDocument();
  },
);

it('should update the nav binding error notif after saving a binding', async () => {
  // Regression guard: saving or deleting a binding calls useSetProjectBindingMutation /
  // useDeleteProjectAlmBindingMutation, whose onSuccess invalidates the
  // useValidateProjectAlmBindingQuery cache. ComponentNavProjectBindingErrorNotif observes
  // that cache. If the query key for invalidation ever drifts, the nav notif will remain
  // stale after a binding change. Render both in the same provider to catch this end-to-end.
  almSettings.setProjectBindingConfigurationErrors({
    scope: ProjectAlmBindingConfigurationErrorScope.Global,
    errors: [{ msg: 'binding error' }],
  });

  const { ui, user } = getPageObjects();
  const component = mockComponent();
  renderComponent(
    <>
      <MockedPRDecorationBinding component={component} currentUser={PROVISIONER} />
      <ComponentNavProjectBindingErrorNotif component={component} />
    </>,
    '',
    { featureList: [Feature.BranchSupport] },
  );

  expect(await ui.mainTitle.find()).toBeInTheDocument();
  // Nav shows the binding error because the initial validation returned errors.
  expect(
    await screen.findByText(/component_navigation.pr_deco.action.contact_project_admin/),
  ).toBeInTheDocument();

  // Select GitHub and fill in the required repository field.
  await user.click(ui.input('name', 'combobox').get());
  await user.click(byRole('option', { name: /conf-github-1/ }).get());
  await ui.setInput('github.repository', 'my-org/my-repo');

  // Clear the error before saving so the refetch returns no errors.
  almSettings.setProjectBindingConfigurationErrors(undefined);
  await user.click(ui.saveButton.get());

  // After the mutation succeeds it invalidates useValidateProjectAlmBindingQuery.
  // ComponentNavProjectBindingErrorNotif (an active observer) refetches and finds no
  // errors, so it renders null and the error text disappears.
  // (userEvent.click flushes microtasks, so the refetch may complete before
  // waitForElementToBeRemoved can run its initial check — use waitFor instead.)
  await waitFor(() => {
    expect(
      screen.queryByText(/component_navigation.pr_deco.action.contact_project_admin/),
    ).not.toBeInTheDocument();
  });
});

describe('credentials', () => {
  it('should not ask for a credential when the stored one is valid', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = { status: true };
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await ui.setInput('gitlab.repository', 'Repository');

    await waitFor(() => {
      expect(ui.saveButton.get()).toBeEnabled();
    });
    expect(ui.token.query()).not.toBeInTheDocument();

    await user.click(ui.saveButton.get());
    await waitFor(() => {
      expect(updateBoundProject).toHaveBeenCalled();
    });
    expect(setAlmPersonalAccessToken).not.toHaveBeenCalled();
  });

  it('should not allow saving while the credential check is pending', async () => {
    const { ui } = getPageObjects();
    let resolveCheck: (result: { status: boolean; error?: string }) => void = noop;
    jest.mocked(checkPersonalAccessTokenIsValid).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCheck = resolve;
        }),
    );
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await ui.setInput('gitlab.repository', 'Repository');

    expect(checkPersonalAccessTokenIsValid).toHaveBeenCalledWith('conf-final-1');
    expect(ui.saveButton.get()).toBeDisabled();
    expect(ui.token.query()).not.toBeInTheDocument();

    resolveCheck({ status: true });

    await waitFor(() => {
      expect(ui.saveButton.get()).toBeEnabled();
    });
    expect(ui.token.query()).not.toBeInTheDocument();
  });

  it('should require a credential, then set it, check it and bind in that order', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    expect(await ui.token.find()).toBeInTheDocument();
    await ui.setInput('gitlab.repository', 'Repository');
    expect(ui.saveButton.get()).toBeDisabled();

    await user.type(ui.token.get(), 'my-token');
    expect(ui.saveButton.get()).toBeEnabled();

    await user.click(ui.saveButton.get());
    await waitFor(() => {
      expect(updateBoundProject).toHaveBeenCalled();
    });

    expect(setAlmPersonalAccessToken).toHaveBeenCalledWith('conf-final-1', 'my-token', undefined);
    const [setOrder] = jest.mocked(setAlmPersonalAccessToken).mock.invocationCallOrder;
    const lastCheckOrder = Math.max(
      ...jest.mocked(checkPersonalAccessTokenIsValid).mock.invocationCallOrder,
    );
    const [bindOrder] = jest.mocked(updateBoundProject).mock.invocationCallOrder;
    expect(lastCheckOrder).toBeGreaterThan(setOrder);
    expect(bindOrder).toBeGreaterThan(lastCheckOrder);
    await waitFor(() => {
      expect(ui.token.query()).not.toBeInTheDocument();
    });
  });

  it('should not bind and should keep the form when the credential is rejected', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    jest.mocked(setAlmPersonalAccessToken).mockImplementationOnce(() => {
      almIntegrations.almInstancePATMap['conf-final-1'] = {
        status: false,
        error: 'Token rejected',
      };
      return Promise.resolve();
    });
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await ui.setInput('gitlab.repository', 'Repository');
    await user.type(await ui.token.find(), 'wrong-token');
    await user.click(ui.saveButton.get());

    expect(await byText('Token rejected').find()).toBeInTheDocument();
    expect(byText('onboarding.create_project.pat_incorrect.gitlab.hint').get()).toBeInTheDocument();
    expect(updateBoundProject).not.toHaveBeenCalled();
    expect(ui.token.get()).toHaveValue('wrong-token');
    expect(ui.input('gitlab.repository', 'textbox').get()).toHaveValue('Repository');
  });

  it('should not bind when the credential cannot be set', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    jest.mocked(setAlmPersonalAccessToken).mockRejectedValueOnce(new Error('forbidden'));
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await ui.setInput('gitlab.repository', 'Repository');
    await user.type(await ui.token.find(), 'my-token');
    await user.click(ui.saveButton.get());

    await waitFor(() => {
      expect(setAlmPersonalAccessToken).toHaveBeenCalled();
    });
    expect(updateBoundProject).not.toHaveBeenCalled();
    expect(ui.token.get()).toHaveValue('my-token');
  });

  it('should tell the user when the stored credential is no longer valid', async () => {
    const { ui } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = { status: false, error: 'Token expired' };
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');

    expect(
      await byText('onboarding.create_project.pat.expired.info_message').find(),
    ).toBeInTheDocument();
    expect(ui.token.get()).toBeInTheDocument();
  });

  it('should require both the email and the API token for Bitbucket Cloud', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-bitbucketcloud-1'] = MISSING_CREDENTIAL;
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-bitbucketcloud-1');
    expect(await ui.email.find()).toBeInTheDocument();
    await ui.setInput('bitbucketcloud.repository', 'Repository');

    await user.type(ui.apiToken.get(), 'my-api-token');
    expect(ui.saveButton.get()).toBeDisabled();

    await user.type(ui.email.get(), 'me@example.com');
    expect(ui.saveButton.get()).toBeEnabled();

    await user.click(ui.saveButton.get());
    await waitFor(() => {
      expect(updateBoundProject).toHaveBeenCalled();
    });
    expect(setAlmPersonalAccessToken).toHaveBeenCalledWith(
      'conf-bitbucketcloud-1',
      'my-api-token',
      'me@example.com',
    );
  });

  it('should check the credential again, and start empty, when the configuration changes', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    almIntegrations.almInstancePATMap['conf-final-2'] = { status: true };
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await user.type(await ui.token.find(), 'my-token');

    await ui.selectConfiguration('conf-final-2');
    await waitFor(() => {
      expect(ui.token.query()).not.toBeInTheDocument();
    });
    expect(checkPersonalAccessTokenIsValid).toHaveBeenCalledWith('conf-final-2');

    await ui.selectConfiguration('conf-final-1');
    expect(await ui.token.find()).toHaveValue('');
  });

  it('should never ask for a credential for GitHub', async () => {
    const { ui, user } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-github-1'] = MISSING_CREDENTIAL;
    renderPRDecorationBinding(mockComponent(), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-github-1');
    await ui.setInput('github.repository', 'Repository');

    expect(ui.saveButton.get()).toBeEnabled();
    expect(ui.token.query()).not.toBeInTheDocument();
    expect(checkPersonalAccessTokenIsValid).not.toHaveBeenCalled();

    await user.click(ui.saveButton.get());
    await waitFor(() => {
      expect(updateBoundProject).toHaveBeenCalled();
    });
    expect(setAlmPersonalAccessToken).not.toHaveBeenCalled();
  });

  it('should not check the credential nor allow saving for a user who cannot create projects', async () => {
    const { ui } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    renderPRDecorationBinding(mockComponent(), NON_PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    await ui.selectConfiguration('conf-final-1');
    await ui.setInput('gitlab.repository', 'Repository');

    expect(ui.saveButton.query()).not.toBeInTheDocument();
    expect(ui.token.query()).not.toBeInTheDocument();
    expect(checkPersonalAccessTokenIsValid).not.toHaveBeenCalled();
  });

  it('should not check the credential while the form is unchanged', async () => {
    const { ui } = getPageObjects();
    almIntegrations.almInstancePATMap['conf-final-1'] = MISSING_CREDENTIAL;
    almSettings.setProjectBinding(
      'component-key',
      mockProjectAlmBindingResponse({
        alm: AlmKeys.GitLab,
        key: 'conf-final-1',
        repository: 'Repository',
      }),
    );
    renderPRDecorationBinding(mockComponent({ key: 'component-key' }), PROVISIONER);
    expect(await ui.mainTitle.find()).toBeInTheDocument();

    expect(checkPersonalAccessTokenIsValid).not.toHaveBeenCalled();
    expect(ui.token.query()).not.toBeInTheDocument();
  });
});

it('should correctly detect form change', () => {
  expect(isDataSame({ key: '1' }, { key: '1' })).toBe(true);
  expect(isDataSame({ key: '1', slug: '' }, { key: '1' })).toBe(true);
  expect(isDataSame({ key: '1', repository: '' }, { key: '1' })).toBe(true);
  expect(isDataSame({ key: '1', summaryCommentEnabled: false }, { key: '1' })).toBe(true);
  expect(isDataSame({ key: '1', monorepo: false }, { key: '1' })).toBe(true);
  expect(isDataSame({ key: '1', inlineAnnotationsEnabled: true }, { key: '1' })).toBe(true);

  expect(isDataSame({ key: '1', slug: '1' }, { key: '1' })).toBe(false);
  expect(isDataSame({ key: '1', repository: '1' }, { key: '1' })).toBe(false);
  expect(isDataSame({ key: '1', summaryCommentEnabled: true }, { key: '1' })).toBe(false);
  expect(isDataSame({ key: '1', monorepo: true }, { key: '1' })).toBe(false);
  expect(isDataSame({ key: '1', inlineAnnotationsEnabled: false }, { key: '1' })).toBe(false);
});

function getPageObjects() {
  const user = userEvent.setup();

  async function setInput(inputId: string, value: string | boolean) {
    if (typeof value === 'boolean') {
      if (value) {
        await user.click(ui.input(inputId, 'switch').get());
      }
    } else {
      const input = ui.input(inputId, 'textbox').get();
      await user.clear(input);
      await user.type(input, value);
    }
  }

  async function selectConfiguration(key: string) {
    await user.click(ui.input('name', 'combobox').get());
    await user.click(byRole('option', { name: new RegExp(key) }).get());
  }

  const ui = {
    mainTitle: byRole('heading', { name: 'settings.pr_decoration.binding.title' }),
    token: byRole('textbox', { name: /onboarding.create_project.enter_pat/ }),
    email: byRole('textbox', { name: /onboarding.create_project.bitbucket_cloud.enter_username/ }),
    apiToken: byRole('textbox', {
      name: /onboarding.create_project.bitbucket_cloud.enter_password/,
    }),
    selectConfiguration,
    input: (id: string, role: 'combobox' | 'switch' | 'textbox') =>
      byRole(role, { name: new RegExp(`settings.pr_decoration.binding.form.${id}`) }),
    saveButton: byRole('button', { name: 'save' }),
    resetButton: byRole('button', { name: 'reset_verb' }),
    validateButton: byRole('button', {
      name: 'settings.pr_decoration.binding.check_configuration',
    }),
    validationMsg: (text: string) => byText(text),
    setInput,
  };

  return {
    ui,
    user,
  };
}

function MockedPRDecorationBinding({
  component,
  currentUser,
}: {
  component: Component;
  currentUser: CurrentUser;
}) {
  return (
    <CurrentUserContextProvider currentUser={currentUser}>
      <PRDecorationBinding component={component} />
    </CurrentUserContextProvider>
  );
}

function renderPRDecorationBinding(
  component: Component = mockComponent(),
  currentUser: CurrentUser = PROVISIONER,
) {
  return renderComponent(
    <MockedPRDecorationBinding component={component} currentUser={currentUser} />,
  );
}
