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
import { registerServiceMocks } from '~shared/api/mocks/server';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { EntitlementsServiceMock } from '~sq-server-commons/api/mocks/EntitlementsServiceMock';
import ScaServiceSettingsMock from '~sq-server-commons/api/mocks/ScaServiceSettingsMock';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ExtendedSettingDefinition } from '~sq-server-commons/types/settings';
import Sca from '../Sca';

let scaServiceSettingsMock: ScaServiceSettingsMock;
let entitlementsMock: EntitlementsServiceMock;

const SCA_FEATURE_ENABLED_KEY = 'sonar.sca.featureEnabled';
const WRONG_CATEGORY_KEY = 'sonar.other.enabled';
const VISIBLE_CATEGORY_KEY = 'sonar.sca.option';

// This is driven by the backend but we can use this to test the
// filtering logic.
const SETTINGS_DEFINITIONS: ExtendedSettingDefinition[] = [
  {
    key: SCA_FEATURE_ENABLED_KEY,
    description: 'enabled, should not appear',
    options: [],
    category: 'Advanced Security',
    subCategory: 'SCA',
    fields: [{ key: SCA_FEATURE_ENABLED_KEY, name: SCA_FEATURE_ENABLED_KEY, options: [] }],
  },
  {
    key: WRONG_CATEGORY_KEY,
    description: 'wrong subcategory, should not appear',
    options: [],
    category: 'Advanced Security',
    subCategory: 'other',
    fields: [{ key: WRONG_CATEGORY_KEY, name: WRONG_CATEGORY_KEY, options: [] }],
  },
  {
    key: VISIBLE_CATEGORY_KEY,
    description: 'right subcategory, should appear',
    options: [],
    category: 'Advanced Security',
    subCategory: 'SCA',
    fields: [{ key: VISIBLE_CATEGORY_KEY, name: VISIBLE_CATEGORY_KEY, options: [] }],
  },
];

jest.mock('../helpers', (): object => {
  return {
    ...jest.requireActual('../helpers'),
    reloadWindow: jest.fn(),
  };
});

beforeAll(() => {
  scaServiceSettingsMock = new ScaServiceSettingsMock();
  entitlementsMock = new EntitlementsServiceMock({
    purchasableFeatures: [{ featureKey: 'sca', isAvailable: true }],
  });
});

beforeEach(() => {
  registerServiceMocks(entitlementsMock);
});

afterEach(() => {
  scaServiceSettingsMock.reset();
  entitlementsMock.reset();
});

const ui = {
  header: byText('settings.advanced_security.title'),
  headerDescription: byText('settings.advanced_security.description'),
  description: byText('property.sca.admin.description'),
  enabledScaFeatureCheckbox: byRole('checkbox', { name: 'property.sca.admin.checkbox.label' }),

  // form buttons
  save: byRole('button', { name: 'save' }),
  cancel: byRole('button', { name: 'cancel' }),

  // The callout box title and text are dependent on the value of `sonar.sca.enabled`, which
  // is NOT mocked in this test.
  //
  // active and enabled-by-default message
  enabledMessageTitle: byText('property.sca.admin.enabled.message.title'),
  // active and disabled-by-default message
  disabledMessageTitle: byText('property.sca.admin.disabled.message.title'),
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
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });
});

it('should toggle the checkbox and dirty the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });
  expect(ui.save.query()).not.toBeInTheDocument();
  expect(ui.cancel.query()).not.toBeInTheDocument();

  await user.click(ui.enabledScaFeatureCheckbox.get());
  expect(ui.enabledScaFeatureCheckbox.get()).not.toBeChecked();
  expect(await ui.save.find()).toBeEnabled();
  expect(await ui.cancel.find()).toBeEnabled();

  await user.click(ui.enabledScaFeatureCheckbox.get());
  expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  expect(ui.save.query()).not.toBeInTheDocument();
  expect(ui.cancel.query()).not.toBeInTheDocument();
});

it('should cancel changes to the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });

  // dirty the form
  await user.click(ui.enabledScaFeatureCheckbox.get());
  expect(await ui.cancel.find()).toBeEnabled();

  // cancel changes
  await user.click(ui.cancel.get());
  expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
});

it('should submit changes to the form', async () => {
  renderScaAdmin();

  const user = userEvent.setup();

  expect(await ui.description.find()).toBeInTheDocument();
  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });

  // dirty the form
  await user.click(ui.enabledScaFeatureCheckbox.get());
  expect(await ui.cancel.find()).toBeEnabled();

  // save the form
  await user.click(ui.save.get());

  // confirm the modal
  await user.click(ui.confirmModal.get());

  // no message
  expect(ui.enabledMessageTitle.query()).not.toBeInTheDocument();
  expect(ui.disabledMessageTitle.query()).not.toBeInTheDocument();

  // toggle it on and submit again
  await user.click(ui.enabledScaFeatureCheckbox.get());

  expect(await ui.cancel.find()).toBeEnabled();

  await user.click(ui.save.get());
  await user.click(ui.confirmModal.get());

  // message
  expect(ui.disabledMessageTitle.query()).toBeInTheDocument();
});

it('should show the message if it is appropriate', async () => {
  renderScaAdmin();

  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });

  expect(ui.disabledMessageTitle.query()).toBeInTheDocument();
});

it('should handle feature not enabled', async () => {
  scaServiceSettingsMock.isEnabled = false;

  renderScaAdmin();

  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).not.toBeChecked();
  });

  expect(ui.enabledMessageTitle.query()).not.toBeInTheDocument();
  expect(ui.disabledMessageTitle.query()).not.toBeInTheDocument();
});

it('should not show the form if the feature is not available', () => {
  entitlementsMock.data.purchasableFeatures = [
    { featureKey: 'sca', isAvailable: false, isEnabled: false },
  ];
  renderScaAdmin();

  expect(ui.description.query()).not.toBeInTheDocument();
  expect(byText('settings.key_x.' + VISIBLE_CATEGORY_KEY).query()).not.toBeInTheDocument();
});

it('should render the correct definitions', async () => {
  renderScaAdmin();

  await waitFor(() => {
    expect(ui.enabledScaFeatureCheckbox.get()).toBeChecked();
  });

  expect(byText('settings.key_x.' + VISIBLE_CATEGORY_KEY).query()).toBeInTheDocument();
  expect(byText('settings.key_x.' + WRONG_CATEGORY_KEY).query()).not.toBeInTheDocument();
  expect(byText('settings.key_x.' + SCA_FEATURE_ENABLED_KEY).query()).not.toBeInTheDocument();
});

function renderScaAdmin() {
  return renderComponent(<Sca definitions={SETTINGS_DEFINITIONS} />);
}
