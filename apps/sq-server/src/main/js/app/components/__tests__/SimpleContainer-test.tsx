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
import { Route } from 'react-router-dom';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { SimpleContainer } from '../SimpleContainer';

/* GlobalFooter is mocked globally. Override it here to check its existence */
jest.mock('~adapters/components/layout/GlobalFooter', () => ({
  GlobalFooter() {
    return <footer />;
  },
}));

function Child() {
  return <div>Test Child Content</div>;
}

it('should render with top bar by default', () => {
  renderSimpleContainer();

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByText('Test Child Content')).toBeInTheDocument();

  // contentinfo is the footer role
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

it('should hide top bar when hideTopBarAndFooter is true', () => {
  renderSimpleContainer({ hideTopBarAndFooter: true });

  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  expect(screen.getByText('Test Child Content')).toBeInTheDocument();

  // contentinfo is the footer role
  expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
});

function renderSimpleContainer(props = {}) {
  return renderWithRoutes(
    <Route element={<SimpleContainer {...props} />}>
      <Route element={<Child />} path="*" />
    </Route>,
    {},
  );
}
