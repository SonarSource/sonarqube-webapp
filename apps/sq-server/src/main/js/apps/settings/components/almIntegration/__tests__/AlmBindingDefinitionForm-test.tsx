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

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  registerServiceMocks,
  resetServiceMocks,
  trackRequestedUrls,
} from '~shared/api/mocks/server';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import {
  createGitlabConfiguration,
  updateGitlabConfiguration,
  validateAlmSettings,
} from '~sq-server-commons/api/alm-settings';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import {
  BillingServiceDefaultDataset,
  BillingServiceMock,
  mockBillingPurchasableFeatures,
} from '~sq-server-commons/api/mocks/BillingServiceMock';
import { PermissionChecksServiceMock } from '~sq-server-commons/api/mocks/PermissionChecksServiceMock';
import { mockGitlabBindingDefinition } from '~sq-server-commons/helpers/mocks/alm-settings';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import {
  AlmBindingDefinitionForm,
  AlmBindingDefinitionFormProps,
} from '../AlmBindingDefinitionForm';

jest.mock('~sq-server-commons/api/alm-settings');

let almSettings: AlmSettingsServiceMock;
const billingHandler = new BillingServiceMock(BillingServiceDefaultDataset);
const permissionChecksHandler = new PermissionChecksServiceMock();

beforeAll(() => {
  almSettings = new AlmSettingsServiceMock();
});

beforeEach(() => {
  billingHandler.reset();
  permissionChecksHandler.reset();
  registerServiceMocks(billingHandler, permissionChecksHandler);
});

afterEach(() => {
  almSettings.reset();
  resetServiceMocks();
});

const ui = {
  bitbucketConfiguration: (almKey: AlmKeys.BitbucketCloud | AlmKeys.BitbucketServer) =>
    byRole('radio', { name: `alm.${almKey}.long` }),
  configurationInput: (id: string) =>
    byLabelText(`settings.almintegration.form.${id}`, { exact: false }),
  saveConfigurationButton: byRole('button', { name: 'settings.almintegration.form.save' }),
  cancelButton: byRole('button', { name: 'cancel' }),
  updateSecretFieldButton: byRole('button', {
    name: /settings\.almintegration\.form\.secret\.update_field_x/,
  }),
  validationError: (text: string) => byText(text),
};

const onCancel = jest.fn();

it('enforceValidation enabled', async () => {
  almSettings.setDefinitionErrorMessage('Validation Error');
  renderAlmBindingDefinitionForm();

  // Fill in form
  await userEvent.type(await ui.configurationInput('name.gitlab').find(), 'Name');
  await userEvent.type(ui.configurationInput('url.gitlab').get(), 'https://api.alm.com');
  await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');

  await userEvent.click(ui.saveConfigurationButton.get());
  expect(ui.validationError('Validation Error').get()).toBeInTheDocument();

  await userEvent.click(ui.cancelButton.get());
  expect(onCancel).toHaveBeenCalled();
});

it('keeps the save button disabled while post-save validation is in flight', async () => {
  let resolveValidation!: (message: string) => void;
  jest.mocked(validateAlmSettings).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveValidation = resolve;
      }),
  );

  renderAlmBindingDefinitionForm();

  await userEvent.type(await ui.configurationInput('name.gitlab').find(), 'Name');
  await userEvent.type(ui.configurationInput('url.gitlab').get(), 'https://api.alm.com');
  await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');

  await userEvent.click(ui.saveConfigurationButton.get());

  expect(byRole('button', { name: /settings\.almintegration\.form\.save/ }).get()).toBeDisabled();

  resolveValidation('');

  expect(await ui.saveConfigurationButton.find()).toBeInTheDocument();
});

async function waitForPurchasableFeaturesLoaded(requestedUrls: string[]) {
  await waitFor(() => {
    expect(
      requestedUrls.some((url) => url.includes('/api/v2/entitlements/purchasable-features')),
    ).toBe(true);
  });
}

function findRefreshRequest(requestedUrls: string[], configurationKey: string) {
  return requestedUrls.find(
    (url) =>
      url.includes('/api/v2/dop-translation/permission-checks') &&
      url.includes(`configuration=${configurationKey}`) &&
      url.includes('refresh=true'),
  );
}

it('refreshes the Remediation Agent permission result after updating a PAT', async () => {
  jest.mocked(updateGitlabConfiguration).mockResolvedValueOnce(undefined);
  const { requestedUrls, stopTracking } = trackRequestedUrls();
  const bindingDefinition = mockGitlabBindingDefinition({
    key: 'gitlab-config',
    url: 'https://gitlab.example.com',
  });

  renderAlmBindingDefinitionForm({
    alm: AlmKeys.GitLab,
    bindingDefinition,
    enforceValidation: false,
  });
  await waitForPurchasableFeaturesLoaded(requestedUrls);

  await userEvent.click(await ui.updateSecretFieldButton.find());
  await userEvent.type(await ui.configurationInput('personal_access_token').find(), 'New Token');
  await userEvent.click(ui.saveConfigurationButton.get());

  await waitFor(() => {
    expect(findRefreshRequest(requestedUrls, 'gitlab-config')).not.toBeUndefined();
  });

  stopTracking();
});

it('refreshes the Remediation Agent permission result after creating a supported connection', async () => {
  const { requestedUrls, stopTracking } = trackRequestedUrls();

  renderAlmBindingDefinitionForm({ alm: AlmKeys.GitLab, enforceValidation: false });
  await waitForPurchasableFeaturesLoaded(requestedUrls);

  await userEvent.type(await ui.configurationInput('name.gitlab').find(), 'new-connection');
  await userEvent.type(ui.configurationInput('url.gitlab').get(), 'https://api.alm.com');
  await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');
  await userEvent.click(ui.saveConfigurationButton.get());

  await waitFor(() => {
    expect(findRefreshRequest(requestedUrls, 'new-connection')).not.toBeUndefined();
  });

  stopTracking();
});

it('refreshes with the new key when a connection is renamed', async () => {
  jest.mocked(updateGitlabConfiguration).mockResolvedValueOnce(undefined);
  const { requestedUrls, stopTracking } = trackRequestedUrls();
  const bindingDefinition = mockGitlabBindingDefinition({
    key: 'old-key',
    url: 'https://gitlab.example.com',
  });

  renderAlmBindingDefinitionForm({
    alm: AlmKeys.GitLab,
    bindingDefinition,
    enforceValidation: false,
  });
  await waitForPurchasableFeaturesLoaded(requestedUrls);

  const nameInput = await ui.configurationInput('name.gitlab').find();
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'new-key');
  await userEvent.click(ui.saveConfigurationButton.get());

  await waitFor(() => {
    expect(jest.mocked(updateGitlabConfiguration)).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'old-key', newKey: 'new-key' }),
    );
  });
  await waitFor(() => {
    expect(findRefreshRequest(requestedUrls, 'new-key')).not.toBeUndefined();
  });
  expect(findRefreshRequest(requestedUrls, 'old-key')).toBeUndefined();

  stopTracking();
});

it('does not refresh the Remediation Agent permission result when the save fails', async () => {
  jest.mocked(createGitlabConfiguration).mockRejectedValueOnce(new Error('save failed'));
  const { requestedUrls, stopTracking } = trackRequestedUrls();

  renderAlmBindingDefinitionForm({ alm: AlmKeys.GitLab, enforceValidation: false });
  await waitForPurchasableFeaturesLoaded(requestedUrls);

  await userEvent.type(await ui.configurationInput('name.gitlab').find(), 'new-connection');
  await userEvent.type(ui.configurationInput('url.gitlab').get(), 'https://api.alm.com');
  await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');
  await userEvent.click(ui.saveConfigurationButton.get());

  await waitFor(() => {
    expect(jest.mocked(createGitlabConfiguration)).toHaveBeenCalled();
  });
  expect(
    requestedUrls.some((url) => url.includes('/api/v2/dop-translation/permission-checks')),
  ).toBe(false);

  stopTracking();
});

it.each([
  {
    name: 'the Remediation Agent feature is unavailable, even for a supported ALM',
    alm: AlmKeys.GitLab,
    configurationKey: 'unavailable-feature-connection',
    prepare: () =>
      billingHandler.setPurchasableFeatures(
        mockBillingPurchasableFeatures().map((feature) =>
          feature.featureKey === EntitlementCheckFeatureKey.RemediationAgent
            ? { ...feature, isAvailable: false }
            : feature,
        ),
      ),
    fillForm: async () => {
      await userEvent.type(
        await ui.configurationInput('name.gitlab').find(),
        'unavailable-feature-connection',
      );
      await userEvent.type(ui.configurationInput('url.gitlab').get(), 'https://api.alm.com');
      await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');
    },
  },
  {
    name: 'the ALM is not supported by the Remediation Agent, even with the feature available',
    alm: AlmKeys.BitbucketServer,
    configurationKey: 'unsupported-alm-connection',
    prepare: () => {},
    fillForm: async () => {
      await userEvent.click(await ui.bitbucketConfiguration(AlmKeys.BitbucketServer).find());
      await userEvent.type(
        await ui.configurationInput('name.bitbucket').find(),
        'unsupported-alm-connection',
      );
      await userEvent.type(ui.configurationInput('url.bitbucket').get(), 'https://api.alm.com');
      await userEvent.type(ui.configurationInput('personal_access_token').get(), 'Access Token');
    },
  },
])('does not refresh when $name', async ({ alm, configurationKey, prepare, fillForm }) => {
  prepare();
  const { requestedUrls, stopTracking } = trackRequestedUrls();

  renderAlmBindingDefinitionForm({ alm, enforceValidation: false });
  await waitForPurchasableFeaturesLoaded(requestedUrls);

  await fillForm();
  await userEvent.click(ui.saveConfigurationButton.get());

  await waitFor(() => {
    expect(
      requestedUrls.some(
        (url) =>
          url.includes('/api/v2/dop-translation/permission-checks') && url.includes('refresh=true'),
      ),
    ).toBe(false);
  });
  expect(findRefreshRequest(requestedUrls, configurationKey)).toBeUndefined();

  stopTracking();
});

it.each([
  [AlmKeys.BitbucketCloud, 'workspace.bitbucketcloud'],
  [AlmKeys.BitbucketServer, 'url.bitbucket'],
])('configures %s directly when the caller already picked the variant', async (alm, field) => {
  renderAlmBindingDefinitionForm({ alm, hideBitbucketVariantChoice: true });

  expect(await ui.configurationInput(field).find()).toBeInTheDocument();
  expect(ui.bitbucketConfiguration(AlmKeys.BitbucketServer).query()).not.toBeInTheDocument();
  expect(ui.bitbucketConfiguration(AlmKeys.BitbucketCloud).query()).not.toBeInTheDocument();
});

it('asks for the variant on the settings tab covering both Bitbuckets', async () => {
  renderAlmBindingDefinitionForm({ alm: AlmKeys.BitbucketServer });

  expect(await ui.bitbucketConfiguration(AlmKeys.BitbucketServer).find()).toBeInTheDocument();
  expect(ui.configurationInput('url.bitbucket').query()).not.toBeInTheDocument();

  await userEvent.click(ui.bitbucketConfiguration(AlmKeys.BitbucketCloud).get());

  expect(ui.configurationInput('workspace.bitbucketcloud').get()).toBeInTheDocument();
});

function renderAlmBindingDefinitionForm(props: Partial<AlmBindingDefinitionFormProps> = {}) {
  return renderComponent(
    <AlmBindingDefinitionForm
      afterSubmit={jest.fn()}
      alm={AlmKeys.GitLab}
      enforceValidation
      onCancel={onCancel}
      {...props}
    />,
  );
}
