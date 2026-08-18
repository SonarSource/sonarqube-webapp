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
import { byRole, byText } from '~shared/helpers/testSelector';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { flushPromises } from '~sq-server-commons/helpers/testUtils';
import { DASHBOARD_HISTORY_RETENTION_KEY } from '../../../constants';
import { DashboardRetentionSection } from '../DashboardRetentionSection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  unstable_usePrompt: jest.fn(),
}));

let settingsServiceMock: SettingsServiceMock;

beforeEach(() => {
  settingsServiceMock = new SettingsServiceMock();
});

afterEach(async () => {
  settingsServiceMock.reset();
  await flushPromises();
});

const ui = {
  heading: byRole('heading', { name: 'settings.dashboard.retention.title' }),
  radio365: byRole('radio', { name: 'settings.dashboard.retention.option.365' }),
  radio180: byRole('radio', { name: 'settings.dashboard.retention.option.180' }),
  radio90: byRole('radio', { name: 'settings.dashboard.retention.option.90' }),
  radioCustom: byRole('radio', { name: 'settings.dashboard.retention.option.custom' }),
  customInput: byRole('spinbutton'),
  displayLimitCallout: byText('settings.dashboard.retention.display_limit.title'),
  validationHint: byText('settings.dashboard.retention.custom.hint'),
  saveButton: byRole('button', { name: 'save' }),
  cancelButton: byRole('button', { name: 'cancel' }),
  reduceModalTitle: byRole('heading', {
    name: 'settings.dashboard.retention.reduce_modal.title',
  }),
  reduceRetentionButton: byRole('button', {
    name: 'settings.dashboard.retention.reduce_modal.confirm',
  }),
  successToast: byText('settings.dashboard.retention.success'),
  settingKey: byText(new RegExp(DASHBOARD_HISTORY_RETENTION_KEY)),
};

function renderDashboardRetentionSection() {
  const user = userEvent.setup();
  renderComponent(<DashboardRetentionSection />);
  return { user };
}

it('renders with 365 days (Recommended) selected by default', async () => {
  renderDashboardRetentionSection();

  expect(await ui.radio365.find()).toBeChecked();
  expect(ui.radio180.get()).not.toBeChecked();
  expect(ui.radio90.get()).not.toBeChecked();
  expect(ui.radioCustom.get()).not.toBeChecked();
});

it('shows Save button disabled when no changes', async () => {
  renderDashboardRetentionSection();

  await ui.radio365.find();
  expect(ui.saveButton.get()).toBeDisabled();
  expect(ui.cancelButton.query()).not.toBeInTheDocument();
});

it('enables Save and shows Cancel when a different preset is selected', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radio180.get());

  expect(ui.saveButton.get()).toBeEnabled();
  expect(await ui.cancelButton.find()).toBeInTheDocument();
});

it('saves a higher preset value without showing the reduce modal', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '90');
  const { user } = renderDashboardRetentionSection();

  await waitFor(() => expect(ui.radio90.get()).toBeChecked());
  await user.click(ui.radio365.get());
  await user.click(ui.saveButton.get());

  expect(ui.reduceModalTitle.query()).not.toBeInTheDocument();
  expect(await ui.successToast.find()).toBeInTheDocument();
});

it('shows the reduce retention modal when lowering the value', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '365');
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radio180.get());
  await user.click(ui.saveButton.get());

  expect(await ui.reduceModalTitle.find()).toBeInTheDocument();
});

it('cancelling the reduce modal leaves the stored value unchanged', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '365');
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radio180.get());
  await user.click(ui.saveButton.get());

  await ui.reduceModalTitle.find();
  await user.click(byRole('button', { name: 'cancel' }).get());

  expect(ui.reduceModalTitle.query()).not.toBeInTheDocument();
  expect(ui.radio180.get()).toBeChecked();
  expect(ui.successToast.query()).not.toBeInTheDocument();
});

it('confirming the reduce modal saves and shows success toast', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '365');
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radio180.get());
  await user.click(ui.saveButton.get());

  await ui.reduceModalTitle.find();
  await user.click(ui.reduceRetentionButton.get());

  expect(await ui.successToast.find()).toBeInTheDocument();
  expect(ui.reduceModalTitle.query()).not.toBeInTheDocument();
});

it('cancel resets the form to the saved value', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '365');
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radio180.get());

  expect(await ui.cancelButton.find()).toBeInTheDocument();
  await user.click(ui.cancelButton.get());

  expect(ui.radio365.get()).toBeChecked();
  expect(ui.cancelButton.query()).not.toBeInTheDocument();
});

it('shows the custom input when Custom is selected', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radioCustom.get());

  expect(await ui.customInput.find()).toBeInTheDocument();
  expect(ui.saveButton.get()).toBeDisabled();
});

it('enables Save when a valid custom value is entered', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radioCustom.get());
  await user.type(await ui.customInput.find(), '200');

  expect(ui.saveButton.get()).toBeEnabled();
});

it('shows validation hint and disables Save when custom input is empty', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radioCustom.get());
  const input = await ui.customInput.find();
  await user.type(input, '200');
  await user.clear(input);

  expect(await ui.validationHint.find()).toBeInTheDocument();
  expect(ui.saveButton.get()).toBeDisabled();
});

it('shows the display limit callout when custom value exceeds 365', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radioCustom.get());
  await user.type(await ui.customInput.find(), '400');

  expect(await ui.displayLimitCallout.find()).toBeInTheDocument();
});

it('does not show the display limit callout for custom value <= 365', async () => {
  const { user } = renderDashboardRetentionSection();

  await ui.radio365.find();
  await user.click(ui.radioCustom.get());
  await user.type(await ui.customInput.find(), '300');

  expect(ui.displayLimitCallout.query()).not.toBeInTheDocument();
});

it('renders the setting key', async () => {
  renderDashboardRetentionSection();

  expect(await ui.settingKey.find()).toBeInTheDocument();
});

it('restores custom value when switching back to Custom after selecting a preset', async () => {
  settingsServiceMock.set(DASHBOARD_HISTORY_RETENTION_KEY, '200');
  const { user } = renderDashboardRetentionSection();

  await waitFor(() => expect(ui.radioCustom.get()).toBeChecked());
  await user.click(ui.radio90.get());
  await user.click(ui.radioCustom.get());

  expect(await ui.customInput.find()).toHaveValue(200);
});
