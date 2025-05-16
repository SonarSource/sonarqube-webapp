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
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';

import { Feature } from '~sq-server-commons/types/features';
import Sca from '../Sca';

let scaServiceSettingsMock: ScaServiceSettingsMock;

beforeAll(() => {
  scaServiceSettingsMock = new ScaServiceSettingsMock();
});

afterEach(() => {
  scaServiceSettingsMock.reset();
});

const ui = {
  header: byText('settings.advanced_security.title'),
  headerDescription: byText('settings.advanced_security.description'),
  description: byText('property.sca.admin.description'),
  enabledScaCheckbox: byRole('checkbox', { name: 'property.sca.admin.checkbox.label' }),

  // form buttons
  save: byRole('button', { name: 'save' }),
  cancel: byRole('button', { name: 'cancel' }),

  // cancel modal
  confirmCancelModal: byRole('button', { name: 'confirm' }),
  dismissCancelModal: byRole('button', { name: 'property.sca.cancel.modal.continue_editing' }),
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
