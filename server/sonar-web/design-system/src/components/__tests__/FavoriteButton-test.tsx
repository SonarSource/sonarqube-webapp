/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import userEvent from '@testing-library/user-event';
import { render } from '../../helpers/testUtils';
import { FCProps } from '../../types/misc';
import { FavoriteButton } from '../FavoriteButton';

it('should render favorite filled', () => {
  const { container } = renderFavoriteButton({ favorite: true });
  expect(screen.getByLabelText('label-info')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

it('should render favorite empty', () => {
  const { container } = renderFavoriteButton();
  expect(screen.getByLabelText('label-info')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

it('should toggle favorite', async () => {
  const toggleFavorite = jest.fn();
  renderFavoriteButton({ toggleFavorite });
  await userEvent.click(screen.getByRole('button'));
  expect(toggleFavorite).toHaveBeenCalled();
});

function renderFavoriteButton(props: Partial<FCProps<typeof FavoriteButton>> = {}) {
  return render(
    <FavoriteButton favorite overlay="label-info" toggleFavorite={jest.fn()} {...props} />
  );
}
