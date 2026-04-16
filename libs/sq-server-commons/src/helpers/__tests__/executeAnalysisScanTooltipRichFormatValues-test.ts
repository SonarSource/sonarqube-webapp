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

import { createElement } from 'react';
import {
  SONARQUBE_SERVER_INSTANCE_DISPLAY_NAME,
  executeAnalysisScanTooltipRichFormatValues,
} from '../executeAnalysisScanTooltipRichFormatValues';

describe('executeAnalysisScanTooltipRichFormatValues', () => {
  it('exposes the SonarQube Server product name for permission tooltip messages', () => {
    expect(SONARQUBE_SERVER_INSTANCE_DISPLAY_NAME).toBe('SonarQube Server');
  });

  it('returns pseudo-tag renderers used by execute analysis permission tooltips', () => {
    const v = executeAnalysisScanTooltipRichFormatValues();

    expect(v.br()).toEqual(createElement('br'));
    expect(v.b('x')).toEqual(createElement('strong', null, 'x'));
    expect(v.intro('intro')).toEqual(createElement('p', null, 'intro'));
    expect(v.li('item')).toEqual(createElement('li', null, 'item'));
    expect(v.note('n')).toEqual(createElement('p', null, 'n'));
    expect(v.notetitle('t')).toEqual(createElement('strong', null, 't'));

    const list = v.list('inner');
    expect(list).toEqual(createElement('ul', { className: 'sw-mb-2' }, 'inner'));
  });
});
