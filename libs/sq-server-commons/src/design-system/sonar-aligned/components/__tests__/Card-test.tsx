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

import { cssVar } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import { render } from '../../../helpers/testUtils';
import { Card, GreyCard, LightGreyCard } from '../Card';

it('renders card correctly', () => {
  render(<Card>Hello</Card>);
  const cardContent = screen.getByText('Hello');
  expect(cardContent).toHaveStyle({
    border: `${cssVar('border-width-default')} solid ${cssVar('color-border-weak')}`,
    'background-color': cssVar('color-surface-default'),
  });
});

it.each([Card, GreyCard, LightGreyCard])(
  'renders %p correctly with classNames',
  (CardComponent) => {
    render(
      <CardComponent className="sw-border-8" role="tabpanel">
        Hello
      </CardComponent>,
    );
    const cardContent = screen.getByText('Hello');
    expect(cardContent).toHaveClass('sw-border-8');
    expect(cardContent).toHaveAttribute('role', 'tabpanel');
  },
);
