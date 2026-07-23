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
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { DeltaIndicator } from '../DeltaIndicator';

it('should render positive delta with up arrow', () => {
  renderComponent(<DeltaIndicator current={150} period="quarter" previous={100} />);

  expect(screen.getByText(/\+50%/)).toBeInTheDocument();
  expect(screen.getByText(/\u25B2/)).toBeInTheDocument(); // up arrow
});

it('should render negative delta with down arrow', () => {
  renderComponent(<DeltaIndicator current={50} period="year" previous={100} />);

  expect(screen.getByText(/-50%/)).toBeInTheDocument();
  expect(screen.getByText(/\u25BC/)).toBeInTheDocument(); // down arrow
});

it('should render nothing when previous is zero', () => {
  const { container } = renderComponent(
    <DeltaIndicator current={100} period="month" previous={0} />,
  );

  expect(container).toBeEmptyDOMElement();
});

it('should display period label from intl', () => {
  renderComponent(<DeltaIndicator current={200} period="year" previous={100} />);

  expect(screen.getByText(/cost_savings.delta.vs_previous/)).toBeInTheDocument();
});
