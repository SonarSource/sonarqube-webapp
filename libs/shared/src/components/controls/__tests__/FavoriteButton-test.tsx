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
import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { ComponentQualifier } from '../../../types/component';
import FavoriteButton from '../FavoriteButton';

it('should render favorite', () => {
  setupWithProps({ favorite: true });
  expect(screen.getByRole('button', { name: 'favorite.action.TRK.remove' })).toBeVisible();
});

it('should render not favorite', () => {
  setupWithProps({ favorite: false });
  expect(screen.getByRole('button', { name: 'favorite.action.TRK.add' })).toBeVisible();
});

it('should toggle favorite', async () => {
  const toggleFavorite = jest.fn();
  const { user } = setupWithProps({ favorite: false, toggleFavorite });

  await user.click(screen.getByRole('button', { name: 'favorite.action.TRK.add' }));
  expect(toggleFavorite).toHaveBeenCalled();
});

function setupWithProps(props: Partial<ComponentProps<typeof FavoriteButton>> = {}) {
  return renderWithContext(
    <FavoriteButton
      favorite
      qualifier={ComponentQualifier.Project}
      toggleFavorite={jest.fn()}
      {...props}
    />,
  );
}
