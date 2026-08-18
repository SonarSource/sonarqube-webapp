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

import {
  parseLanguageDistributionCounts,
  stringifyLanguageDistribution,
} from '../languageDistribution';

describe('parseLanguageDistributionCounts', () => {
  it('parses legacy counts and ignores malformed or non-positive entries', () => {
    expect(parseLanguageDistributionCounts('java=10;ts=70.4;css=0;broken;negative=-2')).toEqual({
      java: 10,
      ts: 70,
    });
  });

  it('parses JSON distributions and rounds positive counts', () => {
    expect(parseLanguageDistributionCounts('{"java":10,"ts":"70.4","css":0}')).toEqual({
      java: 10,
      ts: 70,
    });
    expect(parseLanguageDistributionCounts({ java: 10, ts: '70.4', css: 0 })).toEqual({
      java: 10,
      ts: 70,
    });
  });

  it('returns empty counts for empty, invalid, or unsupported data', () => {
    expect(parseLanguageDistributionCounts(undefined)).toEqual({});
    expect(parseLanguageDistributionCounts('  ')).toEqual({});
    expect(parseLanguageDistributionCounts('{oops')).toEqual({});
    expect(parseLanguageDistributionCounts([])).toEqual({});
  });
});

describe('stringifyLanguageDistribution', () => {
  it('converts counts to the legacy semicolon-separated format', () => {
    expect(stringifyLanguageDistribution({ java: 10, ts: 70, css: 20 })).toBe(
      'java=10;ts=70;css=20',
    );
  });
});
