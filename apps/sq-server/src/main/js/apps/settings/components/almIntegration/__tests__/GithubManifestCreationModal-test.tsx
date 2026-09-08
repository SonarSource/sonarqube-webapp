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
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { createGithubConfigurationFromManifest } from '~sq-server-commons/api/alm-settings';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { GithubManifestSetup } from '~sq-server-commons/types/alm-settings';
import GithubManifestCreationModal from '../GithubManifestCreationModal';

jest.mock('~sq-server-commons/api/alm-settings', () => ({
  createGithubConfigurationFromManifest: jest.fn(),
}));

const ui = {
  keyInput: byLabelText('settings.almintegration.form.name.github', { exact: false }),
  organizationInput: byLabelText('settings.almintegration.github.manifest.organization', {
    exact: false,
  }),
  allowedOrganizationsInputs: byRole('textbox', { name: 'property.allowedOrganizations.name' }),
  textboxes: byRole('textbox'),
  deleteAllowedOrganization: (org: string) =>
    byRole('button', {
      name: `settings.definition.delete_value.property.allowedOrganizations.name.${org}`,
    }),
  alsoDevopsCheckbox: byLabelText('settings.almintegration.github.manifest.also_devops', {
    exact: false,
  }),
  alsoAuthCheckbox: byLabelText('settings.almintegration.github.manifest.also_auth', {
    exact: false,
  }),
  continueButton: byRole('button', { name: 'settings.almintegration.github.manifest.continue' }),
  description: byText('settings.almintegration.github.manifest.info'),
};

function mockManifestResponse(overrides?: Partial<GithubManifestSetup>) {
  jest.mocked(createGithubConfigurationFromManifest).mockResolvedValue({
    githubAppUrl: 'https://github.com/settings/apps/new',
    manifest: '{}',
    state: 's',
    ...overrides,
  });
}

let submitSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  submitSpy = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {
    /* prevent navigation */
  });
});

afterEach(() => {
  submitSpy.mockRestore();
});

it('posts the manifest to the GitHub url with the returned state', async () => {
  const user = userEvent.setup();
  mockManifestResponse({
    githubAppUrl: 'https://github.com/organizations/my-org/settings/apps/new',
    manifest: '{"name":"SonarQube"}',
    state: 'the-state',
  });

  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="devops" />);

  await user.type(await ui.organizationInput.find(), 'my-org');
  // Clear the auto-suggested key and type a custom one
  await user.clear(await ui.keyInput.find());
  await user.type(ui.keyInput.get(), 'my-github');
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: undefined,
    auth: false,
    devops: true,
    key: 'my-github',
    organization: 'my-org',
  });
  const submittedForm = submitSpy.mock.instances[0] as HTMLFormElement;
  expect(submittedForm).toBeDefined();
  expect(submittedForm).toHaveAttribute(
    'action',
    'https://github.com/organizations/my-org/settings/apps/new?state=the-state',
  );
  expect(submittedForm.elements.namedItem('manifest')).toHaveValue('{"name":"SonarQube"}');
});

it('omits organization when left empty', async () => {
  const user = userEvent.setup();
  mockManifestResponse();

  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="devops" />);

  await user.type(await ui.keyInput.find(), 'my-github');
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: undefined,
    auth: false,
    devops: true,
    key: 'my-github',
    organization: undefined,
  });
});

it('trims the configuration name before submitting', async () => {
  const user = userEvent.setup();
  mockManifestResponse();

  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="devops" />);

  await user.type(await ui.keyInput.find(), '  my-github  ');
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: undefined,
    auth: false,
    devops: true,
    key: 'my-github',
    organization: undefined,
  });
});

it('sets up auth (and not devops) when launched from the authentication tab', async () => {
  const user = userEvent.setup();
  mockManifestResponse();

  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  // No configuration key field when only authentication is set up.
  expect(ui.keyInput.query()).not.toBeInTheDocument();
  await user.click(await ui.continueButton.find());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: undefined,
    auth: true,
    devops: false,
    key: undefined,
    organization: undefined,
  });
});

it('auto-suggests the configuration name from the GitHub organization (devops variant)', async () => {
  const user = userEvent.setup();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="devops" />);

  const orgInput = await ui.organizationInput.find();
  const keyInput = ui.keyInput.get();

  // Typing in the org field mirrors into the config name field.
  await user.type(orgInput, 'my-org');
  expect(keyInput).toHaveValue('my-org');

  // Manually editing the config name stops the mirroring.
  await user.clear(keyInput);
  await user.type(keyInput, 'custom-name');
  await user.clear(orgInput);
  await user.type(orgInput, 'other-org');
  expect(keyInput).toHaveValue('custom-name');
});

it('shows the configuration name field below the checkbox in the auth variant', async () => {
  const user = userEvent.setup();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  // Key field is hidden until the checkbox is checked.
  expect(ui.keyInput.query()).not.toBeInTheDocument();

  const checkbox = await ui.alsoDevopsCheckbox.find();
  await user.click(checkbox);

  // Key field now appears (below the checkbox).
  expect(ui.keyInput.get()).toBeInTheDocument();
});

it('pre-fills the configuration name from the GitHub organization in the auth variant', async () => {
  const user = userEvent.setup();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  // Type the org first, before checking the checkbox.
  await user.type(await ui.organizationInput.find(), 'my-org');

  // Check the checkbox to reveal the config name field.
  await user.click(await ui.alsoDevopsCheckbox.find());

  // The config name should be pre-filled with the org value.
  expect(ui.keyInput.get()).toHaveValue('my-org');
});

it('hides the organizations allow list for devops-only flows, and shows it once auth is added', async () => {
  const user = userEvent.setup();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="devops" />);

  expect(ui.allowedOrganizationsInputs.query()).not.toBeInTheDocument();

  await user.click(await ui.alsoAuthCheckbox.find());

  expect(ui.allowedOrganizationsInputs.get()).toBeInTheDocument();
});

it('shows the organizations allow list right away when launched from the authentication tab', async () => {
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  expect(await ui.allowedOrganizationsInputs.find()).toBeInTheDocument();
});

it('pre-fills the organizations allow list from the GitHub organization and submits it', async () => {
  const user = userEvent.setup();
  mockManifestResponse();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  await user.type(await ui.organizationInput.find(), 'my-org');

  expect(ui.allowedOrganizationsInputs.getAll()[0]).toHaveValue('my-org');

  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: ['my-org'],
    auth: true,
    devops: false,
    key: undefined,
    organization: 'my-org',
  });
});

it('stops pre-filling the organizations allow list once it has been edited', async () => {
  const user = userEvent.setup();
  mockManifestResponse();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  const organizationInput = await ui.organizationInput.find();
  await user.type(organizationInput, 'my-org');

  await user.clear(ui.allowedOrganizationsInputs.get());
  await user.type(ui.allowedOrganizationsInputs.get(), 'chosen-org');

  await user.clear(organizationInput);
  await user.type(organizationInput, 'another-host-org');
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: ['chosen-org'],
    auth: true,
    devops: false,
    key: undefined,
    organization: 'another-host-org',
  });
});

it('allows several organizations to be added to the allow list', async () => {
  const user = userEvent.setup();
  mockManifestResponse();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  await user.type(await ui.organizationInput.find(), 'my-org');

  const textboxes = ui.textboxes.getAll();
  await user.type(textboxes[textboxes.length - 1], 'my-other-org');
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: ['my-org', 'my-other-org'],
    auth: true,
    devops: false,
    key: undefined,
    organization: 'my-org',
  });
});

it('submits an empty allow list when the user clears it', async () => {
  const user = userEvent.setup();
  mockManifestResponse();
  renderComponent(<GithubManifestCreationModal onClose={jest.fn()} primaryScope="auth" />);

  await user.type(await ui.organizationInput.find(), 'my-org');
  await user.click(ui.deleteAllowedOrganization('my-org').get());

  // An explicitly emptied allow list must not fall back to the hosting organization, so it is sent as
  // an empty list rather than omitted.
  await user.click(ui.continueButton.get());

  expect(createGithubConfigurationFromManifest).toHaveBeenCalledWith({
    allowedOrganizations: [],
    auth: true,
    devops: false,
    key: undefined,
    organization: 'my-org',
  });
});
