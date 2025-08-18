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
import { byRole, byText } from '~shared/helpers/testSelector';
import ScaServiceSettingsMock from '~sq-server-commons/api/mocks/ScaServiceSettingsMock';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import ScaConnectivityTest from '../ScaConnectivityTest';

let scaServiceSettingsMock: ScaServiceSettingsMock;

beforeAll(() => {
  scaServiceSettingsMock = new ScaServiceSettingsMock();
});

afterEach(() => {
  scaServiceSettingsMock.reset();
});

const ui = {
  description: byText('property.sca.admin.selftest.description'),
  detailsButton: byRole('button', { name: 'property.sca.admin.selftest.show_details' }),
  recheckButton: byRole('button', { name: 'property.sca.admin.selftest.recheck' }),
  checkingSpinner: byText('property.sca.admin.selftest.checking'),
  detailsModal: byRole('dialog'),
  closeModal: byRole('button', { name: 'close' }),
};

it('should show and dismiss details dialog', async () => {
  renderScaConnectivityTest();

  expect(ui.description.query()).toBeInTheDocument();

  expect(await ui.detailsButton.find()).toBeVisible();

  // open the details dialog
  await userEvent.click(ui.detailsButton.get());
  expect(ui.detailsModal.query()).toBeInTheDocument();

  // and close it
  await userEvent.click(ui.closeModal.get());
  expect(ui.detailsModal.query()).not.toBeInTheDocument();
});

it('should be able to trigger recheck', async () => {
  renderScaConnectivityTest();

  expect(ui.description.query()).toBeInTheDocument();

  const recheckButton = await ui.recheckButton.find();
  expect(recheckButton).toBeVisible();
  await waitFor(() => {
    expect(recheckButton).toBeEnabled();
  });

  // click the recheck button and see if the spinner shows
  await userEvent.click(recheckButton);
  expect(ui.checkingSpinner.query()).toBeInTheDocument();
});

function renderScaConnectivityTest() {
  return renderComponent(<ScaConnectivityTest />);
}
