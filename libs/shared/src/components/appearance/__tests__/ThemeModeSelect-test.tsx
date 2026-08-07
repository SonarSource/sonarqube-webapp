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

import { screen } from '@testing-library/react';
import { useThemeMode } from '~adapters/helpers/useThemeMode';
import { render } from '../../../helpers/test-utils';
import { byRole } from '../../../helpers/testSelector';
import { ThemeMode } from '../../../types/themes';
import { ThemeModeSelect } from '../ThemeModeSelect';

jest.mock('~adapters/helpers/useThemeMode', () => ({
  useThemeMode: jest.fn().mockReturnValue(['light-theme', jest.fn()]),
}));

beforeEach(() => {
  jest.mocked(useThemeMode).mockReset();
});

it('should render correctly', () => {
  jest.mocked(useThemeMode).mockReturnValue([ThemeMode.Light, jest.fn()]);

  renderThemeModeSelect();

  expect(byRole('radio').getAll()).toHaveLength(3);
});

it('should select current theme', () => {
  jest.mocked(useThemeMode).mockReturnValue([ThemeMode.Dark, jest.fn()]);

  renderThemeModeSelect();

  expect(
    screen.getByRole('radio', {
      name: 'theme_select_card_title.dark-theme',
    }),
  ).toBeChecked();
});

it('should call onThemeSelect', async () => {
  const onThemeSelect = jest.fn();
  jest.mocked(useThemeMode).mockReturnValue([ThemeMode.Dark, onThemeSelect]);

  const { user } = renderThemeModeSelect();

  await user.click(screen.getByText('theme_select_card_title.system'));
  expect(onThemeSelect).toHaveBeenCalledWith(ThemeMode.System);
});

function renderThemeModeSelect() {
  return render(<ThemeModeSelect />);
}
