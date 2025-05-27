/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import ScaServiceSettingsMock from '~sq-server-commons/api/mocks/ScaServiceSettingsMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byLabelText, byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';

import { Feature } from '~sq-server-commons/types/features';
import Sca from '../Sca';

let scaServiceSettingsMock: ScaServiceSettingsMock;

jest.mock('../helpers', (): object => {
  return {
    ...jest.requireActual('../helpers'),
    reloadWindow: jest.fn(),
  };
});

beforeAll(() => {
  scaServiceSettingsMock = new ScaServiceSettingsMock();
});

beforeEach(() => {
  window.localStorage.removeItem('sonarqube.sca.show_enabled_message');
});

afterEach(() => {
  scaServiceSettingsMock.reset();
  window.localStorage.removeItem('sonarqube.sca.show_enabled_message');
});

const ui = {
  header: byText('settings.advanced_security.title'),
  headerDescription: byText('settings.advanced_security.description'),
  description: byText('property.sca.admin.description'),
  enabledScaCheckbox: byRole('checkbox', { name: 'property.sca.admin.checkbox.label' }),

  // form buttons
  save: byRole('button', { name: 'save' }),
  cancel: byRole('button', { name: 'cancel' }),

  // enabled message
  enabledMessageTitle: byText('property.sca.admin.enabled.message.title'),
  dismiss: byLabelText('message_callout.dismiss'),

  // modal
  confirmModal: byRole('button', { name: 'confirm' }),
  dismissModal: byRole('button', { name: 'property.sca.cancel.modal.continue_editing' }),
};

it('should display the form using data loaded from the backend', async () => {
  renderScaAdmin();

  expect(await ui.header.find()).toBeInTheDocument();
  expect(await ui.headerDescription.find()).toBeInTheDocument();
  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).toBeChecked();
  });
});

it('should toggle the checkbox and dirty the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).toBeChecked();
  });
  expect(ui.save.query()).not.toBeInTheDocument();
  expect(ui.cancel.query()).not.toBeInTheDocument();

  await user.click(ui.enabledScaCheckbox.get());
  expect(ui.enabledScaCheckbox.get()).not.toBeChecked();
  expect(await ui.save.find()).toBeEnabled();
  expect(await ui.cancel.find()).toBeEnabled();

  await user.click(ui.enabledScaCheckbox.get());
  expect(ui.enabledScaCheckbox.get()).toBeChecked();
  expect(ui.save.query()).not.toBeInTheDocument();
  expect(ui.cancel.query()).not.toBeInTheDocument();
});

it('should cancel changes to the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).toBeChecked();
  });

  // dirty the form
  await user.click(ui.enabledScaCheckbox.get());
  expect(await ui.cancel.find()).toBeEnabled();

  // cancel changes
  await user.click(ui.cancel.get());
  expect(ui.enabledScaCheckbox.get()).toBeChecked();
});

it('should submit changes to the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).toBeChecked();
  });

  // dirty the form
  await user.click(ui.enabledScaCheckbox.get());
  expect(await ui.cancel.find()).toBeEnabled();

  // save the form
  await user.click(ui.save.get());

  // confirm the modal
  await user.click(ui.confirmModal.get());

  // no message
  expect(ui.enabledMessageTitle.query()).not.toBeInTheDocument();

  // toggle it on and submit again
  await user.click(ui.enabledScaCheckbox.get());

  expect(await ui.cancel.find()).toBeEnabled();

  await user.click(ui.save.get());
  await user.click(ui.confirmModal.get());

  // message
  expect(ui.enabledMessageTitle.query()).toBeInTheDocument();
});

it('should show the message if it has not been dismissed', async () => {
  window.localStorage.setItem('sonarqube.sca.show_enabled_message', 'true');

  renderScaAdmin();

  const user = userEvent.setup();

  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).toBeChecked();
  });

  expect(ui.enabledMessageTitle.query()).toBeInTheDocument();

  await user.click(ui.dismiss.get());
  expect(ui.enabledMessageTitle.query()).not.toBeInTheDocument();
});

it('should handle feature not enabled', async () => {
  scaServiceSettingsMock.isEnabled = false;

  renderScaAdmin();

  await waitFor(() => {
    expect(ui.enabledScaCheckbox.get()).not.toBeChecked();
  });

  expect(ui.enabledMessageTitle.query()).not.toBeInTheDocument();
});

it('should not show the form if the feature is not available', () => {
  renderScaAdmin([]);

  expect(ui.description.query()).not.toBeInTheDocument();
});

function renderScaAdmin(features?: Feature[]) {
  return renderComponent(
    <AvailableFeaturesContext.Provider value={features ?? [Feature.ScaAvailable]}>
      <Sca />
    </AvailableFeaturesContext.Provider>,
  );
}
