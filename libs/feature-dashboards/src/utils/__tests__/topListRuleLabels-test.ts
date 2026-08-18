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

import { formatRuleDisplayLabel } from '../topListRuleLabels';

describe('formatRuleDisplayLabel', () => {
  it('formats name with language', () => {
    expect(formatRuleDisplayLabel('java:S1', { langName: 'Java', name: 'Rule one' })).toBe(
      '(Java) Rule one',
    );
  });

  it('formats name without language', () => {
    expect(formatRuleDisplayLabel('ts:S2', { name: 'Rule two' })).toBe('Rule two');
  });

  it('falls back to the raw key when the rule is unresolved', () => {
    expect(formatRuleDisplayLabel('java:S99', undefined)).toBe('java:S99');
  });

  it('falls back to the raw key when only the language is known', () => {
    expect(formatRuleDisplayLabel('java:S99', { langName: 'Java' })).toBe('java:S99');
  });

  it('omits the language prefix when includeLanguage is false', () => {
    expect(
      formatRuleDisplayLabel(
        'java:S1',
        { langName: 'Java', name: 'Rule one' },
        {
          includeLanguage: false,
        },
      ),
    ).toBe('Rule one');
  });
});
