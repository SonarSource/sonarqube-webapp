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

import { createIntl } from 'react-intl';
import portfoliosMessages from '../default/portfolios.json' with { type: 'json' };

jest.unmock('react-intl');

it.each([5, 10, 15])('localizes the configured top-%s limit using the Server catalog', (count) => {
  const intl = createIntl({ locale: 'en', messages: portfoliosMessages });
  expect(
    intl.formatMessage({ id: 'portfolio_dashboard.breakdown.top_list.selection_hint' }, { count }),
  ).toBe(`Choose from the top ${count} rules from the source widget`);
});
