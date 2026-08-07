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

import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import Appearance from '../Appearance';

it('should render correctly', () => {
  renderWithRouter(<Appearance />);
  expect(byRole('heading', { level: 1 }).get()).toHaveTextContent('my_account.appearance.title');
  expect(
    byRole('heading', { level: 2, name: 'my_account.appearance.customize_theme' }).get(),
  ).toBeInTheDocument();

  expect(byText('my_account.appearance.description').get()).toBeInTheDocument();
});
