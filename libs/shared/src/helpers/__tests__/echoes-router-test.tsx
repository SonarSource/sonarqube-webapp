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

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { echoesRouter } from '../echoes-router';

function PathnameProbe() {
  return <div>{echoesRouter.usePathname()}</div>;
}

describe('echoesRouter', () => {
  it('renders links with the router link component', () => {
    render(
      <MemoryRouter>
        <echoesRouter.Link to="/billing">billing</echoesRouter.Link>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'billing' })).toHaveAttribute('href', '/billing');
  });

  it('returns the current pathname', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio/issues?open=1']}>
        <PathnameProbe />
      </MemoryRouter>,
    );

    expect(screen.getByText('/portfolio/issues')).toBeInTheDocument();
  });
});
