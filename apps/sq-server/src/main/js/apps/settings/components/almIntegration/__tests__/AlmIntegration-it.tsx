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
import { http } from 'msw';
import { registerServiceMocks, resetServiceMocks, server } from '~shared/api/mocks/server';
import { byRole, byText } from '~shared/helpers/testSelector';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { validateAlmSettings } from '~sq-server-commons/api/alm-settings';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import {
  EntitlementsServiceDefaultDataset,
  EntitlementsServiceMock,
  mockPurchaseableFeature,
} from '~sq-server-commons/api/mocks/EntitlementsServiceMock';
import { PermissionChecksServiceMock } from '~sq-server-commons/api/mocks/PermissionChecksServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { getEdition } from '~sq-server-commons/helpers/editions';
import { mockPermissionCheckResource } from '~sq-server-commons/helpers/mocks/dop-translation';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { PermissionCheckStatus } from '~sq-server-commons/types/dop-translation';
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
let entitlements: EntitlementsServiceMock;
let permissionChecks: PermissionChecksServiceMock;

beforeAll(() => {
  almSettings = new AlmSettingsServiceMock();
  settings = new SettingsServiceMock();
  entitlements = new EntitlementsServiceMock(EntitlementsServiceDefaultDataset);
  permissionChecks = new PermissionChecksServiceMock();
});

beforeEach(() => {
  registerServiceMocks(entitlements, permissionChecks);
});

afterEach(() => {
  almSettings.reset();
  settings.reset();
  entitlements.reset();
  permissionChecks.reset();
  resetServiceMocks();
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

  it('leads with the GitHub App creation and offers manual configuration alongside it', async () => {
    const { ui } = getPageObjects();
    renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();

    expect(ui.createGithubAppButton.get()).toBeEnabled();
    expect(ui.configureManuallyButton.get()).toBeEnabled();
    // The generic label belongs to the other tabs; GitHub relabels manual creation.
    expect(ui.createConfigurationButton.query()).not.toBeInTheDocument();
  });

  it('opens the GitHub App manifest modal from the app creation button', async () => {
    const { ui, user } = getPageObjects();
    renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await user.click(ui.createGithubAppButton.get());

    expect(await ui.manifestModalDescription.find()).toBeInTheDocument();
  });

  it('opens the manual configuration form from the manual configuration button', async () => {
    const { ui, user } = getPageObjects();
    renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await user.click(ui.configureManuallyButton.get());

    expect(await ui.saveConfigurationButton.find()).toBeInTheDocument();
    expect(ui.manifestModalDescription.query()).not.toBeInTheDocument();
  });
});

it.each([AlmKeys.GitLab, AlmKeys.Azure, AlmKeys.BitbucketServer])(
  'keeps the generic create configuration button and offers no GitHub App creation on the %s tab',
  async (almKey: AlmKeys.Azure | AlmKeys.BitbucketServer | AlmKeys.GitLab) => {
    const { ui, user } = getPageObjects();
    renderAlmIntegration();
    expect(await ui.almHeading.find()).toBeInTheDocument();

    await user.click(ui.tab(almKey).get());

    expect(ui.createConfigurationButton.get()).toBeEnabled();
    expect(ui.configureManuallyButton.query()).not.toBeInTheDocument();
    expect(ui.createGithubAppButton.query()).not.toBeInTheDocument();
  },
);

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

    // Create new Bitbucket Data Center configuration
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

    // Edit, check delete Bitbucket Data Center configuration
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

describe('Remediation Agent capability (SONAR-32166)', () => {
  const remediationAgentTitle = byText('settings.almintegration.remediation_agent.title');
  const missingPermissions = byText(
    'settings.almintegration.remediation_agent.status.missing_permissions',
  );
  const insufficientDescription = byText(
    'ai_capabilities.remediation_agent.dop_permission_warning.red.instance.description',
  );

  async function createGithubConfig(name: string) {
    const { ui } = getPageObjects();
    expect(await ui.almHeading.find()).toBeInTheDocument();
    await ui.createConfiguration(name, {
      'name.github': name,
      'url.github': 'https://api.github.com',
      app_id: 'Github App ID',
      'client_id.github': 'Github Client ID',
      'client_secret.github': 'Client Secret',
      private_key: 'Key',
    });
  }

  it('stays hidden when the Remediation Agent feature is not purchasable', async () => {
    // EntitlementsServiceDefaultDataset's purchasable features don't include RemediationAgent.
    renderAlmIntegration();
    await createGithubConfig('Name');

    expect(remediationAgentTitle.query()).not.toBeInTheDocument();
  });

  it('shows the capability status once the feature is entitled', async () => {
    entitlements.setPurchasableFeatures([
      mockPurchaseableFeature({
        featureKey: EntitlementCheckFeatureKey.RemediationAgent,
        isAvailable: true,
        isEnabled: true,
      }),
    ]);
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Insufficient }),
      ],
    });
    renderAlmIntegration();

    await createGithubConfig('Name');

    expect(await missingPermissions.find()).toBeInTheDocument();
    expect(insufficientDescription.get()).toBeInTheDocument();
  });

  it('re-checks Remediation Agent permissions via the existing Check configuration action', async () => {
    entitlements.setPurchasableFeatures([
      mockPurchaseableFeature({
        featureKey: EntitlementCheckFeatureKey.RemediationAgent,
        isAvailable: true,
        isEnabled: true,
      }),
    ]);
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Insufficient }),
      ],
    });
    const { ui } = getPageObjects();
    renderAlmIntegration();
    await createGithubConfig('Name');

    expect(await missingPermissions.find()).toBeInTheDocument();

    // Creating a configuration triggers its own automatic check (AlmTab's `afterSubmit`) — queue
    // the Sufficient refresh result only now, so it lands on the deliberate click below rather
    // than being consumed by that automatic one, which would hide the Insufficient state above.
    permissionChecks.setRefreshResponse(
      'Name',
      mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Sufficient }),
    );
    await userEvent.click(ui.checkConfigurationButton('Name').get());

    await waitFor(() => {
      expect(missingPermissions.query()).not.toBeInTheDocument();
    });
  });

  it('still re-checks Remediation Agent permissions when the general ALM check reports a Warning', async () => {
    // The capability row unmounts on a Warning status — this is what the always-mounted banner
    // (rather than the capability row) must keep working through.
    entitlements.setPurchasableFeatures([
      mockPurchaseableFeature({
        featureKey: EntitlementCheckFeatureKey.RemediationAgent,
        isAvailable: true,
        isEnabled: true,
      }),
    ]);
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Insufficient }),
      ],
    });
    const { ui } = getPageObjects();
    renderAlmIntegration();
    await createGithubConfig('Name');

    expect(await insufficientDescription.find()).toBeInTheDocument();
    // Creating a configuration triggers its own automatic check (AlmTab's `afterSubmit`) — queue
    // the rejection and the Sufficient refresh result only now, so they land on the deliberate
    // click below rather than being consumed by that automatic one, which would hide the
    // Insufficient state above.
    jest.mocked(validateAlmSettings).mockRejectedValueOnce(new Error('network error'));
    permissionChecks.setRefreshResponse(
      'Name',
      mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Sufficient }),
    );

    await userEvent.click(ui.checkConfigurationButton('Name').get());

    expect(await byText('settings.almintegration.could_not_validate').find()).toBeInTheDocument();
    // The capability row is unmounted during the Warning state ...
    expect(missingPermissions.query()).not.toBeInTheDocument();
    // ... but the always-mounted banner still received and acted on the same click.
    await waitFor(() => {
      expect(insufficientDescription.query()).not.toBeInTheDocument();
    });
  });
});

describe('Prevent conflicting validation messages (SONAR-32166)', () => {
  const successMessage = byText('settings.almintegration.configuration_valid');
  const missingPermissions = byText(
    'settings.almintegration.remediation_agent.status.missing_permissions',
  );
  const unknownDescription = byText(
    'ai_capabilities.remediation_agent.dop_permission_warning.yellow.description',
  );
  const insufficientDescription = byText(
    'ai_capabilities.remediation_agent.dop_permission_warning.red.instance.description',
  );
  const unableToVerifyDescription = byText(
    'settings.almintegration.remediation_agent.unable_to_verify_description',
  );

  async function createGithubConfig(name: string) {
    const { ui } = getPageObjects();
    expect(await ui.almHeading.find()).toBeInTheDocument();
    await ui.createConfiguration(name, {
      'name.github': name,
      'url.github': 'https://api.github.com',
      app_id: 'Github App ID',
      'client_id.github': 'Github Client ID',
      'client_secret.github': 'Client Secret',
      private_key: 'Key',
    });
  }

  async function createAzureConfig(name: string) {
    const { ui } = getPageObjects();
    expect(await ui.almHeading.find()).toBeInTheDocument();
    await userEvent.click(ui.tab(AlmKeys.Azure).get());
    await ui.createConfiguration(name, {
      'name.azure': name,
      'url.azure': 'https://dev.azure.com/org',
      personal_access_token: 'Access Token',
    });
  }

  function enableRemediationAgentFeature() {
    entitlements.setPurchasableFeatures([
      mockPurchaseableFeature({
        featureKey: EntitlementCheckFeatureKey.RemediationAgent,
        isAvailable: true,
        isEnabled: true,
      }),
    ]);
  }

  it('shows Configuration valid when the existing validation succeeds and the Remediation Agent is sufficient', async () => {
    enableRemediationAgentFeature();
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Sufficient }),
      ],
    });
    renderAlmIntegration();

    await createGithubConfig('Name');

    expect(await successMessage.find()).toBeInTheDocument();
    expect(missingPermissions.query()).not.toBeInTheDocument();
  });

  it('shows only the permission banner when the existing validation succeeds and the Remediation Agent is insufficient', async () => {
    enableRemediationAgentFeature();
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({ key: 'Name', status: PermissionCheckStatus.Insufficient }),
      ],
    });
    renderAlmIntegration();

    await createGithubConfig('Name');

    // GitHub falls back to the generic description when it has neither an app-level deficit nor
    // any installation-level detail to report (SONAR-32166 CI-review follow-up) — it must never
    // come up empty.
    expect(await missingPermissions.find()).toBeInTheDocument();
    expect(await insufficientDescription.find()).toBeInTheDocument();
    expect(successMessage.query()).not.toBeInTheDocument();
  });

  it('shows only the warning banner when the existing validation succeeds and Azure is unknown', async () => {
    enableRemediationAgentFeature();
    permissionChecks.setResponse({
      permissionChecks: [
        mockPermissionCheckResource({
          key: 'Name',
          type: AlmKeys.Azure,
          status: PermissionCheckStatus.Unknown,
        }),
      ],
    });
    renderAlmIntegration();

    await createAzureConfig('Name');

    expect(await unknownDescription.find()).toBeInTheDocument();
    expect(successMessage.query()).not.toBeInTheDocument();
  });

  it('shows only the check-failed banner when the existing validation succeeds and the permission check fails', async () => {
    enableRemediationAgentFeature();
    permissionChecks.setResponse({ permissionChecks: [] });
    renderAlmIntegration();

    await createGithubConfig('Name');

    expect(await unableToVerifyDescription.find()).toBeInTheDocument();
    expect(successMessage.query()).not.toBeInTheDocument();
  });

  it('does not show a success banner while the permission result is loading', async () => {
    enableRemediationAgentFeature();
    server.use(http.get('/api/v2/dop-translation/permission-checks', () => new Promise(() => {})));
    renderAlmIntegration();

    await createGithubConfig('Name');

    expect(successMessage.query()).not.toBeInTheDocument();
  });

  it('preserves the existing success banner when the Remediation Agent is unavailable', async () => {
    // EntitlementsServiceDefaultDataset's purchasable features don't include RemediationAgent.
    renderAlmIntegration();

    await createGithubConfig('Name');

    expect(await successMessage.find()).toBeInTheDocument();
  });
});

it('closes the configuration form when the modal is dismissed', async () => {
  const { ui, user } = getPageObjects();
  renderAlmIntegration();
  expect(await ui.almHeading.find()).toBeInTheDocument();

  await user.click(await ui.configureManuallyButton.find());
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
    // GitHub leads with the App creation CTA, so its manual entry point is labelled differently.
    configureManuallyButton: byRole('button', { name: 'settings.almintegration.create.manual' }),
    createGithubAppButton: byRole('button', {
      name: 'settings.almintegration.github.manifest.create',
    }),
    manifestModalDescription: byText('settings.almintegration.github.manifest.info'),
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
    // The label of the manual creation button depends on the tab (see the selectors above).
    await userEvent.click(ui.createConfigurationButton.query() ?? ui.configureManuallyButton.get());
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
