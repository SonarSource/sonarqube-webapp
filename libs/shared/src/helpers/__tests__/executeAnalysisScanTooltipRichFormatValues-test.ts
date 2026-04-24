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
import { executeAnalysisScanTooltipRichFormatValues } from '../executeAnalysisScanTooltipRichFormatValues';

describe('executeAnalysisScanTooltipRichFormatValues', () => {
  it('returns only renderers for the requested HTML tags', () => {
    const v = executeAnalysisScanTooltipRichFormatValues('p', 'ul', 'li');

    expect(Object.keys(v).sort((a, b) => a.localeCompare(b))).toEqual(['li', 'p', 'ul']);
    expect(v).not.toHaveProperty('b');
    expect(v).not.toHaveProperty('br');
  });

  it('deduplicates repeated tag names in the argument list', () => {
    const v = executeAnalysisScanTooltipRichFormatValues('p', 'p', 'ul');

    expect(Object.keys(v).sort((a, b) => a.localeCompare(b))).toEqual(['p', 'ul']);
  });

  it('maps tags to native HTML elements and preserves semantic strong emphasis for b', () => {
    const v = executeAnalysisScanTooltipRichFormatValues('b', 'br', 'li', 'p', 'ul');

    expect(v.br()).toEqual(createElement('br'));
    expect(v.b('x')).toEqual(createElement('strong', null, 'x'));
    expect(v.p('intro')).toEqual(createElement('p', null, 'intro'));
    expect(v.li('item')).toEqual(createElement('li', null, 'item'));
    expect(v.ul('inner')).toEqual(createElement('ul', null, 'inner'));
  });
});
