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

import { toast } from '@sonarsource/echoes-react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { getEdition } from '~sq-server-commons/helpers/editions';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { EditionKey } from '~sq-server-commons/types/editions';
import { Feature } from '~sq-server-commons/types/features';
import { SettingsKey } from '~sq-server-commons/types/settings';
import AlmIntegration from '../AlmIntegration';

jest.mock('~sq-server-commons/api/alm-settings');
jest.mock('~sq-server-commons/api/settings');

jest.mock('@sonarsource/echoes-react', () => ({
  ...jest.requireActual<typeof import('@sonarsource/echoes-react')>('@sonarsource/echoes-react'),
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

let almSettings: AlmSettingsServiceMock;
let settings: SettingsServiceMock;

beforeAll(() => {
  almSettings = new AlmSettingsServiceMock();
  settings = new SettingsServiceMock();
});

afterEach(() => {
  almSettings.reset();
  settings.reset();
  jest.mocked(toast.success).mockClear();
  jest.mocked(toast.error).mockClear();
  jest.mocked(toast.info).mockClear();
});

it('should not display the serverBaseURL message when it is defined', async () => {
  const { ui } = getPageObjects();
  settings.set(SettingsKey.ServerBaseUrl, 'http://localhost:9000');
  renderAlmIntegration([Feature.BranchSupport]);
  expect(await ui.almHeading.find()).toBeInTheDocument();
  expect(ui.serverBaseUrlMissingInformation.query()).not.toBeInTheDocument();
});

it(`should not display the serverBaseURL message for ${getEdition(EditionKey.community).name}`, async () => {
  const { ui } = getPageObjects();
  renderAlmIntegration();
  expect(await ui.almHeading.find()).toBeInTheDocument();
  expect(ui.serverBaseUrlMissingInformation.query()).not.toBeInTheDocument();
});

it('should display the serverBaseURL message when it is not defined', async () => {
  const { ui } = getPageObjects();
  renderAlmIntegration([Feature.BranchSupport]);

  expect(await ui.serverBaseUrlMissingInformation.find()).toBeInTheDocument();
});

describe('github tab', () => {
  it('can create/edit/delete new configuration', async () => {
    const { ui } = getPageObjects();
    const { rerender } = renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();
    expect(ui.emptyIntro(AlmKeys.GitHub).get()).toBeInTheDocument();

    // Create new configuration
    await ui.createConfiguration('Name', {
      'name.github': 'Name',
      'url.github': 'https://api.github.com',
      app_id: 'Github App ID',
      'client_id.github': 'Github Client ID',
      'client_secret.github': 'Client Secret',
      private_key: 'Key',
    });

    await ui.editConfiguration('New Name', 'Name', 'client_secret.github', AlmKeys.GitHub);

    await ui.checkConfiguration('New Name');

    rerender(<AlmIntegration />);
    expect(await screen.findByRole('heading', { name: 'New Name' })).toBeInTheDocument();

    await ui.deleteConfiguration('New Name');
    expect(ui.emptyIntro(AlmKeys.GitHub).get()).toBeInTheDocument();
  });
});

describe.each([AlmKeys.GitLab, AlmKeys.Azure])(
  '%s tab',
  (almKey: AlmKeys.Azure | AlmKeys.GitLab) => {
    it('can create/edit/delete new configuration', async () => {
      const { ui } = getPageObjects();

      renderAlmIntegration();
      expect(await ui.almHeading.find()).toBeInTheDocument();

      await userEvent.click(ui.tab(almKey).get());
      expect(ui.emptyIntro(almKey).get()).toBeInTheDocument();

      // Create new configuration
      await ui.createConfiguration('Name', {
        [`name.${almKey}`]: 'Name',
        [`url.${almKey}`]: 'https://api.alm.com',
        personal_access_token: 'Access Token',
      });

      // Cannot create another configuration without Multiple Alm feature
      expect(ui.createConfigurationButton.get()).toBeDisabled();

      await ui.editConfiguration('New Name', 'Name', 'personal_access_token', almKey);

      await ui.checkConfiguration('New Name');

      await ui.deleteConfiguration('New Name');
      expect(ui.emptyIntro(almKey).get()).toBeInTheDocument();
    });
  },
);

describe('bitbucket tab', () => {
  it('can create/edit/delete new configuration', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([Feature.MultipleAlm]);
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await userEvent.click(ui.tab(AlmKeys.BitbucketServer).get());
    expect(ui.emptyIntro(AlmKeys.BitbucketServer).get()).toBeInTheDocument();

    // Create new Bitbucket Server configuration
    await ui.createConfiguration(
      'Name',
      {
        'name.bitbucket': 'Name',
        'url.bitbucket': 'https://api.bitbucket.com',
        personal_access_token: 'Access Token',
      },
      AlmKeys.BitbucketServer,
    );

    // Create new Bitbucket Cloud configuration
    await ui.createConfiguration(
      'Name Cloud',
      {
        'name.bitbucket': 'Name Cloud',
        'workspace.bitbucketcloud': 'workspace',
        'client_id.bitbucketcloud': 'Client ID',
        'client_secret.bitbucketcloud': 'Client Secret',
      },
      AlmKeys.BitbucketCloud,
    );

    // Edit, check delete Bitbucket Server configuration
    await ui.editConfiguration(
      'New Name',
      'Name',
      'personal_access_token',
      AlmKeys.BitbucketServer,
    );

    await ui.checkConfiguration('New Name');

    await ui.deleteConfiguration('New Name');

    // Cloud configuration still exists
    expect(screen.getByRole('heading', { name: 'Name Cloud' })).toBeInTheDocument();
  });
});

it('closes the configuration form when the modal is dismissed', async () => {
  const { ui, user } = getPageObjects();
  renderAlmIntegration();
  expect(await ui.almHeading.find()).toBeInTheDocument();

  await user.click(await ui.createConfigurationButton.find());
  expect(await ui.saveConfigurationButton.find()).toBeInTheDocument();

  // Dismissing the modal (e.g. via Escape) should cancel the form, not just the cancel button.
  await user.keyboard('{Escape}');
  expect(ui.saveConfigurationButton.query()).not.toBeInTheDocument();
});

describe('github app manifest return flow', () => {
  it('shows a success toast when returning from a successful manifest creation', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([], '/?almManifestResult=success&almKey=my-github');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    // The intl mock echoes the message key and appends interpolated params, so the returned
    // configuration key ('my-github') proves it was passed through to the success message.
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith({
        description: 'settings.almintegration.github.manifest.success.my-github',
      });
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows the error returned by GitHub when the manifest creation failed', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([], '/?almManifestResult=error&almError=Something+went+wrong');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith({ description: 'Something went wrong' });
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('falls back to a generic error message when GitHub returns no error detail', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([], '/?almManifestResult=error');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith({
        description: 'settings.almintegration.github.manifest.error',
      });
    });
  });

  it('does not show any toast when there is no manifest result in the URL', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows a success toast when GitHub returns after a successful App installation', async () => {
    const { ui } = getPageObjects();
    // The happy path returns via the App setup_url with setup_action/installation_id, not almManifestResult.
    renderAlmIntegration([], '/?setup_action=install&installation_id=12345');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith({
        description: 'settings.almintegration.github.manifest.installed',
      });
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an info toast when the App installation is pending approval', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([], '/?setup_action=request&installation_id=12345');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith({
        description: 'settings.almintegration.github.manifest.install_requested',
      });
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not surface a success toast for an unrecognized return state', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration([], '/?almManifestResult=unexpected');
    expect(await ui.almHeading.find()).toBeInTheDocument();

    // An unknown state must not be conflated with success.
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });
});

function getPageObjects() {
  const user = userEvent.setup();

  const ui = {
    almHeading: byRole('heading', { name: 'settings.almintegration.title' }),
    serverBaseUrlMissingInformation: byText('settings.almintegration.empty.server_base_url'),
    emptyIntro: (almKey: AlmKeys) => byText(`settings.almintegration.empty.${almKey}`),
    createConfigurationButton: byRole('button', { name: 'settings.almintegration.create' }),
    tab: (almKey: AlmKeys) =>
      byRole('tab', { name: `${almKey} settings.almintegration.tab.${almKey}` }),
    bitbucketConfiguration: (almKey: AlmKeys.BitbucketCloud | AlmKeys.BitbucketServer) =>
      byRole('radio', { name: `alm.${almKey}.long` }),
    configurationInput: (id: string) =>
      byRole('textbox', {
        name: new RegExp(`settings\\.almintegration\\.form\\.${id.replace(/\./g, '\\.')}`),
      }),
    updateSecretValueButton: (key: string) =>
      byRole('button', {
        name: `settings.almintegration.form.secret.update_field_x.settings.almintegration.form.${key}`,
      }),
    saveConfigurationButton: byRole('button', { name: 'settings.almintegration.form.save' }),
    editConfigurationButton: (key: string) =>
      byRole('button', { name: `settings.almintegration.edit_configuration.${key}` }),
    deleteConfigurationButton: (key: string) =>
      byRole('button', { name: `settings.almintegration.delete_configuration.${key}` }),
    cancelButton: byRole('button', { name: 'cancel' }),
    confirmDelete: byRole('button', { name: 'delete' }),
    checkConfigurationButton: (key: string) =>
      byRole('button', { name: `settings.almintegration.check_configuration_x.${key}` }),
    validationMessage: (text: string) => byText(text),
  };

  async function createConfiguration(
    name: string,
    params: { [key: string]: string },
    almKey?: AlmKeys.BitbucketCloud | AlmKeys.BitbucketServer,
  ) {
    await userEvent.click(ui.createConfigurationButton.get());
    expect(ui.saveConfigurationButton.get()).toBeDisabled();

    if (almKey) {
      await userEvent.click(ui.bitbucketConfiguration(almKey).get());
    }

    for (const [key, value] of Object.entries(params)) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.type(ui.configurationInput(key).get(), value);
    }
    expect(ui.saveConfigurationButton.get()).toBeEnabled();
    await userEvent.click(ui.saveConfigurationButton.get());

    // New configuration is created
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  }

  async function editConfiguration(
    newName: string,
    currentName: string,
    secretId: string,
    almKey: AlmKeys,
  ) {
    almSettings.setDefinitionErrorMessage('Something is wrong');
    await userEvent.click(ui.editConfigurationButton(currentName).get());
    expect(ui.configurationInput(secretId).query()).not.toBeInTheDocument();
    await userEvent.click(ui.updateSecretValueButton(secretId).get());
    await userEvent.type(ui.configurationInput(secretId).get(), 'New Secret Value');
    await userEvent.clear(ui.configurationInput(`name.${almKey}`).get());
    await userEvent.type(ui.configurationInput(`name.${almKey}`).get(), newName);
    await userEvent.click(ui.saveConfigurationButton.get());

    // Existing configuration is edited
    expect(screen.queryByRole('heading', { name: currentName })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: newName })).toBeInTheDocument();
    expect(ui.validationMessage('Something is wrong').get()).toBeInTheDocument();
  }

  async function checkConfiguration(name: string) {
    almSettings.setDefinitionErrorMessage('');
    await userEvent.click(ui.checkConfigurationButton(name).get());
    expect(
      ui.validationMessage('settings.almintegration.configuration_valid').getAll()[0],
    ).toBeInTheDocument();
  }

  async function deleteConfiguration(name: string) {
    await userEvent.click(ui.deleteConfigurationButton(name).get());
    await userEvent.click(ui.cancelButton.get());
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();

    await userEvent.click(ui.deleteConfigurationButton(name).get());
    await userEvent.click(ui.confirmDelete.get());
    expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument();
  }

  return {
    ui: {
      ...ui,
      createConfiguration,
      editConfiguration,
      deleteConfiguration,
      checkConfiguration,
    },
    user,
  };
}

function renderAlmIntegration(features: Feature[] = [], pathname = '/') {
  return renderComponent(
    <AvailableFeaturesContext.Provider value={features}>
      <AlmIntegration />
    </AvailableFeaturesContext.Provider>,
    pathname,
  );
}
