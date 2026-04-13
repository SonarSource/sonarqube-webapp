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
import { SourceAttribution } from '../SourceAttribution';

it('should render a single source', () => {
  renderComponent(<SourceAttribution sources={['IBM/Ponemon 2025']} />);

  expect(screen.getByText('IBM/Ponemon 2025')).toBeInTheDocument();
});

it('should render multiple sources joined by separator', () => {
  renderComponent(<SourceAttribution sources={['IBM/Ponemon 2025', 'HackerOne 2024']} />);

  expect(screen.getByText('IBM/Ponemon 2025 · HackerOne 2024')).toBeInTheDocument();
});

it('should render nothing when sources array is empty', () => {
  const { container } = renderComponent(<SourceAttribution sources={[]} />);

  expect(container).toBeEmptyDOMElement();
});
