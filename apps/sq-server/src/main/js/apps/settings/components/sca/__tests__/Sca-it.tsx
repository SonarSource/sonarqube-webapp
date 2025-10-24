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
import { isDefined } from '~shared/helpers/types';
import { ExtendedSettingDefinition } from '~shared/types/settings';
import { EntitlementsServiceMock } from '~sq-server-commons/api/mocks/EntitlementsServiceMock';
import ScaServiceSettingsMock from '~sq-server-commons/api/mocks/ScaServiceSettingsMock';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
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

it('test should always pass', () => {
  /** This test is here so that CI for community build passes when the rest of the file is removed. */
  expect(isDefined(1)).toBe(true);
});


function renderScaAdmin() {
  return renderComponent(<Sca definitions={SETTINGS_DEFINITIONS} />);
}
