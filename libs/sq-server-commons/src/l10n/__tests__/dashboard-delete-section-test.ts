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
import measuresMessages from '../default/measures.json' with { type: 'json' };

jest.unmock('react-intl');

it.each(['Release readiness', 'Security <checks> & "releases"', 'Long section name '.repeat(12)])(
  'identifies section %s in the actual delete confirmation',
  (sectionName) => {
    const intl = createIntl({ locale: 'en', messages: measuresMessages });

    expect(
      intl.formatMessage({ id: 'dashboard.delete_section_confirm' }, { name: sectionName }),
    ).toBe(
      `Are you sure you want to delete the section, “${sectionName}”?\n\nThis will permanently remove the section and all its widgets.`,
    );
  },
);
