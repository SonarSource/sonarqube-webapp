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
import SettingsServiceMock from '~sq-server-shared/api/mocks/SettingsServiceMock';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { SettingsKey } from '~sq-server-shared/types/settings';
import { EarlyAccessFeatures } from '../EarlyAccessFeatures';

let settingServiceMock = new SettingsServiceMock();

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
});

afterEach(() => {
  settingServiceMock.reset();
});

const ui = {
  checkbox: (label: string) => byRole('checkbox', { name: new RegExp(label) }),
  saveBtn: byRole('button', { name: 'save' }),
  cancelBtn: byRole('button', { name: 'cancel' }),
  dialogConfirm: byRole('dialog').byRole('button', { name: 'confirm' }),
};

describe('early access features', () => {
  describe('MISRA', () => {
    it('can enable misra feature', async () => {
      settingServiceMock.set(SettingsKey.MISRACompliance, false);
      const user = userEvent.setup();
      renderEarlyAccessFeatures();

      expect(byRole('heading', { name: 'settings.early_access.title' }).get()).toBeInTheDocument();
      expect(
        await byRole('heading', { name: 'settings.early_access.misra.title' }).find(),
      ).toBeInTheDocument();
      expect(ui.checkbox('settings.early_access.misra.checkbox_label').get()).not.toBeChecked();
      await user.click(ui.checkbox('settings.early_access.misra.checkbox_label').get());

      expect(ui.saveBtn.get()).toBeInTheDocument();

      // reset change
      await user.click(ui.cancelBtn.get());
      expect(ui.saveBtn.query()).not.toBeInTheDocument();

      // check again
      await user.click(ui.checkbox('settings.early_access.misra.checkbox_label').get());
      await user.click(ui.saveBtn.get());

      expect(
        byRole('heading', { name: 'settings.early_access.misra.dialog_title.true' }).get(),
      ).toBeInTheDocument();
      expect(
        byText('settings.early_access.misra.dialog_description.enable').get(),
      ).toBeInTheDocument();

      await user.click(ui.dialogConfirm.get());

      expect(ui.saveBtn.query()).not.toBeInTheDocument();
      expect(ui.checkbox('settings.early_access.misra.checkbox_label').get()).toBeChecked();
    });

    it('can disable misra feature', async () => {
      settingServiceMock.set(SettingsKey.MISRACompliance, true);
      const user = userEvent.setup();
      renderEarlyAccessFeatures();

      expect(byRole('heading', { name: 'settings.early_access.title' }).get()).toBeInTheDocument();
      expect(
        await byRole('heading', { name: 'settings.early_access.misra.title' }).find(),
      ).toBeInTheDocument();
      expect(ui.checkbox('settings.early_access.misra.checkbox_label').get()).toBeChecked();

      await user.click(ui.checkbox('settings.early_access.misra.checkbox_label').get());
      await user.click(ui.saveBtn.get());

      expect(
        byRole('heading', { name: 'settings.early_access.misra.dialog_title.false' }).get(),
      ).toBeInTheDocument();
      expect(
        byText('settings.early_access.misra.dialog_description.disable').get(),
      ).toBeInTheDocument();
      await user.click(ui.dialogConfirm.get());
      expect(ui.saveBtn.query()).not.toBeInTheDocument();
      expect(ui.checkbox('settings.early_access.misra.checkbox_label').get()).not.toBeChecked();
    });

    it('is not rendered when no setting', async () => {
      renderEarlyAccessFeatures();

      expect(byRole('heading', { name: 'settings.early_access.title' }).get()).toBeInTheDocument();
      await waitFor(() => {
        expect(byRole('status').byText('loading').query()).not.toBeInTheDocument();
      });
      expect(
        byRole('heading', { name: 'settings.early_access.misra.title' }).query(),
      ).not.toBeInTheDocument();
    });
  });
});

function renderEarlyAccessFeatures() {
  return renderComponent(<EarlyAccessFeatures />);
}
