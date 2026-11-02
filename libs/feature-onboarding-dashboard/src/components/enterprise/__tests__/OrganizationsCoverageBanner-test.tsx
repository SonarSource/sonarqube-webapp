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
import { byText } from '~shared/helpers/testSelector';
import { OrganizationsCoverageBanner } from '../OrganizationsCoverageBanner';

const banner = (unavailable: number, total: number) =>
  byText(`onboarding_dashboard.enterprise.coverage.banner.${unavailable}.${total}`);

it('says how many organizations the totals leave out', () => {
  renderWithRouter(
    <OrganizationsCoverageBanner
      coverage={{ organizationsTotal: 12, organizationsUnavailable: 3 }}
    />,
  );

  expect(banner(3, 12).get()).toBeInTheDocument();
});

it.each([
  ['everything could be read', { organizationsTotal: 12, organizationsUnavailable: 0 }],
  ['the backend does not report coverage', null],
  ['the coverage is not known yet', undefined],
])('shows nothing when %s', (_name, coverage) => {
  const { container } = renderWithRouter(<OrganizationsCoverageBanner coverage={coverage} />);

  expect(container).toBeEmptyDOMElement();
});
