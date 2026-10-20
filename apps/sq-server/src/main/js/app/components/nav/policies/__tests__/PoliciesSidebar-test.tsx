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
import { addons } from '~sq-server-addons/index';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { PoliciesSidebar } from '../PoliciesSidebar';

jest.mock('~sq-server-addons/index', () => ({ addons: {} }));

afterEach(() => {
  addons.sca = undefined;
});

it('shows rules, quality profiles and quality gates without SCA', () => {
  renderApp('*', <PoliciesSidebar />);

  expect(screen.getByText('coding_rules.page')).toBeInTheDocument();
  expect(screen.getByText('quality_profiles.page')).toBeInTheDocument();
  expect(screen.getByText('quality_gates.page')).toBeInTheDocument();
  expect(screen.queryByText('sca.licenses.page')).not.toBeInTheDocument();
  expect(
    screen.getAllByRole('link', { hidden: true }).map((link) => link.getAttribute('href')),
  ).toEqual(['/coding_rules', '/profiles', '/quality_gates']);
});

it('shows license profiles when SCA and its addon are available', () => {
  addons.sca = { LICENSE_ROUTE_NAME: 'license_profiles' } as NonNullable<typeof addons.sca>;
  renderApp('*', <PoliciesSidebar />, { featureList: [Feature.Sca] });

  expect(screen.getByText('sca.licenses.page')).toBeInTheDocument();
  expect(
    screen.getAllByRole('link', { hidden: true }).map((link) => link.getAttribute('href')),
  ).toEqual(['/coding_rules', '/profiles', '/license_profiles', '/quality_gates']);
});
