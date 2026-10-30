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
import { Link, Route, useLocation } from 'react-router';
import { renderWithRouter, renderWithRoutes } from '../test-utils';

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output>{pathname + search}</output>;
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

it('uses browser history for the opt-in routes harness', async () => {
  const { user } = renderWithRoutes(
    <>
      <Route element={<Link to="/next?tab=layout">next</Link>} path="/start" />
      <Route element={<LocationProbe />} path="/next" />
    </>,
    {
      initialEntries: [{ pathname: '/start', search: '?tab=overview' }],
      routerMode: 'browser',
    },
  );

  expect(window.location.pathname + window.location.search).toBe('/start?tab=overview');
  await user.click(screen.getByRole('link', { name: 'next' }));
  expect(await screen.findByRole('status')).toHaveTextContent('/next?tab=layout');
  expect(window.location.pathname + window.location.search).toBe('/next?tab=layout');
});

it('supports browser navigation in the single-element harness', async () => {
  const { user } = renderWithRouter(<Link to="/next">next</Link>, {
    additionalRoutes: <Route element={<LocationProbe />} path="/next" />,
    routerMode: 'browser',
  });

  await user.click(screen.getByRole('link', { name: 'next' }));
  expect(await screen.findByRole('status')).toHaveTextContent('/next');
  expect(window.location.pathname).toBe('/next');
});
