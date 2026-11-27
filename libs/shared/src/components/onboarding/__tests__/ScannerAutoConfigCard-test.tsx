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
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import { ScannerAutoConfigCard } from '../ScannerAutoConfigCard';

const ui = {
  adminRequired: byText('onboarding.scanner_autoconfig.admin_required'),
  androidInfo: byText('onboarding.scanner_autoconfig.android_info'),
  betaBadge: byText('beta'),
  docsLink: byRole('link'),
  toggle: byRole('switch', { name: 'onboarding.scanner_autoconfig.toggle' }),
};

it('shows the opt-in with a beta badge and a link to the documentation', () => {
  setup();

  expect(ui.toggle.get()).toBeVisible();
  expect(ui.toggle.get()).toBeEnabled();
  expect(ui.betaBadge.get()).toBeVisible();
  expect(ui.docsLink.get()).toHaveAttribute('href', 'https://docs.example.com/auto-config');
  expect(ui.adminRequired.query()).not.toBeInTheDocument();
  expect(ui.androidInfo.query()).not.toBeInTheDocument();
});

it('reflects whether the opt-in is on', () => {
  setup({ isEnabled: true });

  expect(ui.toggle.get()).toBeChecked();
});

it('reports the new value when toggled', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  setup({ onChange });

  await user.click(ui.toggle.get());

  expect(onChange).toHaveBeenCalledWith(true);
});

it('explains to non-administrators why the opt-in cannot be changed', () => {
  setup({ canAdministerProject: false });

  expect(ui.toggle.get()).toBeDisabled();
  expect(ui.adminRequired.get()).toBeVisible();
});

it('disables the opt-in while the change is being saved', () => {
  setup({ isPending: true });

  expect(ui.toggle.get()).toBeDisabled();
  expect(ui.adminRequired.query()).not.toBeInTheDocument();
});

it('warns about Android projects when asked to', () => {
  setup({ showAndroidInfo: true });

  expect(ui.androidInfo.get()).toBeVisible();
});

function setup(overrides: Partial<React.ComponentProps<typeof ScannerAutoConfigCard>> = {}) {
  return renderWithContext(
    <ScannerAutoConfigCard
      canAdministerProject
      docUrl="https://docs.example.com/auto-config"
      isEnabled={false}
      isPending={false}
      onChange={jest.fn()}
      {...overrides}
    />,
  );
}
